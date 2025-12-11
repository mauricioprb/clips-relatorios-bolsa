import React from "react";
import { CalendarBody } from "@/components/calendar/calendar-body";
import { CalendarProvider } from "@/components/calendar/contexts/calendar-context";
import { DndProvider } from "@/components/calendar/contexts/dnd-context";
import { CalendarHeader } from "@/components/calendar/header/calendar-header";
import { getEvents, getUsers } from "@/components/calendar/requests";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { parseAndExpandCustomHolidays } from "@/lib/holidays";

import { prisma } from "@/lib/prisma";

async function getCalendarData(year: number, month: number, userId: string) {
  const users = await getUsers(userId);
  const defaultUser = users[0];
  const events = await getEvents(year, month, defaultUser);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { customHolidays: true },
  });

  const customHolidays = parseAndExpandCustomHolidays(user?.customHolidays);

  return { events, users, customHolidays };
}

type Props = {
  year?: number;
  month?: number;
};

export async function Calendar({ year, month }: Props) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session?.id) {
    return null;
  }

  const today = new Date();
  const targetYear = year || today.getFullYear();
  const targetMonth = month || today.getMonth() + 1;
  const initialDate = new Date(targetYear, targetMonth - 1, 1);

  const { events, users, customHolidays } = await getCalendarData(
    targetYear,
    targetMonth,
    session.id,
  );

  return (
    <CalendarProvider
      events={events}
      users={users}
      view="month"
      initialDate={initialDate}
      customHolidays={customHolidays}
    >
      <DndProvider showConfirmation={false}>
        <div className="w-full border rounded-xl">
          <CalendarHeader />

          <CalendarBody />
        </div>
      </DndProvider>
    </CalendarProvider>
  );
}
