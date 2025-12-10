"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getWorkingDays } from "@/lib/dates";

export type DayEntryClient = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  hours: number;
};

type FormState = {
  id?: string;
  day: number | null;
  startTime: string;
  endTime: string;
  description: string;
  hours?: number;
};

const defaultStart = "14:00";
const defaultEnd = "18:00";

export function MonthEntriesClient({
  year,
  month,
  initialEntries,
}: {
  year: number;
  month: number;
  initialEntries: DayEntryClient[];
}) {
  const router = useRouter();
  const [entries, setEntries] = useState<DayEntryClient[]>(initialEntries);
  const [loadingFill, setLoadingFill] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [form, setForm] = useState<FormState>({
    day: null,
    startTime: defaultStart,
    endTime: defaultEnd,
    description: "",
  });

  const days = useMemo(() => getWorkingDays(year, month), [year, month]);
  const dayKey = (date: Date) => date.toISOString().substring(0, 10);
  const entriesByDay = useMemo(() => {
    const map: Record<string, DayEntryClient[]> = {};
    entries.forEach((entry) => {
      const key = entry.date.substring(0, 10);
      map[key] = map[key] ? [...map[key], entry] : [entry];
    });
    return map;
  }, [entries]);

  const openForm = (day: number, entry?: DayEntryClient) => {
    setForm({
      id: entry?.id,
      day,
      startTime: entry?.startTime || defaultStart,
      endTime: entry?.endTime || defaultEnd,
      description: entry?.description || "",
      hours: entry?.hours,
    });
  };

  const resetForm = () => {
    setForm({
      id: undefined,
      day: null,
      startTime: defaultStart,
      endTime: defaultEnd,
      description: "",
      hours: undefined,
    });
  };

  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.day) return;
    const date = new Date(Date.UTC(year, month - 1, form.day));
    const payload = {
      date: date.toISOString(),
      startTime: form.startTime,
      endTime: form.endTime,
      description: form.description,
      hours: form.hours ?? undefined,
    };
    const url = form.id ? `/api/day-entries/${form.id}` : "/api/day-entries";
    const method = form.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const saved: DayEntryClient = await res.json();
      setEntries((prev) => {
        if (form.id) {
          return prev.map((item) => (item.id === saved.id ? saved : item));
        }
        return [...prev, saved];
      });
      resetForm();
    }
  };

  const deleteEntry = async (id: string) => {
    await fetch(`/api/day-entries/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((item) => item.id !== id));
  };

  const fillBlanks = async () => {
    setLoadingFill(true);
    await fetch("/api/month/fill-blanks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ano: year, mes: month }),
    });
    await reloadEntries();
    setLoadingFill(false);
  };

  const reloadEntries = async () => {
    const res = await fetch(`/api/day-entries?ano=${year}&mes=${month}`);
    if (res.ok) {
      const data: DayEntryClient[] = await res.json();
      setEntries(data);
    }
  };

  const generatePdf = async () => {
    setLoadingPdf(true);
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
    setLoadingPdf(false);
  };

  const monthTotal = entries.reduce((sum, item) => sum + (item.hours || 0), 0);

  const handleChangeMonth = (newYear: number, newMonth: number) => {
    router.push(`/mes?ano=${newYear}&mes=${newMonth}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <MonthSelector year={year} month={month} onChange={handleChangeMonth} />
        <button onClick={fillBlanks} className="btn-secondary" disabled={loadingFill}>
          {loadingFill ? "Preenchendo..." : "Completar dias"}
        </button>
        <button onClick={generatePdf} className="btn-primary" disabled={loadingPdf}>
          {loadingPdf ? "Gerando PDF..." : "Gerar PDF do relatório"}
        </button>
        <span className="ml-auto text-sm font-semibold text-slate-800">
          Total do mês: {monthTotal.toFixed(2)} h
        </span>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left">
              <th className="p-2">Dia</th>
              <th className="p-2">Atividades</th>
              <th className="p-2 w-32">Carga diária</th>
              <th className="p-2 w-32 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {days.map((dayDate) => {
              const key = dayKey(dayDate);
              const dayNumber = dayDate.getUTCDate();
              const dayEntries = entriesByDay[key] || [];
              const dailyHours = dayEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0);
              return (
                <tr key={key} className="border-b align-top">
                  <td className="p-2 whitespace-nowrap">
                    <div className="font-semibold">
                      {dayDate.toLocaleDateString("pt-BR", {
                        timeZone: "UTC",
                      })}
                    </div>
                  </td>
                  <td className="p-2">
                    <div className="space-y-2">
                      {dayEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="rounded-md border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs text-slate-500">
                                {entry.startTime} - {entry.endTime}
                              </p>
                              <p className="text-sm font-medium text-slate-900">
                                {entry.description}
                              </p>
                              <p className="text-xs text-slate-600">{entry.hours.toFixed(2)} h</p>
                            </div>
                            <div className="flex flex-col items-end gap-1 text-xs">
                              <button
                                className="text-blue-700 hover:underline"
                                onClick={() => openForm(dayNumber, entry)}
                              >
                                Editar
                              </button>
                              <button
                                className="text-red-600 hover:underline"
                                onClick={() => deleteEntry(entry.id)}
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button className="btn-secondary" onClick={() => openForm(dayNumber)}>
                        {dayEntries.length ? "Adicionar atividade" : "Adicionar"}
                      </button>
                    </div>
                  </td>
                  <td className="p-2 font-semibold text-slate-800">{dailyHours.toFixed(2)} h</td>
                  <td className="p-2 text-right">
                    {form.day === dayNumber && (
                      <form
                        onSubmit={saveEntry}
                        className="space-y-2 rounded-md border border-slate-200 p-3 text-left"
                      >
                        <p className="text-sm font-semibold">
                          {form.id ? "Editar" : "Nova"} atividade do dia {dayNumber}
                        </p>
                        <div className="grid gap-2 md:grid-cols-2">
                          <div>
                            <label className="text-xs text-slate-600">Início</label>
                            <input
                              type="time"
                              className="input"
                              value={form.startTime}
                              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-600">Fim</label>
                            <input
                              type="time"
                              className="input"
                              value={form.endTime}
                              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-slate-600">Descrição</label>
                          <input
                            className="input"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600">Carga horária (opcional)</label>
                          <input
                            type="number"
                            step="0.25"
                            className="input"
                            value={form.hours ?? ""}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                hours: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            placeholder="Calculada automaticamente"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button type="submit" className="btn-primary">
                            {form.id ? "Atualizar" : "Salvar"}
                          </button>
                          <button type="button" className="btn-secondary" onClick={resetForm}>
                            Cancelar
                          </button>
                        </div>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MonthSelector({
  year,
  month,
  onChange,
}: {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}) {
  const [localYear, setLocalYear] = useState(year);
  const [localMonth, setLocalMonth] = useState(month);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(localYear, localMonth);
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2"
    >
      <label className="text-sm text-slate-700">Ano</label>
      <input
        type="number"
        className="input w-24"
        value={localYear}
        onChange={(e) => setLocalYear(Number(e.target.value))}
      />
      <label className="text-sm text-slate-700">Mês</label>
      <input
        type="number"
        className="input w-20"
        min={1}
        max={12}
        value={localMonth}
        onChange={(e) => setLocalMonth(Number(e.target.value))}
      />
      <button type="submit" className="btn-secondary">
        Ir
      </button>
    </form>
  );
}
