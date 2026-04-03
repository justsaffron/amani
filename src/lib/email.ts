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
  /** Optional base64 data URL (data:image/...;base64,...) or https URL for a custom card image */
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
      <div style="background:#fdf4f4;border-left:4px solid #e05c60;padding:16px;margin:12px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0;font-weight:600;font-size:18px;color:#2d2d2d;">${e.name}</p>
        <p style="margin:4px 0 0;color:#666;font-size:14px;">&#128197; ${e.date}</p>
        ${e.venue ? `<p style="margin:4px 0 0;color:#666;font-size:14px;">&#128205; ${e.venue}${e.address ? `, ${e.address}` : ''}${e.city ? `, ${e.city}` : ''}</p>` : ''}
        ${e.dressCode ? `<p style="margin:4px 0 0;color:#666;font-size:14px;">&#128248; Dress code: ${e.dressCode}</p>` : ''}
        ${hasLocation ? `
        <p style="margin:10px 0 0;">
          <a href="${mapsUrl}" style="display:inline-block;background:#fff;border:1px solid #e05c60;color:#e05c60;text-decoration:none;padding:6px 14px;border-radius:20px;font-size:13px;font-weight:500;">
            &#128204; Get Directions
          </a>
        </p>` : ''}
      </div>
    `
    })
    .join('')

  const cardImageHtml = invitationImageUrl
    ? `<div style="text-align:center;margin:0 0 32px;">
        <img src="${invitationImageUrl}" alt="Invitation card" style="max-width:100%;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.1);" />
       </div>`
    : ''

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9f5f0;margin:0;padding:20px;">
      <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <div style="background:linear-gradient(135deg,#e05c60,#cc3f44);padding:48px 32px;text-align:center;">
          <p style="color:rgba(255,255,255,0.8);font-size:14px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">You're invited</p>
          <h1 style="color:#fff;font-size:36px;margin:0;font-weight:300;letter-spacing:1px;">${coupleName}</h1>
          ${heroMessage ? `<p style="color:rgba(255,255,255,0.9);margin:12px 0 0;font-size:16px;font-style:italic;">${heroMessage}</p>` : ''}
        </div>

        <!-- Body -->
        <div style="padding:40px 32px;">
          <p style="color:#2d2d2d;font-size:18px;margin:0 0 8px;">Dear ${guestName},</p>
          <p style="color:#555;font-size:16px;line-height:1.6;margin:0 0 32px;">
            We are overjoyed to invite you to celebrate with us. Please find your personal event details below.
          </p>

          ${cardImageHtml}

          <h2 style="color:#2d2d2d;font-size:16px;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin:0 0 16px;">Your Events</h2>
          ${eventsHtml}

          <div style="text-align:center;margin:40px 0 0;">
            <a href="${inviteUrl}" style="display:inline-block;background:#e05c60;color:#fff;text-decoration:none;padding:16px 40px;border-radius:50px;font-size:16px;font-weight:500;letter-spacing:0.5px;">
              View Invitation &amp; RSVP
            </a>
            <p style="color:#999;font-size:12px;margin:16px 0 0;">Or copy this link: ${inviteUrl}</p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background:#f9f5f0;padding:24px 32px;text-align:center;">
          <p style="color:#999;font-size:12px;margin:0;">
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
    subject: `You're invited \u2014 ${coupleName}`,
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
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#fff;border-radius:12px;">
        <h2 style="color:#e05c60;">Thanks, ${guestName}!</h2>
        <p style="color:#555;line-height:1.6;">${messages[status]}</p>
        <p style="color:#555;">With love,<br/><strong>${coupleName}</strong></p>
      </div>
    `,
  })
}
