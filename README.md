# 33 Mersin Tantuni - Restaurant Website

Modern, full-stack restaurant ordering website with comprehensive admin panel.

## Features

### Customer Features
- 🏠 Beautiful homepage with restaurant branding
- 📱 Mobile-responsive menu with categories
- 🛒 Shopping cart with real-time updates
- 🍽️ Order type selection (Dine-in / Takeaway)
- ✅ Order confirmation page

### Admin Features
- 🔐 Secure admin authentication
- 📊 Dashboard with order statistics
- 📦 Order management (view, update status)
- 🍕 Product management (CRUD operations)
- 🖼️ Image upload with Vercel Blob
- 📚 Media library
- ⚙️ Site settings (name, logo, colors, welcome text)

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Supabase (PostgreSQL)
- **Storage**: Vercel Blob
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth

## Getting Started

### 1. Run Database Scripts

Execute the SQL scripts in order from the `scripts` folder:

1. `001_create_tables.sql` - Creates all database tables
2. `002_enable_rls.sql` - Enables Row Level Security
3. `003_seed_data.sql` - Seeds initial data
4. `004_create_functions.sql` - Creates helper functions
5. `005_create_admin_trigger.sql` - Creates admin user trigger

### 2. Create Admin Account

Sign up at `/admin/login` to create your admin account. The first user will automatically become an admin.

### 3. Configure Site Settings

1. Log in to the admin panel at `/admin`
2. Go to Settings to customize:
   - Site name
   - Logo
   - Welcome text
   - Primary color

### 4. Add Products

1. Go to Products in the admin panel
2. Add categories (Tantuniler, İçecekler, etc.)
3. Add products with images, prices, and descriptions

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx                 # Homepage
│   ├── menu/                    # Menu page
│   ├── checkout/                # Checkout page
│   ├── order-confirmation/      # Order confirmation
│   ├── admin/                   # Admin panel
│   │   ├── dashboard/           # Admin dashboard
│   │   ├── orders/              # Order management
│   │   ├── products/            # Product management
│   │   ├── media/               # Media library
│   │   └── settings/            # Site settings
│   └── api/                     # API routes
├── components/                  # React components
├── lib/
│   └── supabase/               # Supabase client utilities
└── scripts/                    # SQL migration scripts
\`\`\`

## Environment Variables

All required environment variables are automatically configured through Vercel integrations:

- Supabase (database and auth)
- Vercel Blob (image storage)

## Admin Panel Access

- URL: `/admin`
- Default credentials: Create your account at `/admin/login`

## Customer Flow

1. Visit homepage → Click "Menüyü Görüntüle"
2. Browse menu → Add items to cart
3. Click cart icon → Review order
4. Select order type (Dine-in / Takeaway)
5. Confirm order → View order confirmation

## Admin Flow

1. Log in at `/admin/login`
2. View dashboard with statistics
3. Manage orders, products, and settings
4. Upload images through media library
5. Customize site appearance

## Support

For issues or questions, please contact support.
