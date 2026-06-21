const axios = require('axios');

const brevoClient = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: {
    'api-key': process.env.BREVO_API_KEY,
    'Content-Type': 'application/json',
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const senderEmail = process.env.EMAIL_FROM_EMAIL;
    const senderName = process.env.EMAIL_FROM_NAME;

    if (!senderEmail) {
      console.error('EMAIL_FROM_EMAIL is not set');
      return { success: false, error: 'Sender email not configured' };
    }

    const response = await brevoClient.post('/smtp/email', {
      sender: {
        name: senderName || 'Viva Logistics',
        email: senderEmail,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    });

    console.log('Email sent:', response.data.messageId);
    return { success: true, messageId: response.data.messageId };
  } catch (error) {
    console.error('Email error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data?.message || error.message };
  }
};

// ========== CLEAN EMAIL TEMPLATES ==========

const getVerificationEmail = (name, token, frontendUrl) => {
  const verifyUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
  
  return {
    subject: 'Verify your email — Viva Logistics',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="100%" max-width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#ffffff;border-radius:16px;">
          
          <!-- Brand -->
          <tr>
            <td align="center" style="padding:40px 32px 24px;">
              <p style="margin:0;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">VIVA</p>
              <p style="margin:2px 0 0;font-size:9px;font-weight:700;color:#f59e0b;letter-spacing:3px;text-transform:uppercase;">Logistics</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">Hi ${name},</p>
              <p style="margin:0 0 32px;font-size:15px;color:#64748b;line-height:1.6;">Thanks for signing up. Please confirm your email address to get started.</p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <a href="${verifyUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;">Verify email address</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">Or paste this link into your browser:</p>
              <p style="margin:0;padding:12px 16px;background:#f8fafc;border-radius:8px;font-size:12px;color:#475569;word-break:break-all;line-height:1.5;">${verifyUrl}</p>
              
              <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">Viva Logistics — Premium vehicle rentals across Nigeria</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Hi ${name},\n\nVerify your Viva Logistics email: ${verifyUrl}\n\nThis link expires in 24 hours.`,
  };
};

const getWelcomeEmail = (name) => {
  const fleetUrl = `${process.env.FRONTEND_URL}/vehicles`;
  
  return {
    subject: 'Welcome to Viva Logistics',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="100%" max-width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#ffffff;border-radius:16px;">
          
          <tr>
            <td align="center" style="padding:40px 32px 8px;">
              <p style="margin:0;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">VIVA</p>
              <p style="margin:2px 0 0;font-size:9px;font-weight:700;color:#f59e0b;letter-spacing:3px;text-transform:uppercase;">Logistics</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:24px 32px 32px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">You're all set, ${name}</p>
              <p style="margin:0 0 32px;font-size:15px;color:#64748b;line-height:1.6;">Your email is verified and your account is ready.</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:16px;background:#f8fafc;border-radius:12px;margin-bottom:12px;">
                    <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0f172a;">500+ Vehicles</p>
                    <p style="margin:0;font-size:13px;color:#64748b;">Cars, SUVs, buses and vans — inspected and ready.</p>
                  </td>
                </tr>
                <tr><td style="height:12px;"></td></tr>
                <tr>
                  <td style="padding:16px;background:#f8fafc;border-radius:12px;">
                    <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0f172a;">Instant Booking</p>
                    <p style="margin:0;font-size:13px;color:#64748b;">Reserve in minutes. Pick up in hours.</p>
                  </td>
                </tr>
                <tr><td style="height:12px;"></td></tr>
                <tr>
                  <td style="padding:16px;background:#f8fafc;border-radius:12px;">
                    <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#0f172a;">Fully Insured</p>
                    <p style="margin:0;font-size:13px;color:#64748b;">Every ride comes with comprehensive coverage.</p>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${fleetUrl}" style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;">Browse the fleet</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">Viva Logistics — Move like you own the road</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Hi ${name}, welcome to Viva Logistics! Browse our fleet: ${fleetUrl}`,
  };
};

const getPasswordResetEmail = (name, token, frontendUrl) => {
  const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
  
  return {
    subject: 'Reset your password — Viva Logistics',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset password</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="100%" max-width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#ffffff;border-radius:16px;">
          
          <tr>
            <td align="center" style="padding:40px 32px 24px;">
              <p style="margin:0;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">VIVA</p>
              <p style="margin:2px 0 0;font-size:9px;font-weight:700;color:#f59e0b;letter-spacing:3px;text-transform:uppercase;">Logistics</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:0 32px 32px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">Reset your password</p>
              <p style="margin:0 0 32px;font-size:15px;color:#64748b;line-height:1.6;">Hi ${name}, we received a request to reset your password. Click below to choose a new one.</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <a href="${resetUrl}" style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;">Reset password</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;">Or paste this link:</p>
              <p style="margin:0;padding:12px 16px;background:#f8fafc;border-radius:8px;font-size:12px;color:#475569;word-break:break-all;line-height:1.5;">${resetUrl}</p>
              
              <p style="margin:24px 0 0;font-size:12px;color:#94a3b8;">This link expires in 1 hour. If you didn't request this, ignore it — your account is safe.</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">Viva Logistics</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    text: `Hi ${name}, reset your password: ${resetUrl}\n\nExpires in 1 hour.`,
  };
};

const getBookingConfirmationEmail = (name, booking) => ({
  subject: `Booking confirmed — ${booking.vehicle.name}`,
  html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="100%" max-width="480" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#ffffff;border-radius:16px;">
          
          <tr>
            <td align="center" style="padding:40px 32px 8px;">
              <p style="margin:0;font-size:26px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">VIVA</p>
              <p style="margin:2px 0 0;font-size:9px;font-weight:700;color:#f59e0b;letter-spacing:3px;text-transform:uppercase;">Logistics</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:24px 32px 32px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:700;color:#0f172a;">Booking confirmed</p>
              <p style="margin:0 0 32px;font-size:15px;color:#64748b;line-height:1.6;">Hi ${name}, your ride is locked in.</p>
              
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                    <span style="font-size:13px;color:#94a3b8;">Vehicle</span>
                    <span style="float:right;font-size:14px;font-weight:600;color:#0f172a;">${booking.vehicle.name}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                    <span style="font-size:13px;color:#94a3b8;">Pickup</span>
                    <span style="float:right;font-size:14px;font-weight:600;color:#0f172a;">${new Date(booking.startDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                    <span style="font-size:13px;color:#94a3b8;">Return</span>
                    <span style="float:right;font-size:14px;font-weight:600;color:#0f172a;">${new Date(booking.endDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                    <span style="font-size:13px;color:#94a3b8;">Duration</span>
                    <span style="float:right;font-size:14px;font-weight:600;color:#0f172a;">${booking.totalDays} day${booking.totalDays > 1 ? 's' : ''}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 16px;border-bottom:1px solid #f1f5f9;">
                    <span style="font-size:13px;color:#94a3b8;">Location</span>
                    <span style="float:right;font-size:14px;font-weight:600;color:#0f172a;">${booking.pickupLocation}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px;background:#0f172a;border-radius:0 0 10px 10px;">
                    <span style="font-size:13px;color:#94a3b8;">Total</span>
                    <span style="float:right;font-size:18px;font-weight:700;color:#f59e0b;">₦${Number(booking.totalPrice).toLocaleString()}</span>
                  </td>
                </tr>
              </table>
              
              <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">Show this confirmation at pickup. Safe travels!</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #f1f5f9;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">Viva Logistics</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  text: `Booking Confirmed! ${booking.vehicle.name} from ${new Date(booking.startDate).toDateString()} to ${new Date(booking.endDate).toDateString()}. Total: ₦${Number(booking.totalPrice).toLocaleString()}. Pickup: ${booking.pickupLocation}`,
});

module.exports = {
  sendEmail,
  getVerificationEmail,
  getWelcomeEmail,
  getPasswordResetEmail,
  getBookingConfirmationEmail,
};