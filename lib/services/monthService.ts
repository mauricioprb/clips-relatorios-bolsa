import { defaultActivityService } from "./defaultActivityService";
import { weeklySlotService } from "./weeklySlotService";
import {
  addHoursToTime,
  calculateHours,
  parseHoursFromTime,
  getWorkingDays,
  getMonthRange,
} from "../dates";
import { prisma } from "../prisma";

const AFTERNOON_START_TIME = process.env.REPORT_START_TIME || "14:00";
const MORNING_START_TIME = process.env.MORNING_START_TIME || "08:00";
const MORNING_TARGET_HOURS =
  Number(process.env.MORNING_TARGET_HOURS) &&
  Number(process.env.MORNING_TARGET_HOURS) > 0
    ? Number(process.env.MORNING_TARGET_HOURS)
    : 4;

const toDayKey = (date: Date) => date.toISOString().substring(0, 10);

class MonthService {
  async fillBlanks(year: number, month: number) {
    const envTarget = Number(process.env.DAILY_TARGET_HOURS);
    const dailyTarget =
      envTarget && envTarget > 0 ? Math.max(envTarget, 8) : 8;

    const weeklySlots = await weeklySlotService.list();
    const defaults = await defaultActivityService.list();
    if (defaults.length === 0 && weeklySlots.length === 0) {
      return {
        message:
          "Nenhuma grade semanal ou atividade padrão cadastrada para preencher.",
        criados: 0,
        diasCriados: [],
        metaDiaria: dailyTarget,
        horarioInicial: AFTERNOON_START_TIME,
      };
    }

    const { start, end } = getMonthRange(year, month);
    const existingEntries = await prisma.dayEntry.findMany({
      where: { date: { gte: start, lt: end } },
    });
    const entriesByDay = existingEntries.reduce<Record<string, typeof existingEntries>>(
      (acc, entry) => {
        const key = toDayKey(entry.date);
        acc[key] = acc[key] ? [...acc[key], entry] : [entry];
        return acc;
      },
      {}
    );

    const created: { id: string; date: Date }[] = [];

    const sortByStart = (
      list: { startTime: string }[]
    ) => list.sort((a, b) => a.startTime.localeCompare(b.startTime));

    const bumpPastOverlap = (
      startTime: string,
      entries: { startTime: string; endTime: string }[]
    ) => {
      let candidate = startTime;
      for (const entry of sortByStart([...entries])) {
        const inRange =
          parseHoursFromTime(entry.startTime) <= parseHoursFromTime(candidate) &&
          parseHoursFromTime(candidate) < parseHoursFromTime(entry.endTime);
        if (inRange) {
          candidate = entry.endTime;
        }
      }
      return candidate;
    };

    for (const day of getWorkingDays(year, month)) {
      const key = toDayKey(day);
      const dayEntries = entriesByDay[key] ? [...entriesByDay[key]] : [];

      const slotsForDay = weeklySlots.filter(
        (slot) => slot.weekday === day.getUTCDay()
      );

      for (const slot of slotsForDay) {
        const hours = Math.max(calculateHours(slot.startTime, slot.endTime), 0);
        const existingMatch = dayEntries.find(
          (entry) => entry.description === slot.description
        );

        if (existingMatch) {
          const updated = await prisma.dayEntry.update({
            where: { id: existingMatch.id },
            data: {
              startTime: slot.startTime,
              endTime: slot.endTime,
              hours,
            },
          });
          const idx = dayEntries.findIndex((e) => e.id === existingMatch.id);
          if (idx >= 0) {
            dayEntries[idx] = updated;
          }
          continue;
        }

        const entry = await prisma.dayEntry.create({
          data: {
            date: day,
            description: slot.description,
            startTime: slot.startTime,
            endTime: slot.endTime,
            hours,
          },
        });

        dayEntries.push(entry);
        created.push({ id: entry.id, date: entry.date });
      }

      if (dayEntries.length > 0) {
        entriesByDay[key] = dayEntries;
      }

      let currentHours = dayEntries.reduce(
        (sum, entry) => sum + (entry.hours || 0),
        0
      );

      if (currentHours >= dailyTarget) {
        entriesByDay[key] = dayEntries;
        continue;
      }

      if (defaults.length === 0) continue;

      let remainingTarget = dailyTarget - currentHours;
      let defaultIndex = 0;
      const sortedEntries = sortByStart([...dayEntries]);

      const fillShift = async (
        startTime: string,
        maxHours: number,
        endTime?: string
      ) => {
        let shiftUsed = 0;
        let cursor = startTime;
        let safety = 0;

        while (remainingTarget > 0 && shiftUsed < maxHours) {
          cursor = bumpPastOverlap(cursor, sortedEntries);
          if (endTime && parseHoursFromTime(cursor) >= parseHoursFromTime(endTime)) {
            break;
          }
          const shiftRemaining = Math.min(maxHours - shiftUsed, remainingTarget);
          if (shiftRemaining <= 0) break;

          const nextBlocker = sortByStart(
            sortedEntries.filter(
              (entry) =>
                parseHoursFromTime(entry.startTime) >
                parseHoursFromTime(cursor)
            )
          )[0];

          let windowHours = nextBlocker
            ? Math.max(
                calculateHours(cursor, nextBlocker.startTime),
                0
              )
            : shiftRemaining;

          if (endTime) {
            windowHours = Math.min(
              windowHours,
              Math.max(calculateHours(cursor, endTime), 0)
            );
          }

          const activity = defaults[defaultIndex];
          defaultIndex = (defaultIndex + 1) % defaults.length;

          const hoursToUse = Math.min(
            activity.hours,
            shiftRemaining,
            windowHours
          );

          if (hoursToUse <= 0) {
            if (nextBlocker) {
              cursor = nextBlocker.endTime;
              continue;
            }
            safety += 1;
            if (safety > defaults.length * 2) break;
            continue;
          }

          const computedEndTime = addHoursToTime(cursor, hoursToUse);

          const entry = await prisma.dayEntry.create({
            data: {
              date: day,
              description: activity.description,
              startTime: cursor,
              endTime: computedEndTime,
              hours: hoursToUse,
            },
          });

          dayEntries.push(entry);
          sortedEntries.push(entry);
          sortByStart(sortedEntries);
          created.push({ id: entry.id, date: entry.date });

          remainingTarget -= hoursToUse;
          shiftUsed += hoursToUse;
          currentHours += hoursToUse;
          cursor = computedEndTime;
        }
      };

      const morningHours = Math.min(remainingTarget, MORNING_TARGET_HOURS);
      if (morningHours > 0) {
        await fillShift(MORNING_START_TIME, morningHours, AFTERNOON_START_TIME);
      }

      if (remainingTarget > 0) {
        await fillShift(AFTERNOON_START_TIME, remainingTarget);
      }

      entriesByDay[key] = dayEntries;
    }

    return {
      message: "Dias preenchidos",
      criados: created.length,
      diasCriados: created.map((item) => toDayKey(item.date)),
      metaDiaria: dailyTarget,
      horarioInicial: AFTERNOON_START_TIME,
    };
  }
}

export const monthService = new MonthService();
