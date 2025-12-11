import { prisma } from "../prisma";

export type DefaultActivityInput = {
  description: string;
  color: string;
};

class DefaultActivityService {
  async list(userId: string) {
    return prisma.defaultActivity.findMany({
      where: { userId },
      orderBy: [{ description: "asc" }],
    });
  }

  async create(data: DefaultActivityInput, userId: string) {
    return prisma.defaultActivity.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async update(id: string, data: DefaultActivityInput, userId: string) {
    const activity = await prisma.defaultActivity.findUnique({ where: { id } });
    if (!activity || activity.userId !== userId) {
      throw new Error("Unauthorized or not found");
    }
    return prisma.defaultActivity.update({
      where: { id },
      data,
    });
  }

  async delete(id: string, userId: string) {
    const activity = await prisma.defaultActivity.findUnique({ where: { id } });
    if (!activity || activity.userId !== userId) {
      throw new Error("Unauthorized or not found");
    }
    await prisma.defaultActivity.delete({ where: { id } });
  }
}

export const defaultActivityService = new DefaultActivityService();
