import { zodResolver } from "@hookform/resolvers/zod";
import { addMinutes, format, set } from "date-fns";
import { type ReactNode, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
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
	Modal,
	ModalClose,
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	ModalTrigger,
} from "@/components/ui/responsive-modal";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { COLORS } from "@/components/calendar/constants";
import { useCalendar } from "@/components/calendar/contexts/calendar-context";
import { useDisclosure } from "@/components/calendar/hooks";
import type { IEvent } from "@/components/calendar/interfaces";
import { eventSchema, type TEventFormData } from "@/components/calendar/schemas";

interface IProps {
	children: ReactNode;
	startDate?: Date;
	startTime?: { hour: number; minute: number };
	event?: IEvent;
}

export function AddEditEventDialog({
	children,
	startDate,
	startTime,
	event,
}: IProps) {
	const { isOpen, onClose, onToggle } = useDisclosure();
	const { addEvent, updateEvent, users } = useCalendar();
	const isEditing = !!event;
	const fallbackUser =
		event?.user || users?.[0] || { id: "user-1", name: "Bolsista", picturePath: null };

	const initialDates = useMemo(() => {
		if (!isEditing && !event) {
			if (!startDate) {
				const now = new Date();
				return { startDate: now, endDate: addMinutes(now, 30) };
			}
			const start = startTime
				? set(new Date(startDate), {
						hours: startTime.hour,
						minutes: startTime.minute,
						seconds: 0,
					})
				: new Date(startDate);
			const end = addMinutes(start, 30);
			return { startDate: start, endDate: end };
		}

		return {
			startDate: new Date(event.startDate),
			endDate: new Date(event.endDate),
		};
	}, [startDate, startTime, event, isEditing]);

	const form = useForm<TEventFormData>({
		resolver: zodResolver(eventSchema),
		defaultValues: {
			title: event?.title ?? "",
			startDate: initialDates.startDate,
			endDate: initialDates.endDate,
			color: event?.color ?? "blue",
		},
	});

	useEffect(() => {
		form.reset({
			title: event?.title ?? "",
			startDate: initialDates.startDate,
			endDate: initialDates.endDate,
			color: event?.color ?? "blue",
		});
	}, [event, initialDates, form]);

	const onSubmit = (values: TEventFormData) => {
		try {
			const formattedEvent: IEvent = {
				...values,
				startDate: format(values.startDate, "yyyy-MM-dd'T'HH:mm:ss"),
				endDate: format(values.endDate, "yyyy-MM-dd'T'HH:mm:ss"),
				id:
					(isEditing ? event.id : undefined) ||
					(typeof crypto !== "undefined" && crypto.randomUUID
						? crypto.randomUUID()
						: `event-${Date.now()}`),
				user: fallbackUser,
				color: values.color,
			};

			if (isEditing) {
				updateEvent(formattedEvent);
				toast.success("Evento atualizado com sucesso");
			} else {
				addEvent(formattedEvent);
				toast.success("Evento criado com sucesso");
			}

			onClose();
			form.reset();
		} catch (error) {
			console.error(`Error ${isEditing ? "editing" : "adding"} event:`, error);
			toast.error(
				`Não foi possível ${isEditing ? "editar" : "criar"} o evento`,
			);
		}
	};

	return (
		<Modal open={isOpen} onOpenChange={onToggle} modal={false}>
			<ModalTrigger asChild>{children}</ModalTrigger>
			<ModalContent>
				<ModalHeader>
					<ModalTitle>{isEditing ? "Editar evento" : "Novo evento"}</ModalTitle>
					<ModalDescription>
						{isEditing
							? "Atualize as informações do evento."
							: "Crie um novo evento para o calendário."}
					</ModalDescription>
				</ModalHeader>

				<Form {...form}>
					<form
						id="event-form"
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-4 py-4"
					>
						<FormField
							control={form.control}
							name="title"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel htmlFor="title" className="required">
										Título
									</FormLabel>
									<FormControl>
										<Input
											id="title"
											placeholder="Informe um título"
											{...field}
											className={fieldState.invalid ? "border-red-500" : ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="startDate"
							render={({ field }) => (
								<DateTimePicker form={form} field={field} />
							)}
						/>
						<FormField
							control={form.control}
							name="endDate"
							render={({ field }) => (
								<DateTimePicker form={form} field={field} />
							)}
						/>
						<FormField
							control={form.control}
							name="color"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel className="required">Variant</FormLabel>
									<FormControl>
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger
												className={`w-full ${
													fieldState.invalid ? "border-red-500" : ""
												}`}
											>
												<SelectValue placeholder="Selecione uma cor" />
											</SelectTrigger>
											<SelectContent>
												{COLORS.map((color) => (
													<SelectItem value={color} key={color}>
														<div className="flex items-center gap-2">
															<div
																className={`size-3.5 rounded-full bg-${color}-600 dark:bg-${color}-700`}
															/>
															{color}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
				<ModalFooter className="flex justify-end gap-2">
					<ModalClose asChild>
						<Button type="button" variant="outline">
							Cancelar
						</Button>
					</ModalClose>
					<Button form="event-form" type="submit">
						{isEditing ? "Salvar alterações" : "Criar evento"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
