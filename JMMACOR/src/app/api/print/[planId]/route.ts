import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { getPlan } from '@/app/actions/plan';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ planId: string }> }
) {
  const { planId } = await context.params;

  try {
    // First verify the plan exists
    const plan = await getPlan(planId);
    
    // Get the base URL from the request
    const baseUrl = new URL(request.url).origin;
    const printUrl = `${baseUrl}/print/${planId}`;

    // Launch Playwright browser
    const browser = await chromium.launch({
      headless: true,
    });

    const page = await browser.newPage();

    // Navigate to the print page and wait for it to load
    await page.goto(printUrl, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '12mm',
        right: '12mm',
        bottom: '16mm',
        left: '12mm',
      },
      // Ensure good page breaks
      preferCSSPageSize: true,
    });

    await browser.close();

    // Generate filename
    const clientName = plan.client.fullName
      .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
      .slice(0, 20); // Limit length
    
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const filename = `MealPlan-${clientName}-${date}.pdf`;

    // Return PDF as download
    return new NextResponse(pdf as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdf.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    
    // Return error response
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to generate PDF',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
