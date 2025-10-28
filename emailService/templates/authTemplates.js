function verificationEmailTemplate(email, verificationUrl, name) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Welcome to ${process.env.APP_NAME}!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering with ${process.env.APP_NAME}. To complete your registration, please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Verify Email Address
        </a>
      </div>
      
      <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        This verification link will expire in 24 hours. If you didn't create an account with ${process.env.APP_NAME}, please ignore this email.
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">
        © ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.
      </p>
    </div>
  `;
}

function passwordResetTemplate(email, resetUrl, name) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
      <p>Hello ${name},</p>
      <p>We received a request to reset your password for your ${process.env.APP_NAME} account. If you made this request, please click the button below to reset your password:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #094275; color: white; padding: 14px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Reset Password
        </a>
      </div>
      
      <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">
        © ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.
      </p>
    </div>
  `;
}

function welcomeEmailTemplate(email, name) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center;">Welcome to ${process.env.APP_NAME}!</h2>
      <p>Hello ${name},</p>
      <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
      <p>You can now enjoy all the features of ${process.env.APP_NAME}. Thank you for joining us!</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/login" 
           style="background-color: #094275; color: white; padding: 14px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
          Login to Your Account
        </a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        If you have any questions, feel free to contact our support team.
      </p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">
        © ${new Date().getFullYear()} ${process.env.APP_NAME}. All rights reserved.
      </p>
    </div>
  `;
}

module.exports = {
  verificationEmailTemplate,
  passwordResetTemplate,
  welcomeEmailTemplate
};