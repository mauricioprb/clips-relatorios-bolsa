import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  startDate: z.date({
    message: "Start date is required",
  }),
  endDate: z.date({
    message: "End date is required",
  }),
  color: z.enum(["azul", "verde", "vermelho", "amarelo", "roxo", "laranja", "cinza"], {
    message: "Variant is required",
  }),
});

export type TEventFormData = z.infer<typeof eventSchema>;
