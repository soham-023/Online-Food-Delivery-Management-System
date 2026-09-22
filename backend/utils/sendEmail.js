const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Skip sending if SMTP is not properly configured
    const smtpConfigured = process.env.SMTP_USER
      && process.env.SMTP_PASS
      && !process.env.SMTP_USER.includes('your-email')
      && !process.env.SMTP_PASS.includes('your-app-password');

    if (!smtpConfigured) {
      console.log('📧 Email (skipped — SMTP not configured):');
      console.log(`  To: ${to}`);
      console.log(`  Subject: ${subject}`);
      return { success: true, message: 'Email logged (SMTP not configured)' };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"AnnSeva" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

// Email templates
const orderConfirmationEmail = (order) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 12px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #ff6b35, #ff9f1c); padding: 30px; text-align: center;">
      <h1 style="color: #fff; margin: 0;">🍔 Order Confirmed!</h1>
    </div>
    <div style="padding: 30px;">
      <p>Hi there! Your order <strong>#${order.id.toString().slice(-8).toUpperCase()}</strong> has been placed successfully.</p>
      <h3 style="color: #ff6b35;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${order.items.map(item => `
          <tr style="border-bottom: 1px solid #333;">
            <td style="padding: 8px;">${item.name} x${item.quantity}</td>
            <td style="padding: 8px; text-align: right;">₹${item.price * item.quantity}</td>
          </tr>
        `).join('')}
        <tr style="font-weight: bold; color: #ff6b35;">
          <td style="padding: 12px 8px;">Total</td>
          <td style="padding: 12px 8px; text-align: right;">₹${order.totalPrice}</td>
        </tr>
      </table>
      <p style="margin-top: 20px;">Payment: <strong>${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</strong></p>
      <p>We'll notify you when your order status updates! 🚀</p>
    </div>
  </div>
`;

const orderStatusEmail = (order, status) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #e0e0e0; border-radius: 12px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #7c5cfc, #00d68f); padding: 30px; text-align: center;">
      <h1 style="color: #fff; margin: 0;">📦 Order Update</h1>
    </div>
    <div style="padding: 30px;">
      <p>Your order <strong>#${order.id.toString().slice(-8).toUpperCase()}</strong> status has been updated:</p>
      <div style="background: #16213e; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h2 style="color: #00d68f; margin: 0;">${status.replace(/_/g, ' ').toUpperCase()}</h2>
      </div>
      <p>Track your order in real-time on our app! 🚚</p>
    </div>
  </div>
`;

module.exports = { sendEmail, orderConfirmationEmail, orderStatusEmail };
