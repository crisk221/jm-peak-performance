import { NextRequest, NextResponse } from "next/server";
import { extractFromHtml } from "@/lib/recipe-extract";

// Force Node.js runtime for server-side requests
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 },
      );
    }

    // Only allow HTTP/HTTPS
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Only HTTP and HTTPS URLs are supported" },
        { status: 400 },
      );
    }

    // Fetch the HTML
    let html: string;
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Recipe-Import/1.0)",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        // Add timeout
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        return NextResponse.json(
          {
            error: `Failed to fetch URL: ${response.status} ${response.statusText}`,
          },
          { status: 400 },
        );
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) {
        return NextResponse.json(
          { error: "URL does not return HTML content" },
          { status: 400 },
        );
      }

      html = await response.text();
    } catch (error) {
      console.error("Error fetching URL:", error);
      return NextResponse.json(
        { error: "Failed to fetch URL. Please check the URL and try again." },
        { status: 400 },
      );
    }

    // Extract recipe data
    try {
      const extractedRecipe = await extractFromHtml(html, url);

      if (!extractedRecipe) {
        return NextResponse.json(
          {
            error:
              "No recipe data found on this page. Please try a different URL.",
          },
          { status: 400 },
        );
      }

      return NextResponse.json({
        success: true,
        recipe: extractedRecipe,
        sourceUrl: url,
      });
    } catch (error) {
      console.error("Error extracting recipe:", error);
      return NextResponse.json(
        { error: "Failed to parse recipe data from the page." },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in recipe import API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
