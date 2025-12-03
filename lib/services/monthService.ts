import { defaultActivityService } from "./defaultActivityService";
import { dayEntryService } from "./dayEntryService";
import { addHoursToTime, getWorkingDays, getMonthRange } from "../dates";
import { prisma } from "../prisma";

const DEFAULT_START_TIME = process.env.REPORT_START_TIME || "14:00";

const toDayKey = (date: Date) => date.toISOString().substring(0, 10);

class MonthService {
  async fillBlanks(year: number, month: number) {
    const dailyTarget =
      Number(process.env.DAILY_TARGET_HOURS) &&
      Number(process.env.DAILY_TARGET_HOURS) > 0
        ? Number(process.env.DAILY_TARGET_HOURS)
        : 4;

    const defaults = await defaultActivityService.list();
    if (defaults.length === 0) {
      throw new Error("Cadastre atividades padrão antes de preencher os dias.");
    }

    const { start, end } = getMonthRange(year, month);
    const existingEntries = await prisma.dayEntry.findMany({
      where: { date: { gte: start, lt: end } },
    });
    const existingMap = existingEntries.reduce<Record<string, number>>(
      (acc, entry) => {
        const key = toDayKey(entry.date);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {}
    );

    const created: { id: string; date: Date }[] = [];

    for (const day of getWorkingDays(year, month)) {
      const key = toDayKey(day);
      if (existingMap[key]) continue;

      let accumulated = 0;
      let currentStart = DEFAULT_START_TIME;

      for (const activity of defaults) {
        if (accumulated >= dailyTarget) break;
        const remaining = dailyTarget - accumulated;
        const hoursToUse = Math.min(activity.hours, remaining);
        if (hoursToUse <= 0) continue;

        const endTime = addHoursToTime(currentStart, hoursToUse);

        const entry = await prisma.dayEntry.create({
          data: {
            date: day,
            description: activity.description,
            startTime: currentStart,
            endTime,
            hours: hoursToUse,
          },
        });

        created.push({ id: entry.id, date: entry.date });
        accumulated += hoursToUse;
        currentStart = endTime;
      }
    }

    return {
      message: "Dias preenchidos",
      criados: created.length,
      diasCriados: created.map((item) => toDayKey(item.date)),
      metaDiaria: dailyTarget,
      horarioInicial: DEFAULT_START_TIME,
    };
  }
}

export const monthService = new MonthService();
