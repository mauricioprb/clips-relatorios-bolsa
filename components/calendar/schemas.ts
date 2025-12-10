import { z } from "zod";

export const eventSchema = z.object({
	title: z.string().min(1, "Title is required"),
	startDate: z.date({
		required_error: "Start date is required",
	}),
	endDate: z.date({
		required_error: "End date is required",
	}),
	color: z.enum(
		["azul", "verde", "vermelho", "amarelo", "roxo", "laranja", "cinza"],
		{
			required_error: "Variant is required",
		},
	),
});

export type TEventFormData = z.infer<typeof eventSchema>;
