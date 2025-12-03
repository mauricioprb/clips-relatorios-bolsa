const PDFDocument = require("pdfkit");
import path from "path";
import fs from "fs";
import { ReportData } from "./report";
import { formatHoursValue } from "./formatters";

const pad = 6;

export async function generateReportPdf(data: ReportData) {
  return new Promise<Buffer>((resolve, reject) => {
    setPdfkitDataPath();

    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err: unknown) => reject(err));

    const logosHeight = drawLogos(doc);
    doc.y = doc.page.margins.top + logosHeight + 24; // espaço extra abaixo dos logos

   doc.font("Helvetica").fontSize(11);

// Bolsista
doc.text("Bolsista: ", { continued: true });
doc.font("Helvetica-Bold").text(`${data.config.bolsista}`);
doc.font("Helvetica");

// Orientador
doc.text("Orientador: ", { continued: true });
doc.font("Helvetica-Bold").text(`${data.config.orientador}`);
doc.font("Helvetica");

// Laboratório / Sala
doc.text("Laboratório / Sala: ", { continued: true });
doc.font("Helvetica-Bold").text(`${data.config.laboratorio}`);
doc.font("Helvetica");

// Bolsa
doc.text("Bolsa: ", { continued: true });
doc.font("Helvetica-Bold").text(`${data.config.bolsa}`);
doc.font("Helvetica");

// Mês/Ano
doc.text("Mês/Ano: ", { continued: true });
doc.font("Helvetica-Bold").text(
  `${String(data.month).padStart(2, "0")}/${data.year}`
);
doc.font("Helvetica");

    doc.moveDown();
    drawTable(doc, data);
    drawSignatures(doc);

    doc.end();
  });
}

function setPdfkitDataPath() {
  const dataDir = path.join(
    process.cwd(),
    "node_modules",
    "pdfkit",
    "js",
    "data"
  );
  if (fs.existsSync(dataDir)) {
    const fontApi = (PDFDocument as any).PDFFont;
    if (fontApi && typeof fontApi === "function") {
      // pdfkit expõe PDFFont.dataPath
      (fontApi as any).dataPath = dataDir;
    }
  }
}

function drawLogos(doc: PDFKit.PDFDocument) {
  const topY = doc.page.margins.top;
  const leftX = doc.page.margins.left;
  const rightX = doc.page.width - doc.page.margins.right;
  let maxHeight = 0;

  const leftLogoPath = path.join(process.cwd(), "public", "logo_ufn.png");
  if (fs.existsSync(leftLogoPath)) {
    doc.image(leftLogoPath, leftX, topY, { width: 140 });
    maxHeight = Math.max(maxHeight, 60);
  }

  const rightLogoPath = path.join(process.cwd(), "public", "logo_nano.png");
  if (fs.existsSync(rightLogoPath)) {
    const imgWidth = 140;
    doc.image(rightLogoPath, rightX - imgWidth, topY, {
      width: imgWidth,
    });
    maxHeight = Math.max(maxHeight, 60);
  }

  return maxHeight || 60;
}

function drawTable(doc: PDFKit.PDFDocument, data: ReportData) {
  const startX = doc.page.margins.left;
  const usableWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;

  const columnWidths = [90, 180, usableWidth - (90 + 180 + 90), 90];
  const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0);
  let y = doc.y;

  const padX = pad; // padding horizontal
  const padY = 2;   // padding vertical menor
  const headerHeight = 18;

  const drawHeader = () => {
    doc.font("Helvetica-Bold").fontSize(10);
    const headers = ["Data", "Horário", "Atividades", "Carga horária"];
    let x = startX;
    headers.forEach((text, index) => {
      doc
        .rect(x, y, columnWidths[index], headerHeight)
        .fillAndStroke("#d9d9d9", "black");
      doc
        .fillColor("black")
        .text(text, x + padX, y + 4, {
          width: columnWidths[index] - padX * 2,
        });
      x += columnWidths[index];
    });
    y += headerHeight;
    doc.font("Helvetica").fontSize(10).fillColor("black");
  };

  const ensureSpace = (rowHeight: number) => {
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom - 50) {
      doc.addPage();
      y = doc.page.margins.top;
      drawHeader();
    }
  };

  drawHeader();

  data.days.forEach((day) => {
    const values = [
      day.dayLabel,
      day.scheduleText,
      day.activitiesText,
      formatHoursValue(day.dailyHours),
    ];

    const heights = values.map((text, index) =>
      doc.heightOfString(text, {
        width: columnWidths[index] - padX * 2,
        align: "left",
      })
    );

    const rowHeight = Math.max(...heights) + padY * 2;

    ensureSpace(rowHeight);

    let x = startX;
    values.forEach((text, index) => {
      doc
        .rect(x, y, columnWidths[index], rowHeight)
        .lineWidth(0.6)
        .stroke();
      doc.text(text, x + padX, y + padY, {
        width: columnWidths[index] - padX * 2,
      });
      x += columnWidths[index];
    });
    y += rowHeight;
  });

  const totalRowHeight = 18;
  ensureSpace(totalRowHeight + 40);
  doc.rect(startX, y, totalWidth, totalRowHeight).fill("#3b6e15");
  doc
    .fillColor("white")
    .font("Helvetica-Bold")
    .text("Total de horas mensais", startX + padX, y + 4, {
      width: totalWidth - padX * 2,
      align: "left",
    });
  doc.text(
    formatHoursValue(data.totalHours),
    startX,
    y + 4,
    {
      width: totalWidth - padX,
      align: "right",
    }
  );
  y += totalRowHeight + 30;
}

function drawSignatures(doc: PDFKit.PDFDocument) {
  const pageWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const startX = doc.page.margins.left;
  const midX = startX + pageWidth / 2;
  const y = doc.page.height - doc.page.margins.bottom - 60;

  doc.moveTo(startX + 40, y).lineTo(startX + 200, y).stroke();
  doc.moveTo(midX + 40, y).lineTo(midX + 200, y).stroke();

  doc.font("Helvetica").fontSize(10).fillColor("black");
  doc.text("Aluno", startX + 40, y + 8, { width: 160, align: "center" });
  doc.text("Orientador", midX + 40, y + 8, { width: 160, align: "center" });
}
