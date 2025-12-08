# QZ Tray Thermal Printer Integration

This guide explains how to set up and use QZ Tray with CafeBill for thermal printer support.

## What is QZ Tray?

QZ Tray is a browser extension/application that allows web applications to interact with local printers and hardware. It's perfect for POS systems that need to send commands directly to thermal printers.

## Installation

### 1. Install QZ Tray Application

1. Visit https://qz.io/download
2. Download the installer for your operating system:
   - Windows: `qz-tray-x.x.x.exe`
   - macOS: `qz-tray-x.x.x.pkg`
   - Linux: `qz-tray-x.x.x.deb` or `.rpm`
3. Run the installer and follow the prompts
4. Start the QZ Tray application (it will run in the background)

### 2. Enable QZ Tray for CafeBill

You need to load the QZ Tray JavaScript library in your application. Add this to `src/app/layout.tsx`:

```tsx
<script src="https://qz.io/api/modern/qz-tray.js"></script>
```

Alternatively, place it in `public/index.html` (if you have one):

```html
<script src="https://qz.io/api/modern/qz-tray.js"></script>
```

## Using the Thermal Printer Feature

### Print to Thermal Printer

1. Navigate to an order details page
2. Click the "Print to Thermal" button
3. The receipt will be sent to your default printer in ESC/POS format

### Error Handling

If you see "QZ Tray not found", make sure:
1. QZ Tray application is running (check system tray)
2. QZ Tray JavaScript library is loaded in your page
3. You have printer configured and connected

## ESC/POS Thermal Receipt Format

The receipt is formatted for 80mm thermal printers with:
- **Header**: Store name, receipt type, order number, date/time
- **Order Details**: Order type, table number, customer name
- **Items**: Product name, quantity, price
- **Summary**: Subtotal, discount (if any), tax, total amount
- **Footer**: Thank you message and store info
- **Cut**: Paper cut command at the end

### Receipt Layout

```
                    MY CAFE
                   Receipt
                Order #1234
           2024-01-15 10:30:45
------------------------------------------
Type: Dine-in
Table: 5
Customer: John Doe

Item                          Qty   Total
------------------------------------------
Cappuccino                      2   ₹300
Croissant                       1   ₹150
------------------------------------------
Subtotal:                         ₹450.00
Discount:                          -₹0.00
Tax (18%):                        ₹81.00
------------------------------------------
                             ₹531.00
                          
Thank you for your order!
Visit us again soon
------------------------------------------
```

## Troubleshooting

### "QZ Tray not found" Error
- Ensure QZ Tray application is running
- Restart QZ Tray if needed
- Check if JavaScript library is loaded

### Printer Not Found
- Make sure printer is connected and turned on
- Verify printer drivers are installed
- Check QZ Tray settings for correct printer selection

### Receipt Format Issues
- Verify thermal printer is 80mm width
- Check if printer supports ESC/POS commands
- Some printers may need configuration adjustments

### Port Connection Issues
- By default, QZ Tray listens on port 8383
- Make sure firewall allows local connections
- Try restarting the QZ Tray application

## Next Steps

### Connect Real Thermal Printer

1. **USB Connection**:
   - Connect thermal printer to computer via USB
   - Install printer drivers (manufacturer-provided)
   - Open QZ Tray settings and select your printer

2. **Network Connection**:
   - Configure thermal printer with local IP
   - Add printer to system network printers
   - Select in QZ Tray settings

3. **Bluetooth Connection**:
   - Pair printer with your computer
   - Install Bluetooth drivers
   - Add as network printer
   - Select in QZ Tray settings

### Alternative: Virtual Printer (Testing)

For development/testing without a real printer:
1. Install a PDF printer driver
2. Use it as test printer in QZ Tray
3. Receipts will be saved as PDFs instead of printing

## Code Reference

### Send to Thermal Printer

```typescript
import { sendToThermalPrinter } from '@/lib/escpos-receipt'

const receiptData = {
  orderNumber: '1234',
  orderType: 'Dine-in',
  createdAt: '2024-01-15 10:30:45',
  tableNumber: '5',
  customerName: 'John Doe',
  items: [
    { name: 'Cappuccino', quantity: 2, subtotal: 300 },
    { name: 'Croissant', quantity: 1, subtotal: 150 }
  ],
  subtotal: 450,
  discount: 0,
  tax: 81,
  total: 531
}

await sendToThermalPrinter(receiptData)
```

### Preview Receipt (for debugging)

```typescript
import { previewReceipt } from '@/lib/escpos-receipt'

const preview = previewReceipt(receiptData)
console.log(preview)
```

## Security Notes

- QZ Tray requires HTTPS in production (self-signed certificates work)
- QZ Tray prompts user for printer access on first use
- Printer selection is per-domain for security

## Resources

- QZ Tray Documentation: https://qz.io/wiki/
- ESC/POS Command Reference: https://www.epson-biz.com/
- Thermal Printer Setup Guides: Various manufacturer docs

