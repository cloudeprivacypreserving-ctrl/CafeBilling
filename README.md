# My Cafe - POS System

A modern, production-ready Point of Sale (POS) system for small cafes, built with Next.js, React, TypeScript, Prisma, and PostgreSQL.

## ✨ Features

- **Menu Management**: Complete CRUD operations for menu items, categories, with pricing and availability
- **Order Processing**: Create orders (dine-in/takeaway), apply discounts, compute taxes, split bills
- **Payment Integration**: Support for cash, card, and UPI payment methods
- **PDF Receipts**: Generate and download professional receipts
- **Inventory Tracking**: Stock management with low-stock alerts
- **Reporting**: Daily/monthly sales reports with CSV/PDF export
- **User Management**: Role-based access control (Admin, Manager, Cashier)
- **Settings**: Business information, tax rates, receipt customization
- **Audit Logging**: Track all important actions
- **Beautiful UI**: Modern design with ShadCN/UI components

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, TypeScript, Tailwind CSS
- **Components**: ShadCN/UI
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Email/Password
- **PDF Generation**: PDFKit
- **Charts**: Recharts
- **Testing**: Jest, Playwright
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

## 🛠️ Local Development Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd my-cafe
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` and update the following variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/my_cafe?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

Generate a secure secret for `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npm run db:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Login Credentials

After seeding, you can login with:

- **Admin**: `admin@mycafe.com` / `admin123`
- **Cashier**: `cashier@mycafe.com` / `cashier123`

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### E2E Tests with Playwright

```bash
# Install Playwright browsers (first time)
npx playwright install

# Run E2E tests
npm run test:e2e
```

## 📦 Building for Production

```bash
npm run build
npm start
```

## 🚀 Deploy to Vercel

### Prerequisites

- Vercel account
- GitHub account
- PostgreSQL database (e.g., from Vercel, Supabase, or Neon)

### Step 1: Prepare your database

Set up a PostgreSQL database on your preferred provider:

- [Supabase](https://supabase.com) (Recommended - free tier available)
- [Neon](https://neon.tech) (Serverless PostgreSQL)
- [Vercel Postgres](https://vercel.com/storage/postgres)

### Step 2: Connect to Vercel

1. Import your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard:

```
DATABASE_URL=your-postgres-connection-string
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
```

### Step 3: Deploy

Vercel will automatically:
1. Install dependencies
2. Run `prisma generate`
3. Build the Next.js application
4. Deploy to production

### Step 4: Run migrations and seed

After deployment, connect to your production database and run:

```bash
# Update DATABASE_URL to production
export DATABASE_URL="your-production-postgres-url"

# Run migrations
npx prisma migrate deploy

# Seed the database
npm run db:seed
```

Or use the Vercel CLI to run these commands remotely.

## 📁 Project Structure

```
my-cafe/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeder
├── src/
│   ├── app/                   # Next.js app router
│   │   ├── api/              # API routes
│   │   ├── dashboard/        # Dashboard pages
│   │   ├── login/           # Authentication
│   │   ├── layout.tsx       # Root layout
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   └── ui/              # ShadCN/UI components
│   ├── lib/                 # Utilities
│   └── types/               # TypeScript types
├── tests/
│   ├── lib/                 # Unit tests
│   └── e2e/                 # E2E tests
├── .github/
│   └── workflows/           # CI/CD
└── package.json
```

## 🔐 User Roles

- **Admin**: Full access to all features
- **Manager**: Access to reports, menu, and inventory
- **Cashier**: Can create orders and view basic information

## 🎨 Customization

### Business Information

Update business details in Settings page or via the database:

```bash
npx prisma studio
```

### Receipt Template

Customize the receipt template in `src/app/api/receipt/[orderId]/route.ts`

### Tax Rates

Adjust tax rates in Settings or the `Settings` table.

## 📝 API Documentation

### Authentication

All API routes (except `/api/auth/*`) require authentication.

### Menu Items

- `GET /api/menu` - List all menu items
- `POST /api/menu` - Create menu item (Admin/Manager only)

### Orders

- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `GET /api/receipt/[orderId]` - Generate PDF receipt

## 🐛 Troubleshooting

### Database connection issues

Make sure PostgreSQL is running and the DATABASE_URL is correct.

### Migration errors

```bash
# Reset database (⚠️ Deletes all data)
npx prisma migrate reset

# Then re-run migrations
npx prisma migrate dev
```

### Build errors on Vercel

Make sure all environment variables are set and the build command includes `prisma generate`.

## 📄 License

MIT License - feel free to use this project for your cafe or as a learning resource.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ for small cafes everywhere**

