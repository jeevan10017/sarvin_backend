const { google } = require('googleapis');
const {
  adminContactFormTemplate,
  customerContactFormTemplate
} = require('./templates/contactFormTemplates');
const {
  newsletterSubscriptionTemplate,
  welcomeNewsletterTemplate
} = require('./templates/newsletterTemplates');
const {
  verificationEmailTemplate,
  passwordResetTemplate,
  welcomeEmailTemplate
} = require('./templates/authTemplates');
const {
  orderConfirmationTemplate,
  orderAdminNotificationTemplate
} = require('./templates/orderTemplates');

class EmailService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );
    this.oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN
    });
    this.adminEmail = process.env.ADMIN_EMAIL;
    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async sendRawEmail(to, subject, html) {
    const messageParts = [
      `From: "${process.env.APP_NAME}" <${process.env.GMAIL_USER}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      html,
    ];
    const message = messageParts.join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`Email sent to ${to} with subject "${subject}"`);
  }

  async sendNewsletterSubscriptionNotification(subscriberData) {
    return this.sendRawEmail(
      this.adminEmail,
      'New Newsletter Subscription - Sarvin Appliances',
      newsletterSubscriptionTemplate(subscriberData)
    );
  }

  async sendContactFormNotification(contactData) {
    await this.sendRawEmail(
      this.adminEmail,
      `New Contact Form Submission - ${contactData.subject}`,
      adminContactFormTemplate(contactData)
    );

    await this.sendRawEmail(
      contactData.email,
      'Thank you for contacting Sarvin Appliances',
      customerContactFormTemplate(contactData)
    );
  }

  async sendWelcomeEmailToSubscriber(subscriberData) {
    return this.sendRawEmail(
      subscriberData.email,
      'Welcome to Sarvin Appliances Newsletter!',
      welcomeNewsletterTemplate(subscriberData)
    );
  }

  async sendVerificationEmail(email, verificationToken, name) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    return this.sendRawEmail(
      email,
      'Verify Your Email Address',
      verificationEmailTemplate(email, verificationUrl, name)
    );
  }

  async sendPasswordResetEmail(email, resetToken, name) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    return this.sendRawEmail(
      email,
      'Reset Your Password',
      passwordResetTemplate(email, resetUrl, name)
    );
  }

  async sendWelcomeEmail(email, name) {
    return this.sendRawEmail(
      email,
      `Welcome to ${process.env.APP_NAME}!`,
      welcomeEmailTemplate(email, name)
    );
  }

  async sendOrderConfirmationEmail(order, user) {
    return this.sendRawEmail(
      user.email,
      `Order Confirmation - #${order.orderId}`,
      orderConfirmationTemplate(order, user)
    );
  }

  async sendOrderNotificationToAdmin(order, user) {
    return this.sendRawEmail(
      this.adminEmail,
      `New Order Received - #${order.orderId}`,
      orderAdminNotificationTemplate(order, user)
    );
  }
}

module.exports = new EmailService();
