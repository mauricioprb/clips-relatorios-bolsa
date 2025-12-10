"use client";

import { isSameDay, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { fadeIn } from "@/components/calendar/animations";
import { useCalendar } from "@/components/calendar/contexts/calendar-context";
import { AgendaEvents } from "@/components/calendar/views/agenda-view/agenda-events";
import { CalendarMonthView } from "@/components/calendar/views/month-view/calendar-month-view";
import { CalendarYearView } from "@/components/calendar/views/year-view/calendar-year-view";

export function CalendarBody() {
  const { view, events } = useCalendar();

  const singleDayEvents = events.filter((event) => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    return isSameDay(startDate, endDate);
  });

  const multiDayEvents = events.filter((event) => {
    const startDate = parseISO(event.startDate);
    const endDate = parseISO(event.endDate);
    return !isSameDay(startDate, endDate);
  });

  return (
    <div className="w-full h-full overflow-scroll relative">
      <motion.div key={view} initial="initial" animate="animate" exit="exit" variants={fadeIn}>
        {view === "month" && (
          <CalendarMonthView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />
        )}
        {view === "year" && (
          <CalendarYearView singleDayEvents={singleDayEvents} multiDayEvents={multiDayEvents} />
        )}
        {view === "agenda" && (
          <motion.div
            key="agenda"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
          >
            <AgendaEvents />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
