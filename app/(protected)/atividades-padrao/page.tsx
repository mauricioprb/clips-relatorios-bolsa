export const dynamic = "force-dynamic";

import { DefaultActivitiesManager } from "@/components/default-activities-manager";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AtividadesPadraoPage() {
  const session = await getSessionFromCookies();
  if (!session?.id) {
    redirect("/entrar");
  }

  const activities = await prisma.defaultActivity.findMany({
    where: { userId: session.id },
    orderBy: [{ description: "asc" }],
  });

  const serialized = activities.map(
    (activity: { id: string; description: string; color: string }) => ({
      id: activity.id,
      description: activity.description,
      color: activity.color,
    }),
  );

  return (
    <div className="space-y-4">
      <PageHeader
        kicker="Atividades padrão"
        title="Preenchimento automático"
        description="Defina atividades usadas para completar a carga horária semanal ao preencher dias vazios."
      />
      <DefaultActivitiesManager initialActivities={serialized} />
    </div>
  );
}
