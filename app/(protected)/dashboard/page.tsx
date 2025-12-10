export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { CalendarSkeleton } from "@/components/calendar/skeletons/calendar-skeleton";
import { Calendar } from "@/components/calendar/calendar";

export default async function Dashboard() {
  const [config, weeklyCount, defaultsCount, entriesCount] = await Promise.all([
    prisma.config.findFirst(),
    prisma.weeklySlot.count(),
    prisma.defaultActivity.count(),
    prisma.dayEntry.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">BagUnça</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Olá, {config?.bolsista || "bolsista"}!
          </h1>
          <p className="text-slate-600">
            Gerencie sua configuração e atividades para gerar o relatório mensal.
          </p>
        </div>
        <Link href="/mes" className="btn-primary">
          Preencher mês
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          title="Dados do bolsista"
          value={config ? "Configurado" : "Pendente"}
          description={
            config ? `${config.bolsista} · ${config.orientador}` : "Cadastre em Configurações"
          }
          href="/config"
        />
        <DashboardCard
          title="Grade semanal"
          value={`${weeklyCount} item(s)`}
          description="Horários recorrentes por dia da semana"
          href="/grade-semanal"
        />
        <DashboardCard
          title="Atividades padrão"
          value={`${defaultsCount} item(s)`}
          description="Usadas para preencher dias em branco"
          href="/atividades-padrao"
        />
        <DashboardCard
          title="Lançamentos mensais"
          value={`${entriesCount} atividade(s) registradas`}
          description="Consulte e edite por mês"
          href="/mes"
        />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-slate-900">Próximos passos</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-4 text-slate-700">
          <li>Cadastre seus dados em Configurações.</li>
          <li>Defina a grade semanal e atividades padrão.</li>
          <li>Preencha ou gere as atividades do mês.</li>
          <li>Gere o PDF do relatório e envie para o orientador.</li>
        </ol>
      </div>
      <Suspense fallback={<CalendarSkeleton />}>
        <Calendar />
      </Suspense>
    </div>
  );
}

type CardProps = {
  title: string;
  value: string;
  description: string;
  href: string;
};

function DashboardCard({ title, value, description, href }: CardProps) {
  return (
    <Link href={href} className="card block transition hover:-translate-y-0.5">
      <p className="text-sm uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
    </Link>
  );
}
