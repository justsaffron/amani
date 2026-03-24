import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

export async function sendInviteSms({
  to,
  guestName,
  coupleName,
  inviteUrl,
}: {
  to: string
  guestName: string
  coupleName: string
  inviteUrl: string
}) {
  const message = `Hi ${guestName}! You're invited to celebrate ${coupleName}'s wedding. View your personal invitation & RSVP here: ${inviteUrl}`

  return client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  })
}

export async function sendRsvpReminderSms({
  to,
  guestName,
  coupleName,
  inviteUrl,
  daysUntilDeadline,
}: {
  to: string
  guestName: string
  coupleName: string
  inviteUrl: string
  daysUntilDeadline: number
}) {
  const message = `Hi ${guestName}, just a reminder to RSVP for ${coupleName}'s wedding — ${daysUntilDeadline} days left! ${inviteUrl}`

  return client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  })
}
