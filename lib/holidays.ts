import { addDays, subDays, format, getYear } from "date-fns";

export type Holiday = {
  date: string; // YYYY-MM-DD
  name: string;
  scope: "nacional" | "estadual" | "municipal";
};

function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

export function getHolidays(year: number): Holiday[] {
  const easter = getEasterDate(year);
  const carnaval = subDays(easter, 47);
  const paixaoCristo = subDays(easter, 2);
  const corpusChristi = addDays(easter, 60);

  const fixedHolidays: Holiday[] = [
    { date: `${year}-01-01`, name: "Confraternização Universal", scope: "nacional" },
    { date: `${year}-04-21`, name: "Tiradentes", scope: "nacional" },
    { date: `${year}-05-01`, name: "Dia Mundial do Trabalho", scope: "nacional" },
    { date: `${year}-05-17`, name: "Instalação do Município", scope: "municipal" },
    { date: `${year}-08-15`, name: "Coroação de Nossa Senhora Medianeira", scope: "municipal" },
    { date: `${year}-09-07`, name: "Independência do Brasil", scope: "nacional" },
    { date: `${year}-09-20`, name: "Revolução Farroupilha", scope: "estadual" },
    { date: `${year}-10-12`, name: "Nossa Senhora Aparecida", scope: "nacional" },
    { date: `${year}-11-02`, name: "Finados", scope: "nacional" },
    { date: `${year}-11-15`, name: "Proclamação da República", scope: "nacional" },
    { date: `${year}-11-20`, name: "Dia Nacional de Zumbi e da Consciência Negra", scope: "nacional" },
    { date: `${year}-12-25`, name: "Natal", scope: "nacional" },
  ];

  const variableHolidays: Holiday[] = [
    { date: format(carnaval, "yyyy-MM-dd"), name: "Carnaval", scope: "nacional" },
    { date: format(paixaoCristo, "yyyy-MM-dd"), name: "Paixão de Cristo", scope: "nacional" },
    { date: format(corpusChristi, "yyyy-MM-dd"), name: "Corpus Christi", scope: "municipal" },
  ];

  return [...fixedHolidays, ...variableHolidays].sort((a, b) => a.date.localeCompare(b.date));
}

export function getHoliday(dateOrString: Date | string): Holiday | undefined {
  let dateString: string;
  let year: number;

  if (typeof dateOrString === "string") {
    dateString = dateOrString;
    year = parseInt(dateString.split("-")[0], 10);
  } else {
    year = getYear(dateOrString);
    dateString = format(dateOrString, "yyyy-MM-dd");
  }

  const holidays = getHolidays(year);
  return holidays.find((h) => h.date === dateString);
}
