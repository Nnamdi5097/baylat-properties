 import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/send-contact', async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
  }

  // Create transporter pointing to your cPanel email server configuration
  const transporter = nodemailer.createTransport({
    host: 'mail.baylatproperties.ng',
    port: 465,
    secure: true, // Uses SSL/TLS for port 465
    auth: {
      user: 'info@baylatproperties.ng', // Your official created business account
      pass: process.env.EMAIL_PASSWORD,  // Set this password inside your Vercel Environment Variables
    },
  });

  // Beautifully formatted HTML layout for the incoming message inside your inbox
  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; background-color: #f9f9f9; border-radius: 10px; max-width: 600px; margin: 0 auto; border: 1px solid #eee;">
      <h2 style="color: #334155; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px;">New Website Contact Inquiry</h2>
      <p style="margin: 15px 0;"><strong>Client Name:</strong> ${name}</p>
      <p style="margin: 15px 0;"><strong>Client Email:</strong> <a href="mailto:${email}">${email}</a></p>
      <p style="margin: 15px 0;"><strong>Client Phone:</strong> ${phone || 'Not Provided'}</p>
      <div style="background-color: #ffffff; padding: 15px; border-left: 4px solid #475569; margin-top: 20px; border-radius: 4px;">
        <p style="margin: 0; font-style: italic; line-height: 1.6;">"${message}"</p>
      </div>
      <p style="font-size: 11px; color: #94a3b8; margin-top: 30px; text-align: center;">This message was generated automatically via the Baylat Properties contact form endpoint.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"Baylat Properties Portal" <info@baylatproperties.ng>',
      to: 'info@baylatproperties.ng', // The mailbox receiving the notifications
      replyTo: email, // Clicking "Reply" inside your email app will directly write back to the client!
      subject: `📩 New Client Inquiry from ${name}`,
      html: htmlTemplate,
    });

    return res.status(200).json({ success: true, message: 'Message sent cleanly!' });
  } catch (error) {
    console.error('Nodemailer transmission failure:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send message via mail transport mechanism.',
      error: error.message 
    });
  }
});

export default router;