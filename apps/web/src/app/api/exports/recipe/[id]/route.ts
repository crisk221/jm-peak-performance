import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Temporarily disabled - PDF generation causes build issues
  return NextResponse.json({ error: "PDF export temporarily disabled" }, { status: 503 });
  
  /*
  try {
    // Dynamic import to avoid bundling Playwright
    const { renderRecipePdf } = await import("@jmpp/api/pdf");
    // Get session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipeId = params.id;

    // Generate PDF
    const pdfBuffer = await renderRecipePdf(recipeId, session.user.id);

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="recipe-${recipeId}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
  */
}
