/**
 * Thermal Printer Emulator
 * Simulates 80mm thermal printer output in the browser
 * No external dependencies needed - pure virtual emulator
 */

interface ReceiptData {
  orderNumber: string
  orderType: string
  createdAt: string
  tableNumber?: string
  customerName?: string
  items: Array<{
    name: string
    quantity: number
    subtotal: number
  }>
  subtotal: number
  discount: number
  tax: number
  total: number
  qrCodePath?: string | null
}

import { formatCurrency } from '@/lib/utils'
// Default QR image (public blob) used when no QR is uploaded in settings
const DEFAULT_QR_URL = 'https://i2bdndgexv7dx4eo.public.blob.vercel-storage.com/qr/qr.jpg'

const PRINTER_WIDTH = 42 // 80mm thermal printer = ~42 characters
const SEPARATOR = '─'.repeat(PRINTER_WIDTH)
const DOUBLE_SEPARATOR = '═'.repeat(PRINTER_WIDTH)

// Fixed column widths for consistent alignment
const QTY_WIDTH = 4
const PRICE_WIDTH = 10
// One space between columns -> NAME_WIDTH = total - qty - price - 2 spaces
const NAME_WIDTH = PRINTER_WIDTH - QTY_WIDTH - PRICE_WIDTH - 2

/**
 * Format text to center in 42-character width
 */
function centerText(text: string): string {
  if (text.length >= PRINTER_WIDTH) return text.substring(0, PRINTER_WIDTH)
  const padding = Math.floor((PRINTER_WIDTH - text.length) / 2)
  return ' '.repeat(padding) + text
}

/**
 * Format text to right-align in 42-character width
 */
function rightAlign(text: string): string {
  if (text.length >= PRINTER_WIDTH) return text.substring(0, PRINTER_WIDTH)
  return text.padStart(PRINTER_WIDTH, ' ')
}

/**
 * Format item row: Name | Qty | Price
 */
function formatItemRow(name: string, qty: number, price: string): string {
  const qtyStr = `${qty}x`

  // Truncate or pad name to fixed NAME_WIDTH
  const isTruncated = name.length > NAME_WIDTH
  const namePart = isTruncated
    ? name.substring(0, NAME_WIDTH - 2) + '..'
    : name.padEnd(NAME_WIDTH, ' ')

  // Qty right-aligned in QTY_WIDTH
  const qtyPart = qtyStr.padStart(QTY_WIDTH, ' ')

  // Price right-aligned in PRICE_WIDTH
  const pricePart = price.padStart(PRICE_WIDTH, ' ')

  // Combine with one space between name and qty, one space between qty and price
  return `${namePart} ${qtyPart} ${pricePart}`
}

/**
 * Generate plain text thermal receipt (what would be sent to printer)
 */
export function generateThermalReceiptText(data: ReceiptData): string {
  let receipt = ''

  // Header
  receipt += centerText('MY CAFE') + '\n'
  receipt += centerText('RECEIPT') + '\n'
  receipt += centerText(`Order #${data.orderNumber}`) + '\n'
  receipt += centerText(data.createdAt) + '\n'
  receipt += '\n'

  // Order Info
  receipt += `Type: ${data.orderType}\n`
  if (data.tableNumber) receipt += `Table: ${data.tableNumber}\n`
  if (data.customerName) receipt += `Customer: ${data.customerName}\n`
  receipt += '\n'

  // Items Header built with same column widths so it lines up
  receipt += SEPARATOR + '\n'
  const headerName = 'Item'.padEnd(NAME_WIDTH, ' ')
  const headerQty = 'Qty'.padStart(QTY_WIDTH, ' ')
  const headerPrice = 'Price'.padStart(PRICE_WIDTH, ' ')
  receipt += `${headerName} ${headerQty} ${headerPrice}\n`
  receipt += SEPARATOR + '\n'

  // Items
  for (const item of data.items) {
    const priceStr = formatCurrency(item.subtotal)
    receipt += formatItemRow(item.name, item.quantity, priceStr) + '\n'
  }

  // Totals
  receipt += SEPARATOR + '\n'

  // Helper to right-align a value on the PRINTER_WIDTH line
  const rightLine = (label: string, value: string) => {
    const left = label
    const padding = PRINTER_WIDTH - left.length - value.length
    return left + ' '.repeat(Math.max(0, padding)) + value + '\n'
  }

  receipt += rightLine('Subtotal', formatCurrency(data.subtotal))

  if (data.discount > 0) {
    const discountStr = `-${formatCurrency(data.discount)}`
    receipt += rightLine('Discount', discountStr)
  }

  receipt += rightLine('Tax (18%)', formatCurrency(data.tax))
  receipt += DOUBLE_SEPARATOR + '\n'

  // Grand Total
  const totalStr = formatCurrency(data.total)
  receipt += centerText('TOTAL') + '\n'
  receipt += centerText(totalStr) + '\n'
  receipt += DOUBLE_SEPARATOR + '\n'

  // Footer
  receipt += centerText('Thank you!') + '\n'
  receipt += centerText('Visit us again') + '\n'
  receipt += '\n'

  // If a QR code path is provided, include a short note (no URL) so the
  // printed receipt doesn't contain long blob URLs — the QR image is shown
  // in the emulator/print preview below the receipt.
  if (data.qrCodePath) {
    const qrNote = 'Scan to pay'
    receipt += '\n' + qrNote + '\n'
  }

  return receipt
}

/**
 * Open virtual printer emulator in a new modal/window
 */
export function openVirtualPrinterEmulator(data: ReceiptData): void {
  const receiptText = generateThermalReceiptText(data)

  // Create a styled HTML representation
  const qrSrc = data.qrCodePath
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}${data.qrCodePath}`
    : DEFAULT_QR_URL

  const qrHtml = `
    <div style="text-align:center; margin-top:12px;">
      <img src="${qrSrc}" alt="QR Code" style="width:120px; height:120px; object-fit:contain; border:1px solid #000; padding:6px; background:#fff;" />
      <div style="font-size:11px; margin-top:6px; color:#333;">Scan to pay</div>
    </div>
  `

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Virtual Thermal Printer - Order #${data.orderNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          font-family: 'Courier New', monospace;
          padding: 20px;
        }

        .printer-container {
          background: #f5f5f5;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          padding: 30px;
          max-width: 600px;
          width: 100%;
        }

        .printer-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .printer-header h1 {
          color: #333;
          font-size: 20px;
          margin-bottom: 5px;
        }

        .printer-header p {
          color: #666;
          font-size: 12px;
        }

        .printer-display {
          background: white;
          border: 3px solid #333;
          border-radius: 4px;
          padding: 20px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.6;
          white-space: pre; /* preserve fixed-width spacing exactly */
          color: #000;
          overflow-y: auto;
          max-height: 600px;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
          width: 42ch; /* match PRINTER_WIDTH characters */
          margin: 0 auto; /* center within container */
        }

        .printer-info {
          margin-top: 20px;
          padding: 15px;
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
          border-radius: 4px;
          font-size: 12px;
          color: #1565c0;
        }

        .printer-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 4px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 120px;
        }

        .btn-print {
          background: #2196f3;
          color: white;
        }

        .btn-print:hover {
          background: #1976d2;
        }

        .btn-download {
          background: #4caf50;
          color: white;
        }

        .btn-download:hover {
          background: #388e3c;
        }

        .btn-close {
          background: #f44336;
          color: white;
        }

        .btn-close:hover {
          background: #d32f2f;
        }

        @media print {
          body {
            background: white;
          }

          .printer-container {
            box-shadow: none;
            padding: 0;
            background: white;
          }

          .printer-header,
          .printer-info,
          .printer-actions {
            display: none;
          }

          .printer-display {
            border: none;
            box-shadow: none;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="printer-container">
        <div class="printer-header">
          <h1>🖨️ Virtual Thermal Printer</h1>
          <p>80mm Thermal Printer Emulator</p>
        </div>

        <div class="printer-display" id="receipt">${receiptText}</div>

        ${qrHtml}

        <div class="printer-info">
          <strong>ℹ️ This is a virtual emulator:</strong> The receipt above shows how it will look on an 80mm thermal printer. 
          You can print this page or download as PDF. Later, connect a real thermal printer via USB/Bluetooth.
        </div>

        <div class="printer-actions">
          <button class="btn btn-print" onclick="window.print()">🖨️ Print</button>
          <button class="btn btn-download" onclick="downloadPDF()">📥 Download PDF</button>
          <button class="btn btn-close" onclick="window.close()">✕ Close</button>
        </div>
      </div>

      <script>
        function downloadPDF() {
          // Simple PDF download using browser's print to PDF
          window.print();
        }
      </script>
    </body>
    </html>
  `

  // Open in new window
  const printWindow = window.open('', '_blank', 'width=600,height=800')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
  }
}

/**
 * Display ESC/POS command preview in console (for debugging)
 */
export function previewESCPOSCommands(data: ReceiptData): string {
  const receiptText = generateThermalReceiptText(data)

  return `
=== ESC/POS Command Preview ===
This would be sent to thermal printer:

${receiptText}

=== END ===
  `.trim()
}
