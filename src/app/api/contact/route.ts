import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, message } = validation.data;

    // In production, you would typically:
    // 1. Send an email notification
    // 2. Store in a database
    // 3. Integrate with a CRM or support system
    
    // For now, we'll just log and return success
    console.log('Contact form submission:', { email, message, timestamp: new Date().toISOString() });

    // You could integrate with services like:
    // - SendGrid/Mailgun for email
    // - Supabase/Firebase for storage
    // - Slack for notifications
    
    return NextResponse.json(
      { success: true, message: 'Thank you for your message. We\'ll get back to you soon!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}