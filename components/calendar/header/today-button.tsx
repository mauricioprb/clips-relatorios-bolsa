import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { buttonHover } from "@/components/calendar/animations";
import { useCalendar } from "@/components/calendar/contexts/calendar-context";

const MotionButton = motion.create(Button);

export function TodayButton() {
  const { setSelectedDate } = useCalendar();

  const today = new Date();
  const handleClick = () => setSelectedDate(today);

  return (
    <MotionButton
      variant="outline"
      className="flex h-16 w-14 flex-col p-0 overflow-hidden rounded-lg bg-white gap-0"
      onClick={handleClick}
      variants={buttonHover}
      whileHover="hover"
      whileTap="tap"
    >
      <motion.span
        className="w-full bg-primary py-1 text-xs font-semibold text-primary-foreground text-center"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {format(today, "MMM", { locale: ptBR }).toUpperCase()}
      </motion.span>

      <motion.span
        className="flex-1 flex w-full items-center justify-center text-lg font-bold"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {today.getDate()}
      </motion.span>
    </MotionButton>
  );
}
