"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "@/components/calendar/hooks";
import type { IEvent, IUser } from "@/components/calendar/interfaces";
import type { TCalendarView, TEventColor } from "@/components/calendar/types";
import type { Holiday } from "@/lib/holidays";

interface ICalendarContext {
  selectedDate: Date;
  view: TCalendarView;
  setView: (view: TCalendarView) => void;
  agendaModeGroupBy: "date" | "color";
  setAgendaModeGroupBy: (groupBy: "date" | "color") => void;
  use24HourFormat: boolean;
  toggleTimeFormat: () => void;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserId: IUser["id"] | "all";
  setSelectedUserId: (userId: IUser["id"] | "all") => void;
  badgeVariant: "dot" | "colored";
  setBadgeVariant: (variant: "dot" | "colored") => void;
  selectedColors: TEventColor[];
  filterEventsBySelectedColors: (colors: TEventColor) => void;
  filterEventsBySelectedUser: (userId: IUser["id"] | "all") => void;
  users: IUser[];
  events: IEvent[];
  addEvent: (event: IEvent) => void;
  updateEvent: (event: IEvent) => void;
  removeEvent: (eventId: string) => void;
  refreshMonth: (year: number, month: number) => Promise<void>;
  clearFilter: () => void;
  customHolidays: Holiday[];
}

interface CalendarSettings {
  badgeVariant: "dot" | "colored";
  view: TCalendarView;
  use24HourFormat: boolean;
  agendaModeGroupBy: "date" | "color";
}

const DEFAULT_SETTINGS: CalendarSettings = {
  badgeVariant: "colored",
  view: "month",
  use24HourFormat: true,
  agendaModeGroupBy: "date",
};

interface DayEntryApi {
  id: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  description: string;
  color?: string;
}

const CalendarContext = createContext({} as ICalendarContext);

export function CalendarProvider({
  children,
  users,
  events,
  badge = "colored",
  view = "month",
  initialDate,
  customHolidays = [],
}: {
  children: React.ReactNode;
  users: IUser[];
  events: IEvent[];
  view?: TCalendarView;
  badge?: "dot" | "colored";
  initialDate?: Date;
  customHolidays?: Holiday[];
}) {
  const [settings, setSettings] = useLocalStorage<CalendarSettings>("calendar-settings", {
    ...DEFAULT_SETTINGS,
    badgeVariant: badge,
    view: view,
  });

  const [badgeVariant, setBadgeVariantState] = useState<"dot" | "colored">(settings.badgeVariant);
  const [currentView, setCurrentViewState] = useState<TCalendarView>(settings.view);
  const [use24HourFormat, setUse24HourFormatState] = useState<boolean>(settings.use24HourFormat);
  const [agendaModeGroupBy, setAgendaModeGroupByState] = useState<"date" | "color">(
    settings.agendaModeGroupBy,
  );

  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">("all");
  const [selectedColors, setSelectedColors] = useState<TEventColor[]>([]);

  // Sync selectedDate when initialDate prop changes
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
    }
  }, [initialDate?.getTime()]);

  const [allEvents, setAllEvents] = useState<IEvent[]>(events || []);
  const [filteredEvents, setFilteredEvents] = useState<IEvent[]>(events || []);
  const defaultUser = users?.[0] || { id: "main-user", name: "Bolsista", picturePath: null };
  const monthKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}`;

  const eventToPayload = (event: IEvent) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const dateOnly = new Date(Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()));

    const formatTime = (d: Date) =>
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

    const startTime = formatTime(start);
    const endTime = formatTime(end);

    return {
      date: dateOnly.toISOString(),
      startTime,
      endTime,
      description: event.title || event.description,
      color: event.color,
    };
  };

  const dayEntryToEvent = (entry: DayEntryApi): IEvent => {
    const date = new Date(entry.date);
    const start = entry.startTime || "00:00";
    const end = entry.endTime || start;

    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date.getUTCDate()).padStart(2, "0");

    const startDate = `${yyyy}-${mm}-${dd}T${start}:00`;
    const endDate = `${yyyy}-${mm}-${dd}T${end}:00`;

    return {
      id: entry.id,
      startDate,
      endDate,
      title: entry.description,
      color: (entry.color as TEventColor) || "azul",
      description: entry.description,
      user: defaultUser,
    };
  };

  const persistCreate = async (event: IEvent): Promise<IEvent | null> => {
    const payload = eventToPayload(event);
    const res = await fetch("/api/day-entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const saved = (await res.json()) as DayEntryApi;
    return dayEntryToEvent(saved);
  };

  const persistUpdate = async (event: IEvent): Promise<IEvent | null> => {
    if (!event.id) return null;
    const payload = eventToPayload(event);
    const res = await fetch(`/api/day-entries/${event.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const saved = (await res.json()) as DayEntryApi;
    return dayEntryToEvent(saved);
  };

  const persistDelete = async (eventId: string): Promise<void> => {
    await fetch(`/api/day-entries/${eventId}`, { method: "DELETE" });
  };

  const fetchEntries = async (year: number, month: number): Promise<IEvent[] | null> => {
    const res = await fetch(`/api/day-entries?ano=${year}`);
    if (!res.ok) return null;
    const data = (await res.json()) as DayEntryApi[];
    return Array.isArray(data) ? data.map(dayEntryToEvent) : null;
  };

  const updateSettings = (newPartialSettings: Partial<CalendarSettings>) => {
    setSettings({
      ...settings,
      ...newPartialSettings,
    });
  };

  const setBadgeVariant = (variant: "dot" | "colored") => {
    setBadgeVariantState(variant);
    updateSettings({ badgeVariant: variant });
  };

  const setView = (newView: TCalendarView) => {
    setCurrentViewState(newView);
    updateSettings({ view: newView });
  };

  const toggleTimeFormat = () => {
    const newValue = !use24HourFormat;
    setUse24HourFormatState(newValue);
    updateSettings({ use24HourFormat: newValue });
  };

  const setAgendaModeGroupBy = (groupBy: "date" | "color") => {
    setAgendaModeGroupByState(groupBy);
    updateSettings({ agendaModeGroupBy: groupBy });
  };

  const filterEventsBySelectedColors = (color: TEventColor) => {
    const isColorSelected = selectedColors.includes(color);
    const newColors = isColorSelected
      ? selectedColors.filter((c) => c !== color)
      : [...selectedColors, color];

    if (newColors.length > 0) {
      const filtered = allEvents.filter((event) => {
        const eventColor = event.color || "blue";
        return newColors.includes(eventColor);
      });
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(allEvents);
    }

    setSelectedColors(newColors);
  };

  const filterEventsBySelectedUser = (userId: IUser["id"] | "all") => {
    setSelectedUserId(userId);
    if (userId === "all") {
      setFilteredEvents(allEvents);
    } else {
      const filtered = allEvents.filter((event) => event.user.id === userId);
      setFilteredEvents(filtered);
    }
  };

  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
  };

  const addEvent = (event: IEvent) => {
    void (async () => {
      const saved = await persistCreate(event);
      const toAdd = saved || event;
      setAllEvents((prev) => [...prev, toAdd]);
      setFilteredEvents((prev) => [...prev, toAdd]);
      await refreshMonth(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
    })();
  };

  const updateEvent = (event: IEvent) => {
    void (async () => {
      const saved = await persistUpdate(event);
      const updated = saved || {
        ...event,
        startDate: new Date(event.startDate).toISOString(),
        endDate: new Date(event.endDate).toISOString(),
      };

      setAllEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
      setFilteredEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
      await refreshMonth(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
    })();
  };

  const removeEvent = (eventId: string) => {
    void (async () => {
      await persistDelete(eventId);
      setAllEvents((prev) => prev.filter((e) => e.id !== eventId));
      setFilteredEvents((prev) => prev.filter((e) => e.id !== eventId));
      await refreshMonth(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
    })();
  };

  const refreshMonth = async (year: number, month: number) => {
    const refreshed = await fetchEntries(year, month);
    if (!refreshed) return;
    setAllEvents(refreshed);
    setFilteredEvents(refreshed);
  };

  useEffect(() => {
    void (async () => {
      const refreshed = await fetchEntries(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
      if (!refreshed) return;
      setAllEvents(refreshed);
      setFilteredEvents(refreshed);
    })();
  }, [selectedDate.getFullYear()]);

  const clearFilter = () => {
    setFilteredEvents(allEvents);
    setSelectedColors([]);
    setSelectedUserId("all");
  };

  const value: ICalendarContext = {
    selectedDate,
    setSelectedDate: handleSelectDate,
    selectedUserId,
    setSelectedUserId,
    badgeVariant,
    setBadgeVariant,
    users,
    selectedColors,
    filterEventsBySelectedColors,
    filterEventsBySelectedUser,
    events: filteredEvents,
    view: currentView,
    use24HourFormat,
    toggleTimeFormat,
    setView,
    agendaModeGroupBy,
    setAgendaModeGroupBy,
    addEvent,
    updateEvent,
    removeEvent,
    refreshMonth,
    clearFilter,
    customHolidays,
  };

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>;
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext);
  if (!context) throw new Error("useCalendar must be used within a CalendarProvider.");
  return context;
}
