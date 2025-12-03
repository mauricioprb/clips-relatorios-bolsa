"use client";

import { useState } from "react";

export type DefaultActivity = {
  id: string;
  description: string;
  hours: number;
  priority: number;
};

type FormState = {
  id?: string;
  description: string;
  hours: number;
  priority: number;
};

const emptyForm: FormState = {
  description: "",
  hours: 2,
  priority: 1,
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
      hours: Number(form.hours),
      priority: Number(form.priority),
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
          (a, b) => a.priority - b.priority || a.description.localeCompare(b.description)
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
      hours: activity.hours,
      priority: activity.priority,
    });
  };

  const deleteActivity = async (id: string) => {
    if (!confirm("Deseja excluir esta atividade?")) return;
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
                <th className="p-2">Horas</th>
                <th className="p-2">Prioridade</th>
                <th className="p-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity.id} className="border-b">
                  <td className="p-2">{activity.description}</td>
                  <td className="p-2">{activity.hours} h</td>
                  <td className="p-2">{activity.priority}</td>
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
              ))}
              {activities.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-3 text-center text-slate-500">
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
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Horas
            </label>
            <input
              className="input"
              type="number"
              step="0.5"
              min="0"
              value={form.hours}
              onChange={(e) =>
                setForm({ ...form, hours: Number(e.target.value) })
              }
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Prioridade (menor = maior)
            </label>
            <input
              className="input"
              type="number"
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: Number(e.target.value) })
              }
              required
            />
          </div>
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
