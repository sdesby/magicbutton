import { NextResponse } from 'next/server';

const WEBHOOK_URL = process.env.WEBHOOK_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!WEBHOOK_URL) {
      throw new Error('Webhook URL not configured');
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Failed to reach webhook');
    }

    const webhookResponse = await response.json();
    return NextResponse.json(webhookResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'Failed to process request', details: message }, { status: 500 });
  }
}
