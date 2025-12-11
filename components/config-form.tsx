"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TagInput } from "@/components/ui/tag-input";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  email: z.string().email().optional(),
  bolsista: z.string().min(2, {
    message: "Nome do bolsista deve ter pelo menos 2 caracteres.",
  }),
  orientador: z.string().min(2, {
    message: "Nome do orientador deve ter pelo menos 2 caracteres.",
  }),
  laboratorios: z.array(z.string()).min(1, {
    message: "Adicione pelo menos um laboratório.",
  }),
  bolsa: z.string().min(2, {
    message: "Nome da bolsa deve ter pelo menos 2 caracteres.",
  }),
  weeklyWorkloadHours: z.coerce.number().min(1, {
    message: "Carga horária deve ser maior que 0.",
  }),
});

const holidaysSchema = z.object({
  customHolidays: z.string().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;
type HolidaysData = z.infer<typeof holidaysSchema>;

function ProfileForm({ initialData }: { initialData: any }) {
  const [isLoading, setIsLoading] = useState(false);

  // Converte o formato antigo (se houver) ou usa o array de strings
  const defaultLaboratorios =
    initialData?.laboratorios && initialData.laboratorios.length > 0
      ? typeof initialData.laboratorios[0] === "string"
        ? initialData.laboratorios
        : initialData.laboratorios.map((l: any) => l.value)
      : [];

  const form = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: initialData?.email || "",
      bolsista: initialData?.bolsista || "",
      orientador: initialData?.orientador || "",
      laboratorios: defaultLaboratorios,
      bolsa: initialData?.bolsa || "",
      weeklyWorkloadHours: initialData?.weeklyWorkloadHours || 20,
    },
  });

  async function onSubmit(values: ProfileData) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      toast.success("Dados do perfil salvos com sucesso.");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível salvar os dados do perfil.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados do Bolsista</CardTitle>
        <CardDescription>
          Informe os dados que aparecerão no cabeçalho do relatório.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bolsista"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Bolsista</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="orientador"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Orientador</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do orientador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="laboratorios"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Laboratórios</FormLabel>
                    <FormControl>
                      <TagInput {...field} placeholder="Digite e pressione Enter..." />
                    </FormControl>
                    <FormDescription>
                      Adicione um ou mais laboratórios. Pressione Enter ou vírgula para adicionar.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="bolsa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Bolsa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Iniciação Científica" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weeklyWorkloadHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carga Horária Semanal (horas)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value as string | number | undefined}
                      />
                    </FormControl>
                    <FormDescription>
                      Total de horas que devem ser cumpridas por semana.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Perfil
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function HolidaysForm({ initialData }: { initialData: any }) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<HolidaysData>({
    resolver: zodResolver(holidaysSchema),
    defaultValues: {
      customHolidays: initialData?.customHolidays || "",
    },
  });

  async function onSubmit(values: HolidaysData) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      toast.success("Feriados salvos com sucesso.");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível salvar os feriados.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feriados Personalizados</CardTitle>
        <CardDescription>
          Configure feriados municipais ou específicos que não estão no calendário nacional.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4">
              <FormField
                control={form.control}
                name="customHolidays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feriados (JSON)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='[{"date": "2025-05-17", "name": "Aniversário da Cidade", "scope": "municipal"}]'
                        className="font-mono text-xs"
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Insira uma lista de feriados personalizados no formato JSON. Exemplo:
                    </FormDescription>
                    <pre className="mt-2 w-full rounded-md bg-slate-950 p-4 overflow-x-auto">
                      <code className="text-white">
                        {`[
  {
    "date": "2025-05-17",
    "name": "Aniversário da Cidade",
    "scope": "municipal"
  }
]`}
                      </code>
                    </pre>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Feriados
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export function ConfigForm({ initialData }: { initialData: any }) {
  return (
    <div className="space-y-6">
      <ProfileForm initialData={initialData} />
      <HolidaysForm initialData={initialData} />
    </div>
  );
}
