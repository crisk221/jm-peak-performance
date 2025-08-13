import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  console.log('Export endpoint called');
  try {
    console.log('Starting basic response test...');
    
    const testData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      message: 'Test export working'
    };

    console.log('Returning test data');
    return new NextResponse(JSON.stringify(testData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to export data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
