"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  year: number;
  month: number;
  onAfterFill?: () => Promise<void> | void;
};

export function MonthActions({ year, month, onAfterFill }: Props) {
  const router = useRouter();
  const [loadingFill, startFill] = useTransition();
  const [loadingPdf, setLoadingPdf] = useState(false);

  const fillBlanks = () =>
    startFill(async () => {
      await fetch("/api/month/fill-blanks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ano: year, mes: month }),
      });
      if (onAfterFill) {
        await onAfterFill();
      }
      router.refresh();
    });

  const generatePdf = async () => {
    setLoadingPdf(true);
    try {
      const res = await fetch(`/api/month/report-pdf?ano=${year}&mes=${month}`, { method: "GET" });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `relatorio-${year}-${String(month).padStart(2, "0")}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button onClick={fillBlanks} className="btn-primary" disabled={loadingFill}>
        {loadingFill ? "Preenchendo..." : "Completar dias"}
      </button>
      <button onClick={generatePdf} className="btn-primary" disabled={loadingPdf}>
        {loadingPdf ? "Gerando PDF..." : "Gerar PDF do relatório"}
      </button>
    </div>
  );
}
