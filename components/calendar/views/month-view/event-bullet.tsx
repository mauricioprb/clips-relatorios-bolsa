import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { transition } from "@/components/calendar/animations";
import type { TEventColor } from "@/components/calendar/types";

const eventBulletVariants = cva("size-2 rounded-full", {
	variants: {
		color: {
			azul: "bg-blue-600 dark:bg-blue-500",
			verde: "bg-green-600 dark:bg-green-500",
			vermelho: "bg-red-600 dark:bg-red-500",
			amarelo: "bg-yellow-600 dark:bg-yellow-500",
			roxo: "bg-purple-600 dark:bg-purple-500",
			laranja: "bg-orange-600 dark:bg-orange-500",
			cinza: "bg-gray-600 dark:bg-gray-500",
		},
	},
	defaultVariants: {
		color: "azul",
	},
});

export function EventBullet({
	color,
	className,
}: {
	color: TEventColor;
	className?: string;
}) {
	return (
		<motion.div
			className={cn(eventBulletVariants({ color, className }))}
			initial={{ scale: 0, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			whileHover={{ scale: 1.2 }}
			transition={transition}
		/>
	);
}
