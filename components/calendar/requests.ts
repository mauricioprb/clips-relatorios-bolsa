import { getMonthRange } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { monthService } from "@/lib/services/monthService";
import type { IUser } from "@/components/calendar/interfaces";

const combineDateAndTime = (date: Date, time: string) => {
  // Usa os campos UTC da data (vinda do DB em UTC 00:00) e monta string sem timezone,
  // garantindo que 08:00 permaneça 08:00 no calendário independente do fuso local.
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${time}:00`;
};

export const getEvents = async (year: number, month: number, user: IUser) => {
  // Garante que a grade semanal e atividades padrão sejam aplicadas sempre que o calendário carregar
  await monthService.fillBlanks(year, month);

  const { start, end } = getMonthRange(year, month);
  const entries = await prisma.dayEntry.findMany({
    where: { date: { gte: start, lt: end } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  if (entries.length === 0) return [];

  return entries.map((entry) => ({
    id: entry.id,
    startDate: combineDateAndTime(entry.date, entry.startTime),
    endDate: combineDateAndTime(entry.date, entry.endTime),
    title: entry.description,
    color: "blue" as const,
    description: entry.description,
    user,
  }));
};

export const getUsers = async () => {
  const config = await prisma.config.findFirst();
  const mainUser: IUser = {
    id: config?.id || "main-user",
    name: config?.bolsista || "Bolsista",
    picturePath: null,
  };

  return [mainUser];
};
