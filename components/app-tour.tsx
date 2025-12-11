"use client";

import { useEffect, useState } from "react";
import { TourProvider, useTour, TourStep, TourAlertDialog } from "@/components/tour";

const steps: TourStep[] = [
  {
    selectorId: "nav-mes",
    content: (
      <div>
        <h3 className="font-bold mb-2">Visão Mensal</h3>
        <p className="text-sm">
          Este é o coração do sistema. Aqui você vê o calendário completo.
          <br />
          <br />
          <strong>Clique em qualquer dia</strong> para adicionar, editar ou remover atividades
          manualmente.
          <br />
          Use o botão <strong>&quot;Complentar dias&quot;</strong> para completar automaticamente os
          dias sem registro usando suas atividades padrão e grade semanal fixa.
        </p>
      </div>
    ),
    position: "bottom",
  },
  {
    selectorId: "nav-grade-semanal",
    content: (
      <div>
        <h3 className="font-bold mb-2">Grade Semanal</h3>
        <p className="text-sm">
          Configure sua rotina fixa (aulas, reuniões, etc).
          <br />O sistema usará esses horários para saber quando você já está ocupado e não agendará
          atividades automáticas nesses períodos.
        </p>
      </div>
    ),
    position: "bottom",
  },
  {
    selectorId: "nav-atividades-padrao",
    content: (
      <div>
        <h3 className="font-bold mb-2">Atividades Padrão</h3>
        <p className="text-sm">
          Cadastre atividades genéricas (ex: &quot;Dissertação&quot;, &quot;Pesquisa&quot;,
          &quot;Leitura&quot;).
          <br />
          Essas atividades serão usadas rotativamente (prioridade) para preencher os
          &quot;buracos&quot; na sua agenda até atingir a carga horária semanal.
        </p>
      </div>
    ),
    position: "bottom",
  },
  {
    selectorId: "nav-configuracoes",
    content: (
      <div>
        <h3 className="font-bold mb-2">Configurações</h3>
        <p className="text-sm">
          Mantenha seus dados atualizados (Nome, Orientador, Bolsa, Carga Horária).
          <br />
          Essas informações são essenciais para gerar o cabeçalho correto do seu relatório mensal em
          PDF. Além de permitir ajustar os feriados conforme sua instituição.
        </p>
      </div>
    ),
    position: "bottom",
  },
];

function TourContent() {
  const { setSteps, setIsTourCompleted } = useTour();
  const [isDialogOpen, setIsDialogOpen] = useState(true);

  useEffect(() => {
    setSteps(steps);
  }, [setSteps]);

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setIsTourCompleted(true);
      localStorage.setItem("tour-completed", "true");
    }
  };

  return <TourAlertDialog isOpen={isDialogOpen} setIsOpen={handleOpenChange} />;
}

export function AppTour({ children }: { children: React.ReactNode }) {
  const [completed, setCompleted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tour-completed") === "true";
    }
    return false;
  });

  return (
    <TourProvider
      isTourCompleted={completed}
      onComplete={() => {
        localStorage.setItem("tour-completed", "true");
        setCompleted(true);
      }}
    >
      <TourContent />
      {children}
    </TourProvider>
  );
}
