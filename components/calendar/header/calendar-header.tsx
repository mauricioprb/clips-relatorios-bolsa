"use client";

import { motion } from "framer-motion";
import { Plus, FileText, CalendarCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { slideFromLeft, slideFromRight } from "@/components/calendar/animations";
import { useCalendar } from "@/components/calendar/contexts/calendar-context";
import { AddEditEventDialog } from "@/components/calendar/dialogs/add-edit-event-dialog";
import { DateNavigator } from "@/components/calendar/header/date-navigator";
import FilterEvents from "@/components/calendar/header/filter";
import { TodayButton } from "@/components/calendar/header/today-button";
import Views from "./view-tabs";

export function CalendarHeader() {
  const { view, events, selectedDate, refreshMonth } = useCalendar();
  const router = useRouter();
  const [loadingFill, startFill] = useTransition();
  const [loadingPdf, setLoadingPdf] = useState(false);

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;

  const fillBlanks = () =>
    startFill(async () => {
      await fetch("/api/month/fill-blanks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ano: year, mes: month }),
      });
      await refreshMonth(year, month);
      router.refresh();
    });

  const generatePdf = async () => {
    setLoadingPdf(true);
    try {
      const res = await fetch(`/api/month/report-pdf?ano=${year}&mes=${month}`, { method: "GET" });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `relatorio-${year}-${String(month).padStart(2, "0")}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="flex flex-col border-b">
      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <motion.div
          className="flex items-center gap-3"
          variants={slideFromLeft}
          initial="initial"
          animate="animate"
        >
          <TodayButton />
          <DateNavigator view={view} events={events} />
        </motion.div>

        <motion.div
          className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-1.5"
          variants={slideFromRight}
          initial="initial"
          animate="animate"
        >
          <div className="options flex-wrap flex items-center gap-4 md:gap-2">
            <FilterEvents />
            <Views />
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col gap-4 px-4 pb-4 md:flex-row md:items-center md:justify-between md:gap-0">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-2">
          <Button 
            variant="outline" 
            onClick={fillBlanks} 
            disabled={loadingFill}
            className="w-full md:w-auto"
          >
            <CalendarCheck className="mr-2 h-4 w-4" />
            {loadingFill ? "Preenchendo..." : "Completar dias"}
          </Button>
          <Button 
            variant="outline" 
            onClick={generatePdf} 
            disabled={loadingPdf}
            className="w-full md:w-auto"
          >
            <FileText className="mr-2 h-4 w-4" />
            {loadingPdf ? "Gerando PDF..." : "Gerar PDF do relatório"}
          </Button>
        </div>
        <AddEditEventDialog>
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4" />
            Novo evento
          </Button>
        </AddEditEventDialog>
      </div>
    </div>
  );
}
