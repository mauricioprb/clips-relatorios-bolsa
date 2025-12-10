import type { TEventColor } from "@/components/calendar/types";

export const COLORS: TEventColor[] = [
	"azul",
	"verde",
	"vermelho",
	"amarelo",
	"roxo",
	"laranja",
	"cinza",
];

export const colorMap: Record<TEventColor, string> = {
	azul: "blue",
	verde: "green",
	vermelho: "red",
	amarelo: "yellow",
	roxo: "purple",
	laranja: "orange",
	cinza: "gray",
};

export const BG_COLORS: Record<TEventColor, string> = {
	azul: "bg-blue-500",
	verde: "bg-green-500",
	vermelho: "bg-red-500",
	amarelo: "bg-yellow-500",
	roxo: "bg-purple-500",
	laranja: "bg-orange-500",
	cinza: "bg-gray-500",
};

export const BG_LIGHT_COLORS: Record<TEventColor, string> = {
	azul: "bg-blue-200",
	verde: "bg-green-200",
	vermelho: "bg-red-200",
	amarelo: "bg-yellow-200",
	roxo: "bg-purple-200",
	laranja: "bg-orange-200",
	cinza: "bg-gray-200",
};

export const BG_HOVER_COLORS: Record<TEventColor, string> = {
	azul: "hover:bg-blue-300",
	verde: "hover:bg-green-300",
	vermelho: "hover:bg-red-300",
	amarelo: "hover:bg-yellow-300",
	roxo: "hover:bg-purple-300",
	laranja: "hover:bg-orange-300",
	cinza: "hover:bg-gray-300",
};

export const PRIORITY_LABELS: Record<string, string> = {
	vermelho: "Alta Prioridade",
	amarelo: "Média Prioridade",
	verde: "Baixa Prioridade",
};

export const PRIORITY_COLORS: TEventColor[] = ["vermelho", "amarelo", "verde"];


