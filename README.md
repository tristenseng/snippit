# Snippit

A cannabis production tracking web application for managing employee productivity, batch processing, and strain performance across multiple locations.

## Features

- **Role-Based Access Control** — Three-tier permission system (Admin, Manager, Employee) with role-specific dashboards and access controls
- **Batch Management** — Create and track production batches with strain assignments, status lifecycle (Inactive → Active → Completed), and one-active-batch-per-location enforcement
- **Daily Production Tracking** — Day-by-day employee weight entries, hours tracking, and submission workflows per batch
- **Strain Management** — Maintain a strain inventory and assign strains to batches
- **Multi-Location Support** — Assign users to multiple locations, with location-scoped batch and performance data
- **User Management** — Admin tools to create, edit, deactivate/reactivate users and manage role assignments
- **Performance Dashboards** — Role-specific metrics including personal production data, projected earnings, team efficiency, and system-wide stats

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + [Prisma ORM](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) with bcrypt password hashing
- **Styling:** Tailwind CSS
- **Testing:** Jest + Testing Library

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
# Clone the repo
git clone https://github.com/tristenseng/snippit
cd snippit

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your DATABASE_URL, NEXTAUTH_SECRET, and NEXTAUTH_URL

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Secret used to sign JWT sessions |
| `NEXTAUTH_URL` | Base URL of the application |

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm test           # Run test suite
npm run test:watch # Run tests in watch mode
```

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes (auth, admin, batches, strains, employees)
│   ├── (auth)/        # Login page
│   ├── (dashboard)/   # Protected dashboard routes
│   └── set-password/  # Password reset flow
├── components/        # Reusable UI components
├── lib/               # Auth config, Prisma client, RBAC logic
└── types/             # TypeScript type definitions
prisma/
└── schema.prisma      # Database schema
tests/                 # Jest test suite
```

## Roles & Permissions

| Permission | Admin | Manager | Employee |
|---|:---:|:---:|:---:|
| Manage Users | ✓ | | |
| Manage Strains | ✓ | | |
| Manage Batches | ✓ | ✓ | |
| View All Performance | ✓ | ✓ | |
| Switch Roles | ✓ | | |
