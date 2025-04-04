import { NextResponse } from 'next/server';

const WEBHOOK_URL = process.env.WEBHOOK_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!WEBHOOK_URL) {
      console.error('Webhook URL is not configured in environment variables');
      return NextResponse.json(
        { error: 'Webhook URL not configured' },
        { status: 500 }
      );
    }

    console.log('Attempting to call webhook at:', WEBHOOK_URL);
    console.log('With body:', body);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error:', {
        url: WEBHOOK_URL,
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to send feeling',
          details: `Status ${response.status}: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    // Parse and forward the webhook response
    const webhookResponse = await response.json();
    console.log('Received webhook response:', webhookResponse);
    return NextResponse.json(webhookResponse);
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
