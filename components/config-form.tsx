"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  bolsista: z.string().min(2, {
    message: "Nome do bolsista deve ter pelo menos 2 caracteres.",
  }),
  orientador: z.string().min(2, {
    message: "Nome do orientador deve ter pelo menos 2 caracteres.",
  }),
  laboratorio: z.string().min(2, {
    message: "Nome do laboratório deve ter pelo menos 2 caracteres.",
  }),
  bolsa: z.string().min(2, {
    message: "Nome da bolsa deve ter pelo menos 2 caracteres.",
  }),
  weeklyWorkloadHours: z.coerce.number().min(1, {
    message: "Carga horária deve ser maior que 0.",
  }),
});

export type ConfigData = z.infer<typeof formSchema>;

export function ConfigForm({ initialData }: { initialData: ConfigData | null }) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ConfigData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      bolsista: "",
      orientador: "",
      laboratorio: "",
      bolsa: "",
      weeklyWorkloadHours: 20,
    },
  });

  async function onSubmit(values: ConfigData) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      toast.success("Configurações salvas com sucesso.");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível salvar as configurações.");
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
                name="laboratorio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Laboratório</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Lab. de Informática" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      <Input type="number" {...field} />
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
                Salvar alterações
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
