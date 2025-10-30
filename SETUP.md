# My Cafe - Local Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up PostgreSQL Database

#### Option A: Using Local PostgreSQL

```bash
# Create database
createdb my_cafe

# Or using psql
psql -U postgres
CREATE DATABASE my_cafe;
```

#### Option B: Using Docker

```bash
docker run --name my-cafe-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=my_cafe -p 5432:5432 -d postgres:15
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit `.env` and update these values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/my_cafe?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-here"
```

**Generate a secure NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

### 4. Set Up Database Schema

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npm run db:seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Default Login Credentials

After running the seed script, you can login with:

- **Admin**: `admin@mycafe.com` / `admin123`
  - Full access to all features
  
- **Cashier**: `cashier@mycafe.com` / `cashier123`
  - Can create orders and view basic info

## 📝 Database Schema

The database includes:

- **Users**: Admin, Manager, Cashier roles
- **Categories**: Menu categories
- **Menu Items**: Products with prices
- **Inventory**: Stock tracking
- **Orders**: Order management
- **Order Lines**: Order items
- **Settings**: Business configuration
- **Audit Log**: Action tracking

## 🧪 Testing

### Run Unit Tests

```bash
npm test
```

### Run E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e
```

### Run All Tests

```bash
npm test && npm run test:e2e
```

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Run production server

# Database
npm run db:push      # Push schema changes
npm run db:migrate   # Create migration
npm run db:seed      # Seed database

# Code Quality
npm run lint         # Run ESLint
npm run format        # Format with Prettier
npm run type-check    # TypeScript check
```

## 🐛 Troubleshooting

### Database Connection Issues

Make sure PostgreSQL is running:

```bash
# Check if PostgreSQL is running
pg_isready

# Or using Docker
docker ps
```

### Prisma Migration Errors

If you encounter migration errors:

```bash
# Reset the database (⚠️ Deletes all data)
npx prisma migrate reset

# Re-run migrations
npx prisma migrate dev

# Re-seed the database
npm run db:seed
```

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

### Missing Dependencies

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📊 Database Management

### View Data

```bash
# Open Prisma Studio
npx prisma studio
```

This opens a GUI at http://localhost:5555 where you can view and edit your data.

### Create New Migration

```bash
npx prisma migrate dev --name your_migration_name
```

### Reset and Re-seed

```bash
npx prisma migrate reset
npm run db:seed
```

## 🚀 Building for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📦 Project Structure

```
my-cafe/
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/               # Next.js pages
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard pages
│   │   └── ...
│   ├── components/       # React components
│   ├── lib/             # Utilities
│   └── types/           # TypeScript types
├── tests/               # Test files
└── public/              # Static assets
```

## ✅ Next Steps

1. **Explore the Dashboard**: Navigate through different sections
2. **Create an Order**: Try the order creation flow
3. **Check Reports**: View sales reports
4. **Manage Inventory**: Monitor stock levels
5. **Customize Settings**: Update business information

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [ShadCN/UI](https://ui.shadcn.com)

---

Happy coding! ☕

