"use client";

import { useState } from "react";

export type WeeklySlot = {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
  description: string;
};

const weekDays = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

type FormState = {
  id?: string;
  weekday: number;
  startTime: string;
  endTime: string;
  description: string;
};

const emptyForm: FormState = {
  weekday: 1,
  startTime: "14:00",
  endTime: "18:00",
  description: "",
};

export function WeeklySlotsManager({
  initialSlots,
}: {
  initialSlots: WeeklySlot[];
}) {
  const [slots, setSlots] = useState(initialSlots);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      weekday: Number(form.weekday),
      startTime: form.startTime,
      endTime: form.endTime,
      description: form.description,
    };

    const res = await fetch(
      form.id ? `/api/weekly-slots/${form.id}` : "/api/weekly-slots",
      {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      const saved: WeeklySlot = await res.json();
      setSlots((prev) => {
        if (form.id) {
          return prev.map((slot) => (slot.id === saved.id ? saved : slot));
        }
        return [...prev, saved].sort(
          (a, b) => a.weekday - b.weekday || a.startTime.localeCompare(b.startTime)
        );
      });
      setForm(emptyForm);
    }

    setSaving(false);
  };

  const startEdit = (slot: WeeklySlot) => {
    setForm({
      id: slot.id,
      weekday: slot.weekday,
      startTime: slot.startTime,
      endTime: slot.endTime,
      description: slot.description,
    });
  };

  const deleteSlot = async (id: string) => {
    if (!confirm("Deseja excluir este horário?")) return;
    await fetch(`/api/weekly-slots/${id}`, { method: "DELETE" });
    setSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Horários cadastrados
          </h2>
          <span className="text-sm text-slate-600">
            {slots.length} registro(s)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="p-2">Dia</th>
                <th className="p-2">Horário</th>
                <th className="p-2">Descrição</th>
                <th className="p-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.id} className="border-b">
                  <td className="p-2">{weekDays[slot.weekday]}</td>
                  <td className="p-2">
                    {slot.startTime} - {slot.endTime}
                  </td>
                  <td className="p-2">{slot.description}</td>
                  <td className="p-2 text-right">
                    <button
                      className="btn-secondary mr-2"
                      onClick={() => startEdit(slot)}
                    >
                      Editar
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => deleteSlot(slot.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {slots.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-slate-500">
                    Nenhum horário cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          {form.id ? "Editar horário" : "Novo horário"}
        </h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Dia da semana
          </label>
          <select
            className="input"
            value={form.weekday}
            onChange={(e) => setForm({ ...form, weekday: Number(e.target.value) })}
          >
            {weekDays.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Horário inicial
            </label>
            <input
              className="input"
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Horário final
            </label>
            <input
              className="input"
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Descrição
          </label>
          <input
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Salvando..." : form.id ? "Atualizar" : "Criar"}
          </button>
          {form.id && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setForm(emptyForm)}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
