import { resend, FROM_ADDRESS } from './resend'

export async function sendWelcomeEmail(email: string): Promise<void> {
  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: 'Welcome to PCS Schools 🎖️',
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8" /></head>
          <body style="font-family: sans-serif; background: #F8F7F4; margin: 0; padding: 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background: #F8F7F4; padding: 40px 16px;">
              <tr>
                <td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">

                    <!-- Header -->
                    <tr>
                      <td style="background: #1B2A4A; padding: 32px 40px; text-align: center;">
                        <p style="margin: 0 0 8px 0; color: #E8A020; font-size: 12px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Built by military families</p>
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800;">Welcome to PCS Schools</h1>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding: 36px 40px;">
                        <p style="margin: 0 0 16px; color: #1B2A4A; font-size: 16px; line-height: 1.6;">
                          Hey there 👋 — thanks for joining PCS Schools.
                        </p>
                        <p style="margin: 0 0 16px; color: #475569; font-size: 15px; line-height: 1.6;">
                          We built this so military families can find schools that actually understand what a PCS move means — from credit transfers and IEP continuity to just feeling welcomed on day one.
                        </p>
                        <p style="margin: 0 0 28px; color: #475569; font-size: 15px; line-height: 1.6;">
                          If you've PCS'd recently, your review could save the next family weeks of uncertainty. It only takes about 5 minutes.
                        </p>

                        <!-- CTA Button -->
                        <table cellpadding="0" cellspacing="0" style="margin: 0 auto 28px;">
                          <tr>
                            <td style="background: #E8A020; border-radius: 10px;">
                              <a href="https://pcs-military-app.vercel.app/review"
                                style="display: inline-block; padding: 14px 32px; color: #1B2A4A; font-weight: 800; font-size: 15px; text-decoration: none;">
                                Write a Review
                              </a>
                            </td>
                          </tr>
                        </table>

                        <!-- Divider -->
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0 0 24px;" />

                        <!-- What families rate -->
                        <p style="margin: 0 0 12px; color: #1B2A4A; font-size: 14px; font-weight: 700;">What you can rate:</p>
                        <table cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td style="padding: 4px 0; color: #475569; font-size: 13px;">🎓 Academic Experience</td>
                            <td style="padding: 4px 0; color: #475569; font-size: 13px;">📋 Enrollment &amp; Transition</td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0; color: #475569; font-size: 13px;">💜 Special Needs Support</td>
                            <td style="padding: 4px 0; color: #475569; font-size: 13px;">🤝 Community &amp; Belonging</td>
                          </tr>
                          <tr>
                            <td style="padding: 4px 0; color: #475569; font-size: 13px;">📣 Communication</td>
                            <td style="padding: 4px 0; color: #475569; font-size: 13px;">⭐ Military-Family Fit</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background: #F8F7F4; padding: 20px 40px; text-align: center;">
                        <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                          PCS Schools · Built by military families, for military families
                        </p>
                        <p style="margin: 6px 0 0; color: #94a3b8; font-size: 12px;">
                          <a href="https://pcs-military-app.vercel.app" style="color: #94a3b8;">pcs-military-app.vercel.app</a>
                        </p>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    })
  } catch (err) {
    // Never throw — welcome email failure should not block registration
    console.error('[sendWelcomeEmail] failed', err)
  }
}
