"use client";

import { useState } from "react";
import { COLORS, BG_COLORS, BG_LIGHT_COLORS, BG_HOVER_COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/components/calendar/constants";
import { TEventColor } from "@/components/calendar/types";
import { cn } from "@/lib/utils";

export type DefaultActivity = {
  id: string;
  description: string;
  color: string;
};

type FormState = {
  id?: string;
  description: string;
  color: string;
};

const emptyForm: FormState = {
  description: "",
  color: "azul",
};

export function DefaultActivitiesManager({
  initialActivities,
}: {
  initialActivities: DefaultActivity[];
}) {
  const [activities, setActivities] = useState(initialActivities);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      description: form.description,
      color: form.color,
    };

    const res = await fetch(
      form.id
        ? `/api/default-activities/${form.id}`
        : "/api/default-activities",
      {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      const saved: DefaultActivity = await res.json();
      setActivities((prev) => {
        if (form.id) {
          return prev.map((item) => (item.id === saved.id ? saved : item));
        }
        return [...prev, saved].sort(
          (a, b) => a.description.localeCompare(b.description)
        );
      });
      setForm(emptyForm);
    }

    setSaving(false);
  };

  const startEdit = (activity: DefaultActivity) => {
    setForm({
      id: activity.id,
      description: activity.description,
      color: activity.color,
    });
  };

  const deleteActivity = async (id: string) => {
    await fetch(`/api/default-activities/${id}`, { method: "DELETE" });
    setActivities((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Atividades padrão
          </h2>
          <span className="text-sm text-slate-600">
            {activities.length} registro(s)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="p-2">Descrição</th>
                <th className="p-2">Cor</th>
                <th className="p-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => {
                const color = activity.color as TEventColor;
                const bgClass = BG_COLORS[color] || BG_COLORS.azul;
                return (
                  <tr key={activity.id} className="border-b">
                    <td className="p-2">{activity.description}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn("h-4 w-4 rounded-full", bgClass)}
                        />
                        <span className="capitalize">{PRIORITY_LABELS[activity.color] || activity.color}</span>
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <button
                        className="btn-secondary mr-2"
                        onClick={() => startEdit(activity)}
                      >
                        Editar
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => deleteActivity(activity.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
              {activities.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-3 text-center text-slate-500">
                    Nenhuma atividade padrão cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">
          {form.id ? "Editar atividade" : "Nova atividade"}
        </h2>
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
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Prioridade
          </label>
          <div className="flex flex-wrap gap-2">
            {PRIORITY_COLORS.map((color) => {
              const isSelected = form.color === color;
              const bgClass = BG_COLORS[color];
              
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 transition-all",
                    isSelected
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className={cn("h-4 w-4 rounded-full", bgClass)} />
                  <span className="text-sm font-medium">{PRIORITY_LABELS[color]}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3 pt-2">
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
