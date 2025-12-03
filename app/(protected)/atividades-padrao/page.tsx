export const dynamic = "force-dynamic";

import { DefaultActivitiesManager } from "@/components/default-activities-manager";
import { prisma } from "@/lib/prisma";

export default async function AtividadesPadraoPage() {
  const activities = await prisma.defaultActivity.findMany({
    orderBy: [{ priority: "asc" }, { description: "asc" }],
  });

  const serialized = activities.map((activity) => ({
    id: activity.id,
    description: activity.description,
    hours: activity.hours,
    priority: activity.priority,
  }));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Atividades padrão
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Preenchimento automático
        </h1>
        <p className="text-slate-600">
          Defina atividades usadas para completar dias vazios do mês.
        </p>
      </div>
      <DefaultActivitiesManager initialActivities={serialized} />
    </div>
  );
}
