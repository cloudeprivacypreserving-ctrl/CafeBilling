/**
 * ESC/POS Thermal Printer Receipt Generator
 * Generates ESC/POS commands for 80mm thermal printers
 * Compatible with QZ Tray virtual printer emulator
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

export class ESCPOSReceipt {
  // ESC/POS Control Codes
  static readonly ESC = '\x1B'
  static readonly GS = '\x1D'
  static readonly LF = '\x0A'

  private commands: Uint8Array[] = []

  constructor() {
    this.commands = []
  }

  /**
   * Initialize the printer
   */
  init(): ESCPOSReceipt {
    this.commands.push(new TextEncoder().encode(`${ESCPOSReceipt.ESC}@`))
    return this
  }

  /**
   * Set text alignment (0=left, 1=center, 2=right)
   */
  align(align: number): ESCPOSReceipt {
    this.commands.push(
      new TextEncoder().encode(`${ESCPOSReceipt.ESC}a${String.fromCharCode(align)}`)
    )
    return this
  }

  /**
   * Set text size (width x height multiplier)
   */
  size(width: number, height: number): ESCPOSReceipt {
    const sizeValue = (width << 4) | height
    this.commands.push(
      new TextEncoder().encode(`${ESCPOSReceipt.GS}!${String.fromCharCode(sizeValue)}`)
    )
    return this
  }

  /**
   * Bold on/off
   */
  bold(enabled: boolean): ESCPOSReceipt {
    const value = enabled ? 1 : 0
    this.commands.push(
      new TextEncoder().encode(`${ESCPOSReceipt.ESC}E${String.fromCharCode(value)}`)
    )
    return this
  }

  /**
   * Underline on/off
   */
  underline(enabled: boolean): ESCPOSReceipt {
    const value = enabled ? 1 : 0
    this.commands.push(
      new TextEncoder().encode(`${ESCPOSReceipt.ESC}-${String.fromCharCode(value)}`)
    )
    return this
  }

  /**
   * Print text
   */
  text(text: string): ESCPOSReceipt {
    this.commands.push(new TextEncoder().encode(text))
    return this
  }

  /**
   * New line
   */
  newLine(): ESCPOSReceipt {
    this.commands.push(new TextEncoder().encode(ESCPOSReceipt.LF))
    return this
  }

  /**
   * Dashed line separator
   */
  dashedLine(): ESCPOSReceipt {
    this.text(''.padEnd(42, '-')).newLine()
    return this
  }

  /**
   * Solid line separator
   */
  solidLine(): ESCPOSReceipt {
    this.text(''.padEnd(42, '=')).newLine()
    return this
  }

  /**
   * Cut paper (full cut=false, partial cut=true)
   */
  cut(partial: boolean): ESCPOSReceipt {
    const cutType = partial ? 1 : 0
    this.commands.push(
      new TextEncoder().encode(`${ESCPOSReceipt.GS}V${String.fromCharCode(cutType)}\x00`)
    )
    return this
  }

  /**
   * Open cash drawer
   */
  openDrawer(): ESCPOSReceipt {
    const openCmd = `${ESCPOSReceipt.ESC}p${String.fromCharCode(0)}${String.fromCharCode(25)}${String.fromCharCode(250)}`
    this.commands.push(new TextEncoder().encode(openCmd))
    return this
  }

  /**
   * Get the commands as a Uint8Array buffer
   */
  getBuffer(): Uint8Array {
    const totalLength = this.commands.reduce((sum, cmd) => sum + cmd.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0

    for (const cmd of this.commands) {
      result.set(cmd, offset)
      offset += cmd.length
    }

    return result
  }

  /**
   * Get the commands as base64 string
   */
  toBase64(): string {
    const buffer = this.getBuffer()
    let binary = ''
    for (let i = 0; i < buffer.length; i++) {
      binary += String.fromCharCode(buffer[i])
    }
    return btoa(binary)
  }

  /**
   * Get the commands as array (for debugging)
   */
  toArray(): number[] {
    return Array.from(this.getBuffer())
  }
}

/**
 * Generate a complete ESC/POS receipt
 */
export function generateESCPOSReceipt(data: ReceiptData): Uint8Array {
  const receipt = new ESCPOSReceipt()

  // Header
  receipt
    .init()
    .align(1)
    .bold(true)
    .size(1, 1)
    .text('MY CAFE')
    .newLine()
    .bold(false)
    .size(0, 0)
    .text('Receipt')
    .newLine()
    .text(`Order #${data.orderNumber}`)
    .newLine()
    .text(data.createdAt)
    .newLine()
    .dashedLine()

  // Order details
  receipt.align(0).text(`Type: ${data.orderType}`).newLine()

  if (data.tableNumber) {
    receipt.text(`Table: ${data.tableNumber}`).newLine()
  }

  if (data.customerName) {
    receipt.text(`Customer: ${data.customerName}`).newLine()
  }

  receipt.newLine()

  // Items header
  const headerLine = 'Item'.padEnd(24) + 'Qty'.padEnd(6) + 'Total'
  receipt.text(headerLine).newLine().dashedLine()

  // Items
  for (const item of data.items) {
    const itemLine =
      item.name.substring(0, 24).padEnd(24) +
      item.quantity.toString().padEnd(6) +
      `₹${item.subtotal.toFixed(2)}`
    receipt.text(itemLine).newLine()
  }

  // Totals
  receipt
    .dashedLine()
    .text('Subtotal:'.padEnd(32) + `₹${data.subtotal.toFixed(2)}`)
    .newLine()

  if (data.discount > 0) {
    const discountLine = 'Discount:'.padEnd(32) + `-₹${data.discount.toFixed(2)}`
    receipt.text(discountLine).newLine()
  }

  receipt
    .text('Tax (18%):'.padEnd(32) + `₹${data.tax.toFixed(2)}`)
    .newLine()
    .dashedLine()

  // Grand total
  receipt
    .align(1)
    .bold(true)
    .size(2, 2)
    .text(`₹${data.total.toFixed(2)}`)
    .newLine()
    .size(0, 0)
    .bold(false)
    .newLine()

  // Footer
  receipt
    .align(1)
    .text('Thank you for your order!')
    .newLine()
    .text('Visit us again soon')
    .newLine()
    .newLine()

  // Cut paper
  receipt.cut(false)

  return receipt.getBuffer()
}

/**
 * Send receipt to QZ Tray thermal printer
 */
export async function sendToThermalPrinter(data: ReceiptData): Promise<void> {
  // Check if QZ Tray is available
  if (typeof (window as any).qz === 'undefined') {
    throw new Error('QZ Tray not found. Please install QZ Tray from https://qz.io and try again.')
  }

  const qz = (window as any).qz

  try {
    // Generate receipt data
    const receiptBuffer = generateESCPOSReceipt(data)
    const receiptBase64 = btoa(String.fromCharCode.apply(null, Array.from(receiptBuffer)))

    // Get default printer
    const printers = await qz.printers.find()
    if (!printers || printers.length === 0) {
      throw new Error('No printers found')
    }

    const printer = printers[0]

    // Connect to printer
    await qz.printers.find()
    await qz.print({
      printer: { name: printer },
      data: [
        {
          type: 'raw',
          format: 'base64',
          data: receiptBase64,
        },
      ],
    })
  } catch (err) {
    throw new Error(`Failed to send to printer: ${(err as Error).message}`)
  }
}

/**
 * Preview the ESC/POS commands as readable text
 */
export function previewReceipt(data: ReceiptData): string {
  const receiptBuffer = generateESCPOSReceipt(data)

  // Convert to readable text (for debugging)
  let preview = ''
  for (let i = 0; i < receiptBuffer.length; i++) {
    const byte = receiptBuffer[i]

    // Handle escape sequences
    if (byte === 0x1b) {
      preview += '[ESC]'
    } else if (byte === 0x1d) {
      preview += '[GS]'
    } else if (byte === 0x0a) {
      preview += '\n'
    } else if (byte === 0x0d) {
      preview += '\r'
    } else if (byte >= 32 && byte < 127) {
      preview += String.fromCharCode(byte)
    } else {
      preview += `[${byte.toString(16).toUpperCase()}]`
    }
  }

  return preview
}
