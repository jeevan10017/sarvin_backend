function newsletterSubscriptionTemplate(subscriberData) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #094275 0%, #0c5089 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
          SARVIN APPLIANCES
        </h1>
        <p style="color: #ffffff; margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">
          Administrative Notification
        </p>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 30px 25px;">
        <h2 style="color: #094275; font-size: 20px; font-weight: 600; margin: 0 0 24px 0; border-bottom: 3px solid #C87941; padding-bottom: 12px; text-align: center;">
          New Newsletter Subscription
        </h2>
        
        <!-- Subscriber Information Card -->
        <div style="background-color: #f8fafc; border-left: 4px solid #C87941; padding: 24px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <h3 style="color: #094275; font-size: 15px; font-weight: 600; margin: 0 0 18px 0;">
            Subscriber Information
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; width: 140px; color: #374151; font-weight: 500; font-size: 13px;">Email Address:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 13px;">${subscriberData.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #374151; font-weight: 500; font-size: 13px;">Date:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 13px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #374151; font-weight: 500; font-size: 13px;">Time:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 13px;">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
            </tr>
          </table>
        </div>
        
        <!-- Status Notice -->
        <div style="background-color: #fef3e7; border: 1px solid #fbbf24; padding: 18px; border-radius: 8px; margin: 24px 0;">
          <div style="display: flex; align-items: flex-start;">
            <div style="color: #C87941; font-size: 18px; margin-right: 12px;">ⓘ</div>
            <div>
              <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                <strong>Subscription Confirmed:</strong> This subscriber has successfully opted in to receive newsletters including exclusive deals, new product announcements, and home improvement resources.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Action Required -->
        <div style="background-color: #eff6ff; border: 1px solid #3b82f6; padding: 18px; border-radius: 8px; margin: 24px 0;">
          <p style="margin: 0; color: #1e40af; font-size: 13px; line-height: 1.6;">
            <strong>Next Steps:</strong> The subscriber will receive a welcome email confirmation and will be added to the active mailing list for future campaigns.
          </p>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 11px; margin: 0; text-align: center; line-height: 1.5;">
          This is an automated system notification from Sarvin Appliances Newsletter Management System.<br>
          Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  `;
}

function welcomeNewsletterTemplate(subscriberData) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #094275 0%, #0c5089 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
          SARVIN APPLIANCES
        </h1>
        <p style="color: #ffffff; margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">
          Welcome to Our Community
        </p>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 30px 25px;">
        <h2 style="color: #094275; font-size: 22px; font-weight: 600; margin: 0 0 18px 0; text-align: center;">
          Welcome to Sarvin Appliances!
        </h2>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 80px; height: 3px; background-color: #C87941; margin: 0 auto;"></div>
        </div>
        
        <!-- Welcome Message -->
        <div style="background-color: #f8fafc; padding: 28px; border-radius: 10px; margin: 24px 0; text-align: center;">
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
            Thank you for subscribing to our newsletter! We're excited to have you as part of the Sarvin Appliances family.
          </p>
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
            You'll now receive exclusive updates, special offers, and valuable insights delivered straight to your inbox.
          </p>
        </div>
        
        <!-- CTA Section -->
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: linear-gradient(135deg, #C87941 0%, #d88a52 100%); padding: 16px 32px; border-radius: 8px; display: inline-block;">
            <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">
              Get Ready for Great Deals!
            </p>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 28px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #6b7280; font-size: 11px; margin: 0 0 10px 0; line-height: 1.5;">
          You can unsubscribe at any time by clicking the unsubscribe link in our emails.
        </p>
        <p style="color: #374151; font-size: 12px; margin: 0; font-weight: 500;">
          Best regards,<br>
          <span style="color: #094275; font-weight: 600;">The Sarvin Appliances Team</span>
        </p>
        
        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 10px; margin: 0;">
            © ${new Date().getFullYear()} Sarvin Appliances. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  `;
}

module.exports = {
  newsletterSubscriptionTemplate,
  welcomeNewsletterTemplate
};