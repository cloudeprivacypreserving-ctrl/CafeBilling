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
}

import { formatCurrency } from '@/lib/utils'

const PRINTER_WIDTH = 42 // 80mm thermal printer = ~42 characters
const SEPARATOR = '─'.repeat(PRINTER_WIDTH)
const DOUBLE_SEPARATOR = '═'.repeat(PRINTER_WIDTH)

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
  const availableWidth = PRINTER_WIDTH - qtyStr.length - price.length - 2
  const isTruncated = name.length > availableWidth
  const truncatedName = isTruncated
    ? name.substring(0, availableWidth - 2) + '..'
    : name.padEnd(availableWidth, ' ')
  return `${truncatedName} ${qtyStr.padEnd(4, ' ')}${price.padStart(price.length, ' ')}`
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

  // Items Header
  receipt += SEPARATOR + '\n'
  receipt += 'Item                              Qty  Price\n'
  receipt += SEPARATOR + '\n'

  // Items
  for (const item of data.items) {
    const priceStr = formatCurrency(item.subtotal)
    receipt += formatItemRow(item.name, item.quantity, priceStr) + '\n'
  }

  // Totals
  receipt += SEPARATOR + '\n'
  receipt += `Subtotal${' '.repeat(PRINTER_WIDTH - 'Subtotal'.length - formatCurrency(data.subtotal).length - 1)}${formatCurrency(data.subtotal)}\n`

  if (data.discount > 0) {
    const discountStr = `-${formatCurrency(data.discount)}`
    receipt += `Discount${' '.repeat(PRINTER_WIDTH - 'Discount'.length - discountStr.length - 1)}${discountStr}\n`
  }

  receipt += `Tax (18%)${' '.repeat(PRINTER_WIDTH - 'Tax (18%)'.length - formatCurrency(data.tax).length - 1)}${formatCurrency(data.tax)}\n`
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

  return receipt
}

/**
 * Open virtual printer emulator in a new modal/window
 */
export function openVirtualPrinterEmulator(data: ReceiptData): void {
  const receiptText = generateThermalReceiptText(data)

  // Create a styled HTML representation
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
          white-space: pre-wrap;
          word-wrap: break-word;
          color: #000;
          overflow-y: auto;
          max-height: 600px;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
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
          const element = document.getElementById('receipt');
          const opt = {
            margin: 10,
            filename: 'receipt-${data.orderNumber}.pdf',
            image: { type: 'png', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
          };
          
          // For simplicity, we'll use the browser's native PDF printing
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
