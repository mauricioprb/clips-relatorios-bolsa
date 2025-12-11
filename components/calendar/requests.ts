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
  // Busca eventos do ano inteiro para permitir a visualização anual correta
  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));

  const entries = await prisma.dayEntry.findMany({
    where: {
      userId: user.id,
      date: { gte: start, lt: end },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  if (entries.length === 0) return [];

  return entries.map(
    (entry: {
      id: string;
      date: Date;
      startTime: string;
      endTime: string;
      description: string;
      color: string | null;
    }) => ({
      id: entry.id,
      startDate: combineDateAndTime(entry.date, entry.startTime),
      endDate: combineDateAndTime(entry.date, entry.endTime),
      title: entry.description,
      color: (entry.color as any) || "azul",
      description: entry.description,
      user,
    }),
  );
};

export const getUsers = async (userId: string) => {
  if (!userId) return [];
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const mainUser: IUser = {
    id: user?.id || "main-user",
    name: user?.name || "Bolsista",
    picturePath: null,
  };

  return [mainUser];
};
