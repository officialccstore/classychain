export async function sendOtpSms(phone: string, otp: string): Promise<void> {
  const apiKey = process.env.SMS_API_KEY
  const senderId = process.env.SMS_SENDER_ID || 'CLACHA'
  const entityId = process.env.SMS_ENTITY_ID || ''
  const templateId = process.env.SMS_TEMPLATE_ID || ''

  if (!apiKey) throw new Error('SMS_API_KEY not configured')

  const message = `ClassyChain: Your OTP for login is ${otp}. This code is valid for 10 minutes. Do not share it with anyone.`
  const number = `91${phone}`

  const url = new URL('https://www.smsgatewayhub.com/api/mt/SendSMS')
  url.searchParams.set('APIKey', apiKey)
  url.searchParams.set('senderid', senderId)
  url.searchParams.set('channel', '2')
  url.searchParams.set('DCS', '0')
  url.searchParams.set('flashsms', '0')
  url.searchParams.set('number', number)
  url.searchParams.set('text', message)
  url.searchParams.set('route', 'clickhere')
  if (entityId) url.searchParams.set('EntityId', entityId)
  if (templateId) url.searchParams.set('dlttemplateid', templateId)

  const res = await fetch(url.toString())
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`SMS API error ${res.status}: ${body}`)
  }
}
