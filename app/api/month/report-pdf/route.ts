import { NextRequest, NextResponse } from "next/server";
import { reportService } from "@/lib/services/reportService";

async function getParams(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const body =
    req.method === "POST" ? await req.json().catch(() => ({})) : undefined;

  const year =
    Number(body?.ano ?? body?.year ?? searchParams.get("ano")) || undefined;
  const month =
    Number(body?.mes ?? body?.month ?? searchParams.get("mes")) || undefined;
  return { year, month };
}

async function handler(req: NextRequest) {
  const { year, month } = await getParams(req);
  if (!year || !month) {
    return NextResponse.json(
      { message: "Informe ano e mês (ex: ano=2025&mes=3)" },
      { status: 400 }
    );
  }

  try {
    const pdfBuffer = await reportService.generatePdf(year, month);

    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="relatorio-${year}-${String(
          month
        ).padStart(2, "0")}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("Erro ao gerar PDF do relatório", error);
    return NextResponse.json(
      {
        message: error?.message || "Erro ao gerar PDF",
        detail: typeof error === "object" ? error : String(error),
      },
      { status: 500 }
    );
  }
}

export const GET = handler;
export const POST = handler;
