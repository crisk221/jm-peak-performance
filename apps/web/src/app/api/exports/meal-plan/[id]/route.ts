import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../../../lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get session
    const session = await requireAuth();
    const planId = params.id;

    // Dynamic import to avoid bundling Playwright
    const { renderMealPlanPdf } = await import("@jmpp/api/pdf");

    // Generate PDF
    const pdfBuffer = await renderMealPlanPdf(planId, session.user.id);

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="meal-plan-${planId}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: "Meal plan not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
