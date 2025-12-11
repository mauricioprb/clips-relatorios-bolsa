import { prisma } from "./prisma";
import { getWorkingDays, getMonthRange } from "./dates";
import { formatInterval } from "./formatters";
import { getHoliday } from "./holidays";

export type ReportDay = {
  date: Date;
  dayLabel: string;
  scheduleText: string;
  activitiesText: string;
  dailyHours: number;
};

export type ReportData = {
  year: number;
  month: number;
  config: {
    bolsista: string;
    orientador: string;
    laboratorios: string[];
    bolsa: string;
    weeklyWorkloadHours: number;
  };
  days: ReportDay[];
  totalHours: number;
};

const toDayKey = (date: Date) => date.toISOString().substring(0, 10);

export async function fetchReportData(year: number, month: number, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const configData = user
    ? {
        bolsista: user.name || "Não informado",
        orientador: user.orientador || "Não informado",
        laboratorios: user.laboratorios.length > 0 ? user.laboratorios : ["Não informado"],
        bolsa: user.bolsa || "Não informada",
        weeklyWorkloadHours: user.weeklyWorkloadHours || 0,
      }
    : {
        bolsista: "Não informado",
        orientador: "Não informado",
        laboratorios: ["Não informado"],
        bolsa: "Não informada",
        weeklyWorkloadHours: 0,
      };

  let customHolidays = [];
  try {
    if (user?.customHolidays) {
      customHolidays = JSON.parse(user.customHolidays);
    }
  } catch (e) {
    console.error("Failed to parse custom holidays", e);
  }

  const { start, end } = getMonthRange(year, month);
  const entries = await prisma.dayEntry.findMany({
    where: {
      date: { gte: start, lt: end },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  const entriesByDay = entries.reduce<Record<string, typeof entries>>((acc, entry) => {
    const key = toDayKey(entry.date);
    acc[key] = acc[key] ? [...acc[key], entry] : [entry];
    return acc;
  }, {});

  const days = getWorkingDays(year, month)
    .filter((day) => !getHoliday(toDayKey(day), customHolidays))
    .map((day) => {
      const key = toDayKey(day);
      const dayEntries = entriesByDay[key] || [];
      const scheduleText =
        dayEntries.length > 0
          ? dayEntries.map((entry) => formatInterval(entry.startTime, entry.endTime)).join(" | ")
          : "-";
      const activitiesText =
        dayEntries.length > 0 ? dayEntries.map((entry) => entry.description).join("; ") : "-";
      const dailyHours = dayEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);

      return {
        date: day,
        dayLabel: day.toLocaleDateString("pt-BR", { timeZone: "UTC" }),
        scheduleText,
        activitiesText,
        dailyHours,
      };
    });

  const totalHours = days.reduce((sum, day) => sum + day.dailyHours, 0);

  const reportData: ReportData = {
    year,
    month,
    config: {
      bolsista: configData.bolsista,
      orientador: configData.orientador,
      laboratorios: configData.laboratorios,
      bolsa: configData.bolsa,
      weeklyWorkloadHours: configData.weeklyWorkloadHours ?? 0,
    },
    days,
    totalHours,
  };

  return reportData;
}
