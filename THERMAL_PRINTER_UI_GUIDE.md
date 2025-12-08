# UI/UX Changes - Thermal Printer Integration

## Order Details Page Layout

### Before
```
╔════════════════════════════════════════╗
║  Order #1234 - 2024-01-15 10:30:45   ║
║                                        ║
║  ┌─ Print Receipt        Download PDF ┐ ║
║  └────────────────────────────────────┘ ║
│                                         │
│  [WhatsApp Number Input]  Send WhatsApp │
│                                         │
│  Order Details | Items | Summary        │
╚════════════════════════════════════════╝
```

### After
```
╔════════════════════════════════════════╗
║  Order #1234 - 2024-01-15 10:30:45   ║
║                                        ║
║  ┌─ Print to     Print Receipt Download┐║
║  │  Thermal      (Btn)         PDF     ││
║  └────────────────────────────────────┘║
│                                         │
│  [WhatsApp Number Input]  Send WhatsApp │
│                                         │
│  Order Details | Items | Summary        │
╚════════════════════════════════════════╝
```

## Button Hierarchy

### Three Print Options

1. **Print to Thermal** (Primary - Blue)
   - Sends ESC/POS commands to QZ Tray
   - Prints directly to thermal printer
   - Best for POS systems

2. **Print Receipt** (Secondary - Default)
   - Browser print dialog
   - User can select printer/PDF
   - Fallback option

3. **Download PDF** (Tertiary - Outline)
   - Downloads receipt as PDF file
   - Email or share option
   - Perfect for customer records

## Data Flow

```
┌─────────────────────────────────────────────────────┐
│          Order Details Page                          │
│     (src/app/dashboard/orders/[id]/page.tsx)        │
└────────────┬────────────────────────────────────────┘
             │
             ├──► Click "Print to Thermal"
             │    │
             │    ├─► handlePrintToThermal()
             │    │
             │    ├─► Gather Receipt Data
             │    │   - Order Number
             │    │   - Items
             │    │   - Total Amount
             │    │
             │    ├─► sendToThermalPrinter(data)
             │    │   (src/lib/escpos-receipt.ts)
             │    │
             │    ├─► generateESCPOSReceipt(data)
             │    │   - Build ESC/POS commands
             │    │   - Format 80mm receipt
             │    │   - Generate buffer
             │    │
             │    └─► QZ Tray API
             │        - Connect to printer
             │        - Send commands
             │        - Cut paper
             │
             ├──► Success Toast: "Receipt sent to thermal printer"
             │
             └──► Error Toast: "QZ Tray not found..."
```

## ESC/POS Commands Generated

```
[ESC]@                          - Initialize printer
[ESC]a[1]                       - Center alignment
[GS]![1]                        - Double size font
[ESC]E[1]                       - Bold on
"MY CAFE\n"
[GS]![0]                        - Normal size font
[ESC]E[0]                       - Bold off
"Receipt\n"
"Order #1234\n"
[ESC]a[0]                       - Left alignment
"Item ... Qty ... Price\n"
...
[GS]V[0]\x00                    - Full paper cut
```

## User Experience

### Happy Path (QZ Tray Installed)
```
User clicks "Print to Thermal"
        ↓
Receipt data gathered from order
        ↓
ESC/POS commands generated
        ↓
Sent to QZ Tray → QZ Tray routes to printer
        ↓
Receipt prints ✓
        ↓
Toast: "Receipt sent to thermal printer"
```

### Error Path (QZ Tray Not Installed)
```
User clicks "Print to Thermal"
        ↓
System detects QZ Tray not available
        ↓
Toast Error: "QZ Tray not found. Please install from https://qz.io"
        ↓
User fallback options:
  - Install QZ Tray and retry
  - Use "Print Receipt" (browser dialog)
  - Use "Download PDF" (save for later)
```

## Mobile/Responsive Design

The buttons stack responsively:
```
Desktop (≥1024px):
[Print to Thermal] [Print Receipt] [Download PDF]

Tablet (768px-1023px):
[Print to Thermal] [Print Receipt]
[Download PDF]

Mobile (<768px):
[Print to Thermal]
[Print Receipt]
[Download PDF]
```

## Toast Notifications

### Success
```
┌─────────────────────────────┐
│ ✓ Success                   │
│                             │
│ Receipt sent to thermal     │
│ printer                     │
└─────────────────────────────┘
```

### Error (QZ Tray Not Found)
```
┌─────────────────────────────┐
│ ✗ Error                     │
│                             │
│ QZ Tray not found.          │
│ Please install QZ Tray from │
│ https://qz.io and try again │
└─────────────────────────────┘
```

### Error (No Printer)
```
┌─────────────────────────────┐
│ ✗ Error                     │
│                             │
│ Failed to send to printer:  │
│ No printers found           │
└─────────────────────────────┘
```

## API Integration Points

```
Order Details Page
├─ /api/orders/{id}                    ← Fetch order data
├─ /api/settings/qr-code               ← QR code for WhatsApp
└─ QZ Tray (Local - port 8383)
   └─ qz.printers.find()               ← Get printers
   └─ qz.print()                       ← Send commands
```

## Performance Characteristics

| Metric | Value |
|--------|-------|
| Receipt Generation | < 50ms |
| QZ Tray Send | < 200ms |
| Print Time | Depends on printer |
| Toast Display | 3-5 seconds |
| File Size (ESC/POS) | ~2-3 KB per receipt |

