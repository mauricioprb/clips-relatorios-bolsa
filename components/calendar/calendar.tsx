import React from "react";
import { CalendarBody } from "@/components/calendar/calendar-body";
import { CalendarProvider } from "@/components/calendar/contexts/calendar-context";
import { DndProvider } from "@/components/calendar/contexts/dnd-context";
import { CalendarHeader } from "@/components/calendar/header/calendar-header";
import { getEvents, getUsers } from "@/components/calendar/requests";
import { CalendarActions } from "@/components/calendar/calendar-actions";

async function getCalendarData(year: number, month: number) {
	const users = await getUsers();
	const defaultUser = users[0];
	const events = await getEvents(year, month, defaultUser);
	return { events, users };
}

type Props = {
	year?: number;
	month?: number;
};

export async function Calendar({ year, month }: Props) {
	const today = new Date();
	const targetYear = year || today.getFullYear();
	const targetMonth = month || today.getMonth() + 1;
	const initialDate = new Date(targetYear, targetMonth - 1, 1);

	const { events, users } = await getCalendarData(targetYear, targetMonth);

	return (
		<CalendarProvider
			events={events}
			users={users}
			view="month"
			initialDate={initialDate}
		>
			<DndProvider showConfirmation={false}>
				<div className="w-full border rounded-xl">
					<CalendarHeader />
					<div className="border-b px-4 py-3">
						<CalendarActions />
					</div>
					<CalendarBody />
				</div>
			</DndProvider>
		</CalendarProvider>
	);
}
