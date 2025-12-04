"use client";

import { useCalendar } from "@/components/calendar/contexts/calendar-context";
import { MonthActions } from "@/components/month-actions";

export function CalendarActions() {
	const { selectedDate, refreshMonth } = useCalendar();
	const year = selectedDate.getFullYear();
	const month = selectedDate.getMonth() + 1;

	return (
		<MonthActions
			year={year}
			month={month}
			onAfterFill={() => refreshMonth(year, month)}
		/>
	);
}
