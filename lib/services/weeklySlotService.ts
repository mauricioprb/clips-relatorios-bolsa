import { prisma } from "../prisma";

export type WeeklySlotInput = {
  weekday: number;
  startTime: string;
  endTime: string;
  description: string;
  startDate?: string | null;
  endDate?: string | null;
};

class WeeklySlotService {
  async list(userId: string) {
    return prisma.weeklySlot.findMany({
      where: { userId },
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    });
  }

  async create(data: WeeklySlotInput, userId: string) {
    return prisma.weeklySlot.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async update(id: string, data: WeeklySlotInput, userId: string) {
    // Ensure the slot belongs to the user
    const slot = await prisma.weeklySlot.findUnique({ where: { id } });
    if (!slot || slot.userId !== userId) {
      throw new Error("Unauthorized or not found");
    }
    return prisma.weeklySlot.update({ where: { id }, data });
  }

  async delete(id: string, userId: string) {
    // Ensure the slot belongs to the user
    const slot = await prisma.weeklySlot.findUnique({ where: { id } });
    if (!slot || slot.userId !== userId) {
      throw new Error("Unauthorized or not found");
    }
    await prisma.weeklySlot.delete({ where: { id } });
  }
}

export const weeklySlotService = new WeeklySlotService();
