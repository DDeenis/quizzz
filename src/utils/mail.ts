import { env } from "@/env";
import { createTransport } from "nodemailer";
import mjml2html from "mjml";

const transporter = createTransport({
  service: "Gmail",
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

export async function sendMagicLinkEmail({
  email,
  token,
  url,
  origin,
}: {
  email: string;
  token: string;
  url: string;
  origin: string;
}) {
  const compiledEmail = mjml2html(`
    <mjml>
      <mj-body background-color="#ffffff">
        <mj-section background-color="#f0f0f0" padding="20px 0">
          <mj-column>
            <mj-image width="100px" src="${origin}/logo.png" alt="Quiz App Logo" />
          </mj-column>
        </mj-section>

        <mj-section background-color="#ffffff" padding="20px 0">
          <mj-column>
            <mj-text font-size="20px" color="#333333" font-family="Helvetica, Arial, sans-serif">
              Hello,
            </mj-text>
            <mj-text font-size="16px" color="#555555" font-family="Helvetica, Arial, sans-serif" line-height="1.5">
              Welcome to Quiz App! Click the button below to sign in to your account:
            </mj-text>
            <mj-button background-color="#007BFF" color="#ffffff" font-family="Helvetica, Arial, sans-serif" href="${origin}/sign-in/magic-link/${token}">
              Sign In
            </mj-button>
            <mj-text font-size="16px" color="#555555" font-family="Helvetica, Arial, sans-serif" line-height="1.5">
              If you did not request this email, please ignore it.
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section background-color="#f0f0f0" padding="20px 0">
          <mj-column>
            <mj-text font-size="12px" color="#888888" font-family="Helvetica, Arial, sans-serif" align="center">
              © 2024 Quizzz. All rights reserved.
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `);

  if (compiledEmail.errors.length)
    throw new Error(
      `Failed to compile email template: ${compiledEmail.errors
        .map((e) => e.formattedMessage)
        .join(", ")}`
    );

  return await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: email,
    subject: "Your Magic Link ✨",
    // html: `Click <a href="${url}" target="_blank">this link<a> to log in`, // html body
    html: compiledEmail.html,
  });
}
