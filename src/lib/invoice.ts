import type { OrderEmailData } from './email'

export async function generateInvoicePdf(data: OrderEmailData): Promise<Buffer> {
  // Dynamic import — pdfkit is CommonJS and large; import only when needed
  const PDFDocument = (await import('pdfkit')).default

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const BLACK = '#080808'
    const AMBER = '#f59e0b'
    const GRAY = '#6b7280'
    const LIGHT = '#f7f5f0'

    const pageWidth = doc.page.width - 100 // margins

    // ── Header band ──────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 80).fill(BLACK)
    doc
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(20)
      .text('CLASSYCHAIN', 50, 28)
    doc
      .fillColor('rgba(255,255,255,0.4)')
      .font('Helvetica')
      .fontSize(8)
      .text('PREMIUM FOOTWEAR', 50, 52)

    // Amber accent line
    doc.rect(0, 80, doc.page.width, 3).fill(AMBER)

    // ── Invoice title ─────────────────────────────────────────
    doc.moveDown(3)
    doc
      .fillColor(BLACK)
      .font('Helvetica-Bold')
      .fontSize(22)
      .text('TAX INVOICE', 50, 110)

    doc
      .fillColor(GRAY)
      .font('Helvetica')
      .fontSize(9)
      .text(`Invoice No: #${data.orderId.slice(-8).toUpperCase()}`, 50, 138)
    doc.text(
      `Date: ${new Date(data.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      50,
      150
    )

    // ── Meta grid ────────────────────────────────────────────
    const metaTop = 175
    doc.rect(50, metaTop, pageWidth, 90).fill(LIGHT)

    // Left column — Customer
    doc.fillColor(GRAY).font('Helvetica').fontSize(8).text('BILLED TO', 62, metaTop + 12)
    doc
      .fillColor(BLACK)
      .font('Helvetica-Bold')
      .fontSize(11)
      .text(data.customerName, 62, metaTop + 24)
    if (data.customerEmail) {
      doc.fillColor(GRAY).font('Helvetica').fontSize(9).text(data.customerEmail, 62, metaTop + 40)
    }
    doc
      .fillColor(GRAY)
      .font('Helvetica')
      .fontSize(9)
      .text(data.shippingAddress || '—', 62, metaTop + 54, { width: 220 })

    // Right column — Payment
    const rightX = 50 + pageWidth / 2 + 10
    doc.fillColor(GRAY).font('Helvetica').fontSize(8).text('PAYMENT DETAILS', rightX, metaTop + 12)
    doc.fillColor(GRAY).font('Helvetica').fontSize(8).text('Transaction ID', rightX, metaTop + 28)
    doc
      .fillColor(BLACK)
      .font('Helvetica-Bold')
      .fontSize(8)
      .text(data.paymentId, rightX, metaTop + 40, { width: 210 })
    doc.fillColor(GRAY).font('Helvetica').fontSize(8).text('Status', rightX, metaTop + 58)
    doc.fillColor('#065f46').font('Helvetica-Bold').fontSize(9).text('PAID ✓', rightX, metaTop + 70)

    // ── Items table ───────────────────────────────────────────
    const tableTop = metaTop + 108
    const colItem = 50
    const colQty = 370
    const colAmt = 430

    // Table header
    doc.rect(50, tableTop, pageWidth, 24).fill(BLACK)
    doc
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(8)
      .text('ITEM', colItem + 10, tableTop + 8)
      .text('QTY', colQty, tableTop + 8)
      .text('AMOUNT', colAmt, tableTop + 8)

    let rowY = tableTop + 24
    data.items.forEach((item, i) => {
      const bg = i % 2 === 0 ? '#ffffff' : LIGHT
      const rowH = 28
      doc.rect(50, rowY, pageWidth, rowH).fill(bg)
      doc
        .fillColor(BLACK)
        .font('Helvetica')
        .fontSize(9)
        .text(item.name, colItem + 10, rowY + 9, { width: 300, ellipsis: true })
        .text(String(item.quantity), colQty, rowY + 9)
        .text(`Rs. ${(item.price * item.quantity).toLocaleString('en-IN')}`, colAmt, rowY + 9)
      rowY += rowH
    })

    // ── Total ─────────────────────────────────────────────────
    const totalY = rowY + 10
    doc
      .fillColor(GRAY)
      .font('Helvetica')
      .fontSize(10)
      .text('TOTAL PAID', colQty - 60, totalY)
    doc
      .fillColor(BLACK)
      .font('Helvetica-Bold')
      .fontSize(16)
      .text(`Rs. ${data.totalPrice.toLocaleString('en-IN')}`, colQty - 60, totalY + 16)

    // Amber line above total
    doc.rect(50, totalY - 6, pageWidth, 2).fill(AMBER)

    // ── Footer ────────────────────────────────────────────────
    const footerY = doc.page.height - 70
    doc.rect(0, footerY, doc.page.width, 70).fill(BLACK)
    doc
      .fillColor('rgba(255,255,255,0.3)')
      .font('Helvetica')
      .fontSize(8)
      .text('Thank you for shopping with ClassyChain — Premium Footwear', 50, footerY + 14, {
        align: 'center',
        width: doc.page.width - 100,
      })
    doc
      .fillColor('rgba(255,255,255,0.18)')
      .fontSize(7)
      .text('officialccstore@gmail.com  ·  classychain.com', 50, footerY + 30, {
        align: 'center',
        width: doc.page.width - 100,
      })
    doc
      .fontSize(7)
      .text('© 2026 ClassyChain. All rights reserved.', 50, footerY + 44, {
        align: 'center',
        width: doc.page.width - 100,
      })

    doc.end()
  })
}
