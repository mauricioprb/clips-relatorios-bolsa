import { prisma } from "../prisma";

export type WeeklySlotInput = {
  weekday: number;
  startTime: string;
  endTime: string;
  description: string;
};

class WeeklySlotService {
  async list() {
    return prisma.weeklySlot.findMany({
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    });
  }

  async create(data: WeeklySlotInput) {
    return prisma.weeklySlot.create({ data });
  }

  async update(id: string, data: WeeklySlotInput) {
    return prisma.weeklySlot.update({ where: { id }, data });
  }

  async delete(id: string) {
    await prisma.weeklySlot.delete({ where: { id } });
  }
}

export const weeklySlotService = new WeeklySlotService();
