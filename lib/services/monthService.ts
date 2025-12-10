import type { DayEntry, DefaultActivity } from "@prisma/client";
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
  Number(process.env.MORNING_TARGET_HOURS) && Number(process.env.MORNING_TARGET_HOURS) > 0
    ? Number(process.env.MORNING_TARGET_HOURS)
    : 4;
const DEFAULT_WEEKLY_WORKLOAD = 20;
const WORKING_DAYS_PER_WEEK = 5;

const toDayKey = (date: Date) => date.toISOString().substring(0, 10);
const sortByStart = <T extends { startTime: string }>(list: T[]) =>
  list.sort((a, b) => a.startTime.localeCompare(b.startTime));

const bumpPastOverlap = (startTime: string, entries: { startTime: string; endTime: string }[]) => {
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

const sumHours = (entries: Pick<DayEntry, "hours">[]) =>
  entries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

const getWeekStartKey = (date: Date) => {
  const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const weekday = copy.getUTCDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  copy.setUTCDate(copy.getUTCDate() + diff);
  return toDayKey(copy);
};

const groupWorkingDaysByWeek = (days: Date[]) => {
  const byWeek: Record<string, Date[]> = {};
  days.forEach((day) => {
    const key = getWeekStartKey(day);
    byWeek[key] = byWeek[key] ? [...byWeek[key], day] : [day];
  });
  return Object.values(byWeek)
    .map((week) => week.sort((a, b) => a.getTime() - b.getTime()))
    .sort((a, b) => a[0].getTime() - b[0].getTime());
};

const buildPriorityQueue = (defaults: DefaultActivity[]) => {
  const sorted = [...defaults].sort((a, b) => a.description.localeCompare(b.description));
  const queue: DefaultActivity[] = [];
  for (const item of sorted) {
    const weight = 3;
    for (let i = 0; i < weight; i += 1) {
      queue.push(item);
    }
  }
  return queue;
};

class MonthService {
  async fillBlanks(year: number, month: number) {
    const config = await prisma.config.findFirst();
    if (!config || !config.weeklyWorkloadHours || config.weeklyWorkloadHours <= 0) {
      throw new Error(
        "Informe a carga horária semanal da bolsa na página de Configurações antes de preencher o mês.",
      );
    }

    const weeklyTarget = config.weeklyWorkloadHours || DEFAULT_WEEKLY_WORKLOAD;

    const weeklySlots = await weeklySlotService.list();
    const defaults = await defaultActivityService.list();
    const priorityQueue = buildPriorityQueue(defaults);
    const dailyTarget = weeklyTarget / WORKING_DAYS_PER_WEEK;

    if (priorityQueue.length === 0 && weeklySlots.length === 0) {
      return {
        message: "Nenhuma grade semanal ou atividade padrão cadastrada para preencher.",
        criados: 0,
        diasCriados: [],
        cargaHorariaSemanal: weeklyTarget,
        horarioInicial: AFTERNOON_START_TIME,
      };
    }

    const { start, end } = getMonthRange(year, month);
    const existingEntries = await prisma.dayEntry.findMany({
      where: { date: { gte: start, lt: end } },
    });
    const entriesByDay = existingEntries.reduce<Record<string, DayEntry[]>>((acc, entry) => {
      const key = toDayKey(entry.date);
      acc[key] = acc[key] ? [...acc[key], entry] : [entry];
      return acc;
    }, {});

    const created: { id: string; date: Date }[] = [];
    let priorityIndex = 0;

    const workingWeeks = groupWorkingDaysByWeek(getWorkingDays(year, month));

    for (const week of workingWeeks) {
      for (const day of week) {
        const key = toDayKey(day);
        const dayEntries = entriesByDay[key] ? [...entriesByDay[key]] : [];
        const slotsForDay = weeklySlots.filter((slot) => slot.weekday === day.getUTCDay());

        for (const slot of slotsForDay) {
          const hours = Math.max(calculateHours(slot.startTime, slot.endTime), 0);
          const existingMatch = dayEntries.find((entry) => entry.description === slot.description);

          if (existingMatch) {
            const updated = await prisma.dayEntry.update({
              where: { id: existingMatch.id },
              data: {
                startTime: slot.startTime,
                endTime: slot.endTime,
                hours,
                color: "cinza",
              },
            });
            const idx = dayEntries.findIndex((e) => e.id === existingMatch.id);
            if (idx >= 0) {
              dayEntries[idx] = updated;
            }
            continue;
          }

          const entry = await prisma.dayEntry.create({
          const entry = await prisma.dayEntry.create({
            data: {
              date: day,
              description: slot.description,
              startTime: slot.startTime,
              endTime: slot.endTime,
              hours,
              color: "cinza",
            },
          });
          dayEntries.push(entry);
          created.push({ id: entry.id, date: entry.date });
        }

        if (dayEntries.length > 0) {
          entriesByDay[key] = dayEntries;
        }
      }

      if (priorityQueue.length === 0) {
        continue;
      }

      for (let i = 0; i < week.length; i += 1) {
        const day = week[i];
        const key = toDayKey(day);
        const dayEntries = entriesByDay[key] ? [...entriesByDay[key]] : [];
        const currentHours = sumHours(dayEntries);
        const neededForDay = Math.max(dailyTarget - currentHours, 0);

        if (neededForDay <= 0) {
          entriesByDay[key] = dayEntries;
          continue;
        }

        const { updatedEntries, nextIndex } = await this.fillDayWithDefaults({
          day,
          dayEntries,
          neededHours: neededForDay,
          priorityQueue,
          priorityIndex,
          created,
        });

        entriesByDay[key] = updatedEntries;
        priorityIndex = nextIndex;
      }
    }

    return {
      message: "Dias preenchidos",
      criados: created.length,
      diasCriados: created.map((item) => toDayKey(item.date)),
      cargaHorariaSemanal: weeklyTarget,
      horarioInicial: AFTERNOON_START_TIME,
    };
  }

  private async fillDayWithDefaults({
    day,
    dayEntries,
    neededHours,
    priorityQueue,
    priorityIndex,
    created,
  }: {
    day: Date;
    dayEntries: DayEntry[];
    neededHours: number;
    priorityQueue: DefaultActivity[];
    priorityIndex: number;
    created: { id: string; date: Date }[];
  }) {
    let remaining = neededHours;
    let added = 0;
    const sortedEntries = sortByStart([...dayEntries]);

    const fillShift = async (startTime: string, maxHours: number, endTime?: string) => {
      let shiftUsed = 0;
      let cursor = startTime;
      let safety = 0;

      while (remaining > 0 && shiftUsed < maxHours) {
        cursor = bumpPastOverlap(cursor, sortedEntries);
        if (endTime && parseHoursFromTime(cursor) >= parseHoursFromTime(endTime)) {
          break;
        }
        const shiftRemaining = Math.min(maxHours - shiftUsed, remaining);
        if (shiftRemaining <= 0) break;

        const nextBlocker = sortByStart(
          sortedEntries.filter(
            (entry) => parseHoursFromTime(entry.startTime) > parseHoursFromTime(cursor),
          ),
        )[0];

        let windowHours = nextBlocker
          ? Math.max(calculateHours(cursor, nextBlocker.startTime), 0)
          : shiftRemaining;

        if (endTime) {
          windowHours = Math.min(windowHours, Math.max(calculateHours(cursor, endTime), 0));
        }

        const hoursToUse = Math.min(shiftRemaining, windowHours);

        if (hoursToUse <= 0) {
          if (nextBlocker) {
            cursor = nextBlocker.endTime;
            continue;
          }
          safety += 1;
          if (safety > (priorityQueue.length || 1) * 2) break;
          continue;
        }

        const activity = priorityQueue[priorityIndex % priorityQueue.length];
        priorityIndex += 1;

        const computedEndTime = addHoursToTime(cursor, hoursToUse);

        const entry = await prisma.dayEntry.create({
          data: {
            date: day,
            description: activity.description,
            startTime: cursor,
            endTime: computedEndTime,
            hours: hoursToUse,
            color: activity.color,
          },
        });

        dayEntries.push(entry);
        sortedEntries.push(entry);
        sortByStart(sortedEntries);
        created.push({ id: entry.id, date: entry.date });

        remaining -= hoursToUse;
        shiftUsed += hoursToUse;
        added += hoursToUse;
        cursor = computedEndTime;
      }
    };

    const morningHours = Math.min(remaining, MORNING_TARGET_HOURS);
    if (morningHours > 0) {
      await fillShift(MORNING_START_TIME, morningHours, AFTERNOON_START_TIME);
    }

    if (remaining > 0) {
      await fillShift(AFTERNOON_START_TIME, remaining);
    }

    return {
      added,
      updatedEntries: dayEntries,
      nextIndex: priorityIndex,
    };
  }
}

export const monthService = new MonthService();
