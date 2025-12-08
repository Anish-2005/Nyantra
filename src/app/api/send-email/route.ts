import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting email send process...');

    const { to, subject, html, attachments } = await request.json();
    console.log('📧 Email request received:', {
      to,
      subject,
      hasHtml: !!html,
      attachmentCount: attachments?.length || 0
    });

    if (!to || !subject || !html) {
      console.log('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      );
    }

    // Configure Gmail SMTP transporter
    console.log('🔧 Setting up Gmail transporter...');
    console.log('📧 GMAIL_USER:', process.env.GMAIL_USER ? 'Set' : 'Not set');
    console.log('🔑 GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'Set (length: ' + process.env.GMAIL_APP_PASSWORD?.length + ')' : 'Not set');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    console.log('🔧 Verifying Gmail transporter...');
    try {
      await transporter.verify();
      console.log('✅ Gmail SMTP connection verified');
    } catch (verifyError) {
      console.error('❌ Gmail SMTP verification failed:', verifyError);
      return NextResponse.json(
        { error: 'Email configuration error', details: 'Gmail SMTP configuration failed. Please check GMAIL_USER and GMAIL_APP_PASSWORD environment variables.' },
        { status: 500 }
      );
    }

    // Prepare email options
    const processedAttachments = attachments?.map((att: any) => {
      console.log(`📎 Processing attachment: ${att.filename} (${att.contentType})`);
      let content = att.content;

      // Handle Buffer objects (from PDFs)
      if (att.content && typeof att.content === 'object' && att.content.type === 'Buffer') {
        content = Buffer.from(att.content.data);
        console.log(`📎 Converted Buffer attachment: ${content.length} bytes`);
      }

      return {
        filename: att.filename,
        content: content,
        contentType: att.contentType,
        encoding: att.encoding
      };
    }) || [];

    const mailOptions = {
      from: `"Nyantra System" <${process.env.GMAIL_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      attachments: processedAttachments,
    };

    console.log('📤 Sending email via Gmail...');
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully:', info.messageId);

    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully to your Gmail account!'
    });

  } catch (error) {
    console.error('❌ Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
