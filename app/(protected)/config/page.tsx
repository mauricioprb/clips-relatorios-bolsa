export const dynamic = "force-dynamic";

import { ConfigForm } from "@/components/config-form";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";

export default async function ConfigPage() {
  const config = await prisma.config.findFirst();
  const serialized = config
    ? {
        bolsista: config.bolsista,
        orientador: config.orientador,
        laboratorio: config.laboratorio,
        bolsa: config.bolsa,
        weeklyWorkloadHours: config.weeklyWorkloadHours,
      }
    : null;

  return (
    <div className="space-y-4">
      <PageHeader
        kicker="Configurações"
        title="Dados do bolsista"
        description="Informe os dados fixos (incluindo a carga horária semanal da bolsa) que aparecerão no cabeçalho do relatório."
      />
      <ConfigForm initialData={serialized} />
    </div>
  );
}
