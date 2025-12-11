export const dynamic = "force-dynamic";

import { ConfigForm } from "@/components/config-form";
import { PageHeader } from "@/components/page-header";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ConfigPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session?.id) {
    redirect("/entrar");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
  });

  if (!user) {
    redirect("/entrar");
  }

  const serialized = {
    email: user.email,
    bolsista: user.name || "",
    orientador: user.orientador || "",
    laboratorios: user.laboratorios.length > 0 ? user.laboratorios : [],
    bolsa: user.bolsa || "",
    weeklyWorkloadHours: user.weeklyWorkloadHours || 20,
    customHolidays: user.customHolidays || "",
  };

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
