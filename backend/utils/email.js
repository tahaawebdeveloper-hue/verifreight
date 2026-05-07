const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendCarrierSigningEmail(carrierEmail, carrierName, packetId, secureToken) {
  const signingUrl = `${process.env.APP_URL}/sign.html?token=${secureToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: carrierEmail,
    subject: 'Carrier Packet - Signature Required',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">

                <!-- HEADER -->
                <tr>
                  <td style="background:#1a1a1a;padding:30px;text-align:center;">
                    <h1 style="margin:0;color:#d4af37;font-size:24px;font-weight:700;">Verifreight</h1>
                    <p style="margin:8px 0 0;color:#999;font-size:14px;">Carrier Packet Signature Request</p>
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:40px 40px 20px;">
                    <p style="margin:0 0 16px;font-size:16px;color:#333;">Hello <strong>${carrierName}</strong>,</p>
                    <p style="margin:0 0 16px;font-size:15px;color:#555;line-height:1.6;">
                      You have received a carrier packet that requires your signature and documents.
                    </p>
                    <p style="margin:0 0 24px;font-size:15px;color:#555;line-height:1.6;">
                      Please click the button below to review and submit your documents:
                    </p>

                    <!-- BUTTON -->
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center" style="padding:10px 0 30px;">
                          <a href="${signingUrl}"
                             style="display:inline-block;padding:16px 40px;background-color:#4CAF50;color:#ffffff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:700;letter-spacing:0.3px;">
                            View and Sign Packet
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0 0 8px;font-size:14px;color:#777;">Or copy and paste this link into your browser:</p>
                    <p style="margin:0 0 24px;font-size:13px;color:#555;word-break:break-all;background:#f8f8f8;padding:12px;border:1px solid #e0e0e0;border-radius:4px;">
                      ${signingUrl}
                    </p>

                    <p style="margin:0;font-size:13px;color:#999;border-top:1px solid #eee;padding-top:20px;">
                      <strong style="color:#555;">Important:</strong> This link is unique to you and should not be shared.
                    </p>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background:#f8f8f8;padding:20px;text-align:center;border-top:1px solid #eee;">
                    <p style="margin:0;font-size:12px;color:#999;">
                      This is an automated email from Verifreight. Please do not reply to this message.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
async function sendBrokerNotificationEmail(brokerEmail, carrierName, packetId) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: brokerEmail,
    subject: 'Carrier Packet Signed - Notification',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2196F3;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Carrier Packet Signed</h1>
          </div>
          <div class="content">
            <p>Good news!</p>
            <p><strong>${carrierName}</strong> has signed the carrier packet.</p>
            <p>You can view the signed packet in your dashboard.</p>
            <p style="text-align: center;">
              <a href="${process.env.APP_URL}/dashboard.html" class="button">View Dashboard</a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated notification from your Broker-Carrier Packet System.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Notification email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw error;
  }
}

async function sendReviewEmail(carrierEmail, carrierName, action, rejectionReason) {
  const isApproved = action === 'approved';

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: carrierEmail,
    subject: isApproved ? 'Your documents have been approved' : 'Your documents need attention',
    html: isApproved ? `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
              <tr><td style="background:#1a1a1a;padding:30px;text-align:center;">
                <h1 style="margin:0;color:#d4af37;font-size:24px;">Verifreight</h1>
              </td></tr>
              <tr><td style="padding:40px;">
                <p style="font-size:16px;color:#333;">Hello <strong>${carrierName}</strong>,</p>
                <p style="font-size:15px;color:#555;">Great news — your documents have been <strong style="color:#4CAF50;">approved</strong>.</p>
                <p style="font-size:15px;color:#555;">You are now cleared to proceed. Thank you for your submission.</p>
              </td></tr>
              <tr><td style="background:#f8f8f8;padding:20px;text-align:center;border-top:1px solid #eee;">
                <p style="margin:0;font-size:12px;color:#999;">This is an automated email from Verifreight. Please do not reply.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    ` : `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
              <tr><td style="background:#1a1a1a;padding:30px;text-align:center;">
                <h1 style="margin:0;color:#d4af37;font-size:24px;">Verifreight</h1>
              </td></tr>
              <tr><td style="padding:40px;">
                <p style="font-size:16px;color:#333;">Hello <strong>${carrierName}</strong>,</p>
                <p style="font-size:15px;color:#555;">Unfortunately, your submitted documents require attention.</p>
                ${rejectionReason ? `<p style="font-size:15px;color:#555;"><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
                <p style="font-size:15px;color:#555;">Please contact your broker for further instructions on resubmitting your documents.</p>
              </td></tr>
              <tr><td style="background:#f8f8f8;padding:20px;text-align:center;border-top:1px solid #eee;">
                <p style="margin:0;font-size:12px;color:#999;">This is an automated email from Verifreight. Please do not reply.</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `
  };

try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Review email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending review email:', error);
    throw error;
  }
}

async function sendPasswordResetEmail(email, resetUrl) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Verifreight Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d4af37; color: #000; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #d4af37; color: #000; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Password Reset Request</h1></div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your Verifreight password.</p>
            <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
            <p style="text-align:center;">
              <a href="${resetUrl}" class="button">Reset My Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break:break-all; background:#fff; padding:10px; border:1px solid #ddd;">${resetUrl}</p>
            <p><strong>If you did not request this, you can safely ignore this email.</strong></p>
          </div>
          <div class="footer"><p>This is an automated email from Verifreight. Do not reply.</p></div>
        </div>
      </body>
      </html>
    `
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

async function sendVerificationEmail(email, verifyUrl) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Verifreight Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d4af37; color: #000; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #d4af37; color: #000; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Verify Your Email</h1></div>
          <div class="content">
            <p>Welcome to Verifreight!</p>
            <p>Please verify your email address to activate your account.</p>
            <p style="text-align:center;">
              <a href="${verifyUrl}" class="button">Verify My Email</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break:break-all; background:#fff; padding:10px; border:1px solid #ddd;">${verifyUrl}</p>
            <p>This link expires in <strong>24 hours</strong>.</p>
          </div>
          <div class="footer"><p>This is an automated email from Verifreight. Do not reply.</p></div>
        </div>
      </body>
      </html>
    `
  };
  await transporter.sendMail(mailOptions);
}


module.exports = { 
  sendCarrierSigningEmail, 
  sendBrokerNotificationEmail, 
  sendReviewEmail,
  sendPasswordResetEmail,
  sendVerificationEmail
};