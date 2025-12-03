import { prisma } from "../prisma";

export type DefaultActivityInput = {
  description: string;
  hours: number;
  priority: number;
};

class DefaultActivityService {
  async list() {
    return prisma.defaultActivity.findMany({
      orderBy: [{ priority: "asc" }, { description: "asc" }],
    });
  }

  async create(data: DefaultActivityInput) {
    return prisma.defaultActivity.create({ data });
  }

  async update(id: string, data: DefaultActivityInput) {
    return prisma.defaultActivity.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await prisma.defaultActivity.delete({ where: { id } });
  }
}

export const defaultActivityService = new DefaultActivityService();
