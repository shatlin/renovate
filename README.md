# Modern Next.js App Template

A stunning, production-ready Next.js template with beautiful glassmorphism UI, authentication, and modern features.

## Features

- ✨ **Beautiful Glassmorphism UI** - Stunning visual effects with glass morphism design
- 🔐 **Authentication System** - Complete login/signup flow with JWT
- 📱 **Fully Responsive** - Works perfectly on all devices
- 🎨 **Modern Design** - Clean, professional interface with smooth animations
- ⚡ **Lightning Fast** - Optimized for performance
- 🎯 **TypeScript** - Full type safety
- 🎭 **Framer Motion** - Smooth animations and transitions
- 🎪 **Tailwind CSS** - Utility-first styling
- 🔒 **Secure** - Password hashing, HTTP-only cookies, CSRF protection

## Quick Start

1. **Clone the template:**
   ```bash
   cp -r template my-new-app
   cd my-new-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration.

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
template/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── auth/         # Authentication endpoints
│   ├── auth/             # Auth pages (login, signup)
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   └── layout/           # Layout components
│       └── Navigation.tsx # Main navigation
├── lib/                   # Utility functions
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Helper functions
├── public/               # Static assets
└── styles/               # Additional styles
```

## Customization

### Changing the Brand

1. Update the app name in `app/layout.tsx`
2. Replace logo in `components/layout/Navigation.tsx`
3. Update colors in `tailwind.config.js`
4. Modify metadata in `app/layout.tsx`

### Adding Pages

Create new pages in the `app` directory:

```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  )
}
```

### Styling

The template uses Tailwind CSS with custom glassmorphism utilities:

- `.glass-morphism` - Light glass effect
- `.glass-morphism-strong` - Stronger glass effect
- `.glass-morphism-light` - Subtle glass effect

### Authentication

The template includes a complete authentication system:

- JWT-based sessions
- Secure password hashing
- Protected routes
- User context

To protect a page:

```tsx
import { getSession } from '@/lib/utils/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const user = await getSession()
  
  if (!user) {
    redirect('/auth/login')
  }

  return <div>Protected content</div>
}
```

## Database Integration

The template uses mock data by default. To connect a real database:

1. **Install your database client:**
   ```bash
   npm install @supabase/supabase-js
   # or
   npm install @prisma/client prisma
   ```

2. **Update the API routes** in `app/api/auth/` to use your database

3. **Add database schema** for users table

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Set environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

Required environment variables:

```env
# Authentication
NEXTAUTH_SECRET=your-secret-key-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Your App Name

# Database (optional)
DATABASE_URL=your-database-url
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Authentication:** JWT + bcrypt
- **State Management:** React Hooks

## License

MIT - Use this template for any project!

## Support

For questions or issues, please open an issue on GitHub.

---

Built with ❤️ using modern web technologies