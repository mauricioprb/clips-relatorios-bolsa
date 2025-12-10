"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

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

const formSchema = z.object({
  weekday: z.string(),
  startTime: z.string().min(1, "Horário inicial é obrigatório"),
  endTime: z.string().min(1, "Horário final é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

export function WeeklySlotsManager({ initialSlots }: { initialSlots: WeeklySlot[] }) {
  const [slots, setSlots] = useState<WeeklySlot[]>(initialSlots);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<WeeklySlot | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weekday: "1",
      startTime: "08:00",
      endTime: "12:00",
      description: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const payload = {
        weekday: parseInt(values.weekday),
        startTime: values.startTime,
        endTime: values.endTime,
        description: values.description,
      };

      const url = editingSlot ? `/api/weekly-slots/${editingSlot.id}` : "/api/weekly-slots";
      const method = editingSlot ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Falha ao salvar");

      const saved: WeeklySlot = await res.json();

      setSlots((prev) => {
        if (editingSlot) {
          return prev.map((s) => (s.id === saved.id ? saved : s));
        }
        return [...prev, saved];
      });

      toast.success(editingSlot ? "Horário atualizado!" : "Horário criado com sucesso!");
      setIsDialogOpen(false);
      setEditingSlot(null);
      form.reset();
    } catch (error) {
      toast.error("Erro ao salvar horário");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/weekly-slots/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Falha ao excluir");

      setSlots((prev) => prev.filter((s) => s.id !== id));
      toast.success("Horário removido");
    } catch (error) {
      toast.error("Erro ao remover horário");
    }
  };

  const openNewDialog = (weekday?: number) => {
    setEditingSlot(null);
    form.reset({
      weekday: weekday !== undefined ? weekday.toString() : "1",
      startTime: "08:00",
      endTime: "12:00",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (slot: WeeklySlot) => {
    setEditingSlot(slot);
    form.reset({
      weekday: slot.weekday.toString(),
      startTime: slot.startTime,
      endTime: slot.endTime,
      description: slot.description,
    });
    setIsDialogOpen(true);
  };

  const slotsByDay = weekDays.map((day, index) => ({
    dayName: day,
    dayIndex: index,
    slots: slots
      .filter((s) => s.weekday === index)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grade Semanal"
        description="Gerencie seus horários recorrentes de atendimento."
        actions={
          <Button onClick={() => openNewDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Horário
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {slotsByDay.map(({ dayName, dayIndex, slots }) => (
          <Card
            key={dayIndex}
            className={cn(
              "group relative flex flex-col",
              slots.length === 0 && "border-dashed bg-muted/20",
            )}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-medium flex items-center justify-between">
                {dayName}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={slots.length > 0 ? "default" : "secondary"}
                    className="text-xs font-normal"
                  >
                    {slots.length}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => openNewDialog(dayIndex)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              {slots.length === 0 ? (
                <div className="flex h-full min-h-[120px] w-full items-center justify-center">
                  <Button
                    variant="ghost"
                    className="border opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    onClick={() => openNewDialog(dayIndex)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar
                  </Button>
                </div>
              ) : (
                slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="group flex flex-col gap-2 rounded-lg border bg-card p-3 text-sm shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="flex items-center justify-between font-medium">
                      <div className="flex items-center gap-2 text-primary">
                        <Clock className="h-3.5 w-3.5" />
                        <span>
                          {slot.startTime} - {slot.endTime}
                        </span>
                      </div>
                    </div>
                    <div className="text-muted-foreground line-clamp-2">{slot.description}</div>
                    <div className="flex items-center justify-end gap-2 pt-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openEditDialog(slot)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir horário?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(slot.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSlot ? "Editar Horário" : "Novo Horário"}</DialogTitle>
            <DialogDescription>Configure o dia e hora do atendimento recorrente.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="weekday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia da Semana</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o dia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {weekDays.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Início</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fim</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Atendimento Clínico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
