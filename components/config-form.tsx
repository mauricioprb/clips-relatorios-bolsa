"use client";

import { useState } from "react";

export type ConfigData = {
  bolsista: string;
  orientador: string;
  laboratorio: string;
  bolsa: string;
};

export function ConfigForm({ initialData }: { initialData: ConfigData | null }) {
  const [form, setForm] = useState<ConfigData>(
    initialData || {
      bolsista: "",
      orientador: "",
      laboratorio: "",
      bolsa: "",
    }
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const updateField = (key: keyof ConfigData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      setStatus("saved");
      setMessage("Configurações salvas com sucesso.");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Não foi possível salvar. Tente novamente.");
    } finally {
      setTimeout(() => setStatus("idle"), 2500);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Nome do bolsista
        </label>
        <input
          className="input"
          value={form.bolsista}
          onChange={(e) => updateField("bolsista", e.target.value)}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          Orientador
        </label>
        <input
          className="input"
          value={form.orientador}
          onChange={(e) => updateField("orientador", e.target.value)}
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Laboratório / Sala
          </label>
          <input
            className="input"
            value={form.laboratorio}
            onChange={(e) => updateField("laboratorio", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Bolsa
          </label>
          <input
            className="input"
            value={form.bolsa}
            onChange={(e) => updateField("bolsa", e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="btn-primary"
          disabled={status === "saving"}
        >
          {status === "saving" ? "Salvando..." : "Salvar"}
        </button>
        {message && (
          <span
            className={`text-sm ${
              status === "error" ? "text-red-600" : "text-green-700"
            }`}
          >
            {message}
          </span>
        )}
      </div>
    </form>
  );
}
