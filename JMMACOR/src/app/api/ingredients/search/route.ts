import { NextRequest, NextResponse } from "next/server";
import { suggestMatches } from "@/lib/ingredient-match";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const suggestions = await suggestMatches(query.trim());
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Error searching ingredients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
