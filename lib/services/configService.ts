import { prisma } from "../prisma";

export type ConfigInput = {
  bolsista: string;
  orientador: string;
  laboratorio: string;
  bolsa: string;
  weeklyWorkloadHours: number;
};

class ConfigService {
  async getConfig() {
    return prisma.config.findFirst();
  }

  async saveConfig(data: ConfigInput) {
    const existing = await prisma.config.findFirst();
    if (existing) {
      return prisma.config.update({
        where: { id: existing.id },
        data,
      });
    }
    return prisma.config.create({ data });
  }
}

export const configService = new ConfigService();
