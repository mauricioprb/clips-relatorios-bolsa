"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export function MonthSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = new Date();
  const initialYear = Number(searchParams.get("ano")) || current.getFullYear();
  const initialMonth = Number(searchParams.get("mes")) || current.getMonth() + 1;
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  useEffect(() => {
    setYear(initialYear);
    setMonth(initialMonth);
  }, [initialYear, initialMonth]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/mes?ano=${year}&mes=${month}`);
  };

  return (
    <form
      onSubmit={submit}
      className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2"
    >
      <label className="text-sm text-slate-700">Ano</label>
      <input
        type="number"
        className="input w-24"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
      />
      <label className="text-sm text-slate-700">Mês</label>
      <input
        type="number"
        className="input w-20"
        min={1}
        max={12}
        value={month}
        onChange={(e) => setMonth(Number(e.target.value))}
      />
      <button type="submit" className="btn-secondary">
        Ir
      </button>
    </form>
  );
}
