import { prisma } from "../prisma";
import { calculateHours, getMonthRange } from "../dates";

export type DayEntryInput = {
  date: string | Date;
  startTime: string;
  endTime: string;
  description: string;
  hours?: number;
  color?: string;
};

class DayEntryService {
  async listAll() {
    return prisma.dayEntry.findMany({
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  }

  async listByMonth(year: number, month: number) {
    const { start, end } = getMonthRange(year, month);
    return prisma.dayEntry.findMany({
      where: { date: { gte: start, lt: end } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  }

  async listByYear(year: number) {
    const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));
    return prisma.dayEntry.findMany({
      where: { date: { gte: start, lt: end } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
  }

  async create(input: DayEntryInput) {
    const parsedDate = new Date(input.date);
    const computedHours = Math.max(
      typeof input.hours === "number" && !Number.isNaN(input.hours)
        ? input.hours
        : calculateHours(input.startTime, input.endTime),
      0,
    );
    return prisma.dayEntry.create({
      data: {
        date: parsedDate,
        startTime: input.startTime,
        endTime: input.endTime,
        description: input.description,
        hours: computedHours,
        color: input.color || "azul",
      },
    });
  }

  async update(id: string, input: DayEntryInput) {
    const parsedDate = new Date(input.date);
    const computedHours = Math.max(
      typeof input.hours === "number" && !Number.isNaN(input.hours)
        ? input.hours
        : calculateHours(input.startTime, input.endTime),
      0,
    );
    return prisma.dayEntry.update({
      where: { id },
      data: {
        date: parsedDate,
        startTime: input.startTime,
        endTime: input.endTime,
        description: input.description,
        hours: computedHours,
        color: input.color || "azul",
      },
    });
  }

  async delete(id: string) {
    await prisma.dayEntry.delete({ where: { id } });
  }
}

export const dayEntryService = new DayEntryService();
