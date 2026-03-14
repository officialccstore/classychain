import nodemailer from 'nodemailer'

const STORE_EMAIL = 'officialccstore@gmail.com'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Gmail App Password
  },
})

export interface OrderEmailData {
  orderId: string
  paymentId: string
  customerName: string
  customerEmail?: string
  shippingAddress: string
  items: { name: string; quantity: number; price: number }[]
  totalPrice: number
  createdAt: Date
}

function buildOrderHtml(data: OrderEmailData): string {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ede8;font-size:14px;color:#1a1a1a;">${item.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ede8;font-size:14px;color:#1a1a1a;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #f0ede8;font-size:14px;color:#1a1a1a;text-align:right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>`
    )
    .join('')

  const date = new Date(data.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#080808;padding:28px 40px;">
            <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;letter-spacing:0.08em;text-transform:uppercase;">CLASSYCHAIN</p>
            <p style="margin:4px 0 0;font-size:10px;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.3em;">Premium Footwear</p>
          </td>
        </tr>

        <!-- Amber accent bar -->
        <tr><td style="background:#fbbf24;height:3px;"></td></tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 0;">
            <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.25em;color:#9ca3af;">Order Confirmed</p>
            <h1 style="margin:0 0 24px;font-size:26px;font-weight:900;color:#080808;line-height:1.2;">Thank you, ${data.customerName.split(' ')[0]}.<br/>Your boots are on their way.</h1>
            <p style="margin:0 0 32px;font-size:14px;color:#6b7280;line-height:1.6;">
              We've received your order and it's being prepared. You'll receive a dispatch update soon.<br/>
              If you have any questions, reply to this email or reach us at <a href="mailto:officialccstore@gmail.com" style="color:#fbbf24;text-decoration:none;">officialccstore@gmail.com</a>.
            </p>

            <!-- Order Meta -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f0;border-radius:6px;margin-bottom:28px;">
              <tr>
                <td style="padding:16px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#9ca3af;padding-bottom:4px;">Order ID</td>
                      <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#9ca3af;padding-bottom:4px;text-align:right;">Date</td>
                    </tr>
                    <tr>
                      <td style="font-size:13px;font-weight:700;color:#1a1a1a;">#${data.orderId.slice(-8).toUpperCase()}</td>
                      <td style="font-size:13px;font-weight:700;color:#1a1a1a;text-align:right;">${date}</td>
                    </tr>
                    <tr><td colspan="2" style="padding:10px 0;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" /></td></tr>
                    <tr>
                      <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#9ca3af;padding-bottom:4px;">Transaction ID</td>
                      <td style="font-size:11px;text-transform:uppercase;letter-spacing:0.2em;color:#9ca3af;padding-bottom:4px;text-align:right;">Status</td>
                    </tr>
                    <tr>
                      <td style="font-size:12px;font-weight:700;color:#1a1a1a;word-break:break-all;">${data.paymentId}</td>
                      <td style="text-align:right;"><span style="background:#ecfdf5;color:#065f46;font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;text-transform:uppercase;letter-spacing:0.1em;">Paid</span></td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Items -->
            <p style="margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:0.25em;color:#9ca3af;">Order Summary</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0ede8;margin-bottom:4px;">
              <tr style="background:#f7f5f0;">
                <th style="padding:10px 12px;font-size:11px;text-align:left;text-transform:uppercase;letter-spacing:0.15em;color:#6b7280;font-weight:700;">Item</th>
                <th style="padding:10px 12px;font-size:11px;text-align:center;text-transform:uppercase;letter-spacing:0.15em;color:#6b7280;font-weight:700;">Qty</th>
                <th style="padding:10px 12px;font-size:11px;text-align:right;text-transform:uppercase;letter-spacing:0.15em;color:#6b7280;font-weight:700;">Amount</th>
              </tr>
              ${itemRows}
            </table>

            <!-- Total -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
              <tr>
                <td style="padding:14px 12px;text-align:right;">
                  <span style="font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.15em;">Total Paid &nbsp;</span>
                  <span style="font-size:20px;font-weight:900;color:#080808;">₹${data.totalPrice.toLocaleString('en-IN')}</span>
                </td>
              </tr>
            </table>

            <!-- Shipping -->
            <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.25em;color:#9ca3af;">Shipping To</p>
            <p style="margin:0 0 32px;font-size:14px;color:#374151;line-height:1.6;">${data.shippingAddress || 'Address provided at checkout'}</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#080808;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.25);text-transform:uppercase;letter-spacing:0.25em;">classychain.com</p>
            <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.18);">© 2026 ClassyChain. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendOrderEmail(data: OrderEmailData, pdfBuffer: Buffer) {
  const html = buildOrderHtml(data)
  const subject = `Order Confirmed — #${data.orderId.slice(-8).toUpperCase()} | ClassyChain`

  const recipients: string[] = [STORE_EMAIL]
  if (data.customerEmail) recipients.push(data.customerEmail)

  await transporter.sendMail({
    from: `"ClassyChain" <${process.env.SMTP_USER}>`,
    to: recipients.join(', '),
    subject,
    html,
    attachments: [
      {
        filename: `ClassyChain-Invoice-${data.orderId.slice(-8).toUpperCase()}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  })
}

export async function sendNewsletterNotification(email: string) {
  await transporter.sendMail({
    from: `"ClassyChain" <${process.env.SMTP_USER}>`,
    to: STORE_EMAIL,
    subject: `New Newsletter Subscriber — ${email}`,
    html: `<p style="font-family:sans-serif;">New subscriber: <strong>${email}</strong></p>`,
  })
}
