function adminContactFormTemplate(contactData) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #094275 0%, #0c5089 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
          SARVIN APPLIANCES
        </h1>
        <p style="color: #ffffff; margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">
          Customer Service Notification
        </p>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 30px 25px;">
        <h2 style="color: #094275; font-size: 20px; font-weight: 600; margin: 0 0 24px 0; border-bottom: 3px solid #C87941; padding-bottom: 12px; text-align: center;">
          New Contact Form Submission
        </h2>
        
        <!-- Customer Information Card -->
        <div style="background-color: #f8fafc; border-left: 4px solid #C87941; padding: 24px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <h3 style="color: #094275; font-size: 15px; font-weight: 600; margin: 0 0 18px 0;">
            Customer Details
          </h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; width: 140px; color: #374151; font-weight: 500; font-size: 13px;">Full Name:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 13px;">${contactData.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #374151; font-weight: 500; font-size: 13px;">Email Address:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 13px;">${contactData.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #374151; font-weight: 500; font-size: 13px;">Phone Number:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 13px;">${contactData.phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #374151; font-weight: 500; font-size: 13px;">Subject:</td>
              <td style="padding: 8px 0; color: #111827; font-weight: 600; font-size: 13px;">${contactData.subject}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #374151; font-weight: 500; font-size: 13px;">Submitted Date:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 13px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #374151; font-weight: 500; font-size: 13px;">Submitted Time:</td>
              <td style="padding: 8px 0; color: #111827; font-size: 13px;">${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
            </tr>
          </table>
        </div>
        
        <!-- Customer Message -->
        <div style="background-color: #fef7f0; border-left: 4px solid #C87941; padding: 24px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <h3 style="color: #094275; font-size: 15px; font-weight: 600; margin: 0 0 16px 0;">
            Customer Message
          </h3>
          <div style="background-color: #ffffff; padding: 18px; border-radius: 6px; border: 1px solid #e5e7eb;">
            <p style="color: #374151; font-size: 13px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${contactData.message}</p>
          </div>
        </div>
        
        <!-- Action Required Notice -->
        <div style="background-color: #d4edda; border: 1px solid #28a745; padding: 18px; border-radius: 8px; margin: 24px 0;">
          <div style="display: flex; align-items: flex-start;">
            <div style="color: #28a745; font-size: 18px; margin-right: 12px;">⚠</div>
            <div>
              <p style="margin: 0; color: #155724; font-size: 13px; line-height: 1.6;">
                <strong>Action Required:</strong> Please respond to this customer inquiry within 24 hours to maintain our service quality standards.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 11px; margin: 0; text-align: center; line-height: 1.5;">
          This is an automated system notification from Sarvin Appliances Customer Service Management System.<br>
          Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  `;
}

function customerContactFormTemplate(contactData) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #094275 0%, #0c5089 100%); padding: 40px 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.5px;">
          SARVIN APPLIANCES
        </h1>
        <p style="color: #ffffff; margin: 8px 0 0 0; font-size: 13px; opacity: 0.9;">
          Customer Service Confirmation
        </p>
      </div>
      
      <!-- Main Content -->
      <div style="padding: 30px 25px;">
        <h2 style="color: #094275; font-size: 22px; font-weight: 600; margin: 0 0 18px 0; text-align: center;">
          Thank You for Contacting Us!
        </h2>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 80px; height: 3px; background-color: #C87941; margin: 0 auto;"></div>
        </div>
        
        <!-- Thank You Message -->
        <div style="background-color: #f8fafc; padding: 28px; border-radius: 10px; margin: 24px 0; text-align: center;">
          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
            Dear ${contactData.name},
          </p>
          <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0;">
            Thank you for reaching out to Sarvin Appliances. We have received your message and our dedicated customer service team will get back to you within 24 hours.
          </p>
        </div>
        
        <!-- Contact Information -->
        <div style="background-color: #fff3cd; border: 1px solid #fbbf24; padding: 18px; border-radius: 8px; margin: 24px 0;">
          <div style="display: flex; align-items: flex-start;">
            <div style="color: #C87941; font-size: 18px; margin-right: 12px;">📞</div>
            <div>
              <p style="margin: 0; color: #92400e; font-size: 13px; line-height: 1.6;">
                <strong>Need immediate assistance?</strong><br>
                Call us at: <a href="tel:+918001234567" style="color: #C87941; text-decoration: none; font-weight: 600;">+91 800 123 4567</a><br>
                Email us at: <a href="mailto:support@sarvin.com" style="color: #C87941; text-decoration: none; font-weight: 600;">support@sarvin.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div style="background-color: #f9fafb; padding: 28px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #6b7280; font-size: 11px; margin: 0 0 10px 0; line-height: 1.5;">
          We appreciate your interest in Sarvin Appliances and look forward to serving you.
        </p>
        <p style="color: #374151; font-size: 12px; margin: 0; font-weight: 500;">
          Best regards,<br>
          <span style="color: #094275; font-weight: 600;">The Sarvin Appliances Customer Service Team</span>
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
  adminContactFormTemplate,
  customerContactFormTemplate
};