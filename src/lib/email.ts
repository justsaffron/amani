import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY || 'placeholder')
}

interface SendInviteEmailParams {
  to: string
  guestName: string
  coupleName: string
  events: Array<{
    name: string
    date: string
    venue?: string
    address?: string
    city?: string
    dressCode?: string
  }>
  inviteUrl: string
  heroMessage?: string
  /**
   * Optional HTTPS URL for a custom card image served by /api/invite-image.
   * data: URIs must NOT be passed here — convert to a hosted URL first.
   */
  invitationImageUrl?: string
}

export async function sendInviteEmail({
  to,
  guestName,
  coupleName,
  events,
  inviteUrl,
  heroMessage,
  invitationImageUrl,
}: SendInviteEmailParams) {
  const eventsHtml = events
    .map((e) => {
      const mapsQuery = encodeURIComponent(
        [e.venue, e.address, e.city].filter(Boolean).join(' ')
      )
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`
      const hasLocation = e.venue || e.address || e.city

      return `
      <div style="background:#fdf4f4;border-left:4px solid #C9A84C;padding:16px;margin:12px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-weight:600;font-size:18px;color:#2C1810;">${e.name}</p>
        <p style="margin:4px 0 0;color:#6B4226;font-size:14px;">&#128197; ${e.date}</p>
        ${e.venue ? `<p style="margin:4px 0 0;color:#6B4226;font-size:14px;">&#128205; ${e.venue}${e.address ? `, ${e.address}` : ''}${e.city ? `, ${e.city}` : ''}</p>` : ''}
        ${e.dressCode ? `<p style="margin:4px 0 0;color:#6B4226;font-size:14px;">&#128248; Dress code: ${e.dressCode}</p>` : ''}
        ${hasLocation ? `
        <p style="margin:10px 0 0;">
          <a href="${mapsUrl}" style="display:inline-block;background:#fff;border:1px solid #C9A84C;color:#8B6914;text-decoration:none;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:500;">
            &#128204; Get Directions
          </a>
        </p>` : ''}
      </div>
    `
    })
    .join('')

  // Invitation card image — placed at the very top of the email body
  const cardImageHtml = invitationImageUrl
    ? `<div style="text-align:center;margin:0 0 32px;">
        <img src="${invitationImageUrl}" alt="Invitation card" width="560"
          style="max-width:100%;width:560px;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.12);display:block;margin:0 auto;" />
       </div>`
    : ''

  // Gold RSVP button — placed below greeting, above event details
  const rsvpButtonHtml = `
    <div style="text-align:center;margin:32px 0;">
      <a href="${inviteUrl}"
        style="display:inline-block;background-color:#C9A84C;color:#2C1810;text-decoration:none;
               padding:14px 32px;border-radius:6px;font-size:16px;font-weight:bold;
               letter-spacing:0.3px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        View Invitation &amp; RSVP
      </a>
      <p style="color:#B8825A;font-size:12px;margin:12px 0 0;">
        Or copy this link: <a href="${inviteUrl}" style="color:#8B6914;">${inviteUrl}</a>
      </p>
    </div>
  `

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#FDF8F0;margin:0;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#FFFDF7;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(139,69,20,0.12);border:1px solid #E8D5B0;">

        <!-- Header -->
        <div style="background:linear-gradient(160deg,#2C1810 0%,#6B4226 60%,#8B2500 100%);padding:48px 32px;text-align:center;">
          <!-- Gold top line -->
          <div style="border-top:1px solid rgba(201,168,76,0.5);margin:0 0 24px;"></div>
          <p style="color:rgba(237,207,110,0.9);font-size:12px;letter-spacing:4px;text-transform:uppercase;margin:0 0 12px;">
            You are cordially invited
          </p>
          <h1 style="color:#F7EDD8;font-size:40px;margin:0;font-weight:300;letter-spacing:1px;">${coupleName}</h1>
          ${heroMessage ? `<p style="color:rgba(237,207,110,0.9);margin:12px 0 0;font-size:16px;font-style:italic;">${heroMessage}</p>` : ''}
          <!-- Gold bottom line -->
          <div style="border-bottom:1px solid rgba(201,168,76,0.5);margin:24px 0 0;"></div>
        </div>

        <!-- Body -->
        <div style="padding:40px 32px;">

          <!-- 1. Invitation card image (top of body, if uploaded) -->
          ${cardImageHtml}

          <!-- 2. Greeting -->
          <p style="color:#2C1810;font-size:18px;margin:0 0 8px;">Dear ${guestName},</p>
          <p style="color:#6B4226;font-size:16px;line-height:1.6;margin:0 0 8px;">
            We are overjoyed to invite you to celebrate with us.
            Please find your personal event details below and use the button to RSVP.
          </p>

          <!-- 3. RSVP button (above events) -->
          ${rsvpButtonHtml}

          <!-- 4. Event details -->
          <h2 style="color:#2C1810;font-size:14px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;padding-top:8px;border-top:1px solid #E8D5B0;">
            Your Events
          </h2>
          ${eventsHtml}
        </div>

        <!-- Footer -->
        <div style="background:#FDF8F0;padding:24px 32px;text-align:center;border-top:1px solid #E8D5B0;">
          <p style="color:#B8825A;font-size:12px;margin:0;">
            This invitation was sent to ${to}. If you believe you received this in error, please disregard.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
    to,
    subject: `You\u2019re invited \u2014 ${coupleName}`,
    html,
  })
}

export async function sendRsvpConfirmationEmail({
  to,
  guestName,
  coupleName,
  status,
}: {
  to: string
  guestName: string
  coupleName: string
  status: 'ATTENDING' | 'DECLINED' | 'MAYBE'
}) {
  const messages = {
    ATTENDING: "We're so excited to celebrate with you! We'll be in touch with more details soon.",
    DECLINED: "We'll miss you! Thank you for letting us know.",
    MAYBE: "No worries — we hope you can make it! Feel free to update your RSVP anytime.",
  }

  return getResend().emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
    to,
    subject: `RSVP Confirmed \u2014 ${coupleName}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#FFFDF7;border-radius:12px;border:1px solid #E8D5B0;">
        <h2 style="color:#C9A84C;margin:0 0 16px;">Thanks, ${guestName}!</h2>
        <p style="color:#6B4226;line-height:1.6;">${messages[status]}</p>
        <p style="color:#6B4226;">With love,<br/><strong style="color:#2C1810;">${coupleName}</strong></p>
      </div>
    `,
  })
}
