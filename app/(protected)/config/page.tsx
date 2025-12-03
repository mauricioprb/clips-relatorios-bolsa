export const dynamic = "force-dynamic";

import { ConfigForm } from "@/components/ConfigForm";
import { prisma } from "@/lib/prisma";

export default async function ConfigPage() {
  const config = await prisma.config.findFirst();
  const serialized = config
    ? {
        bolsista: config.bolsista,
        orientador: config.orientador,
        laboratorio: config.laboratorio,
        bolsa: config.bolsa,
      }
    : null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          Configurações
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Dados do bolsista
        </h1>
        <p className="text-slate-600">
          Informe os dados fixos que aparecerão no cabeçalho do relatório.
        </p>
      </div>
      <ConfigForm initialData={serialized} />
    </div>
  );
}
