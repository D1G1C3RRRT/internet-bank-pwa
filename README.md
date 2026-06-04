# Internet Bank PWA

A production-ready banking PWA (Progressive Web App) built with Next.js 16, Neon PostgreSQL, and Better Auth.

## Features

- **Secure Authentication**: Email/password authentication with Better Auth
- **Multiple Accounts**: Create and manage checking and savings accounts
- **Transactions**: Transfer money between accounts, deposit funds, and track transaction history
- **Responsive Design**: Mobile-first design that works on all devices
- **Offline Support**: Service worker enables offline access to cached data
- **PWA Installation**: Install as a native app on iOS and Android
- **Real-time Updates**: Server actions for instant balance updates
- **Push Notifications**: Ready for Firebase Cloud Messaging integration

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js Server Actions
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Better Auth
- **Icons**: Lucide React
- **UI Components**: shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Neon PostgreSQL database
- BETTER_AUTH_SECRET environment variable (generate with `openssl rand -base64 32`)

### Installation

1. **Clone and install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file with:
   ```
   DATABASE_URL=your_neon_database_url
   BETTER_AUTH_SECRET=your_auth_secret
   ```

3. **Run the development server**:
   ```bash
   pnpm dev
   ```

4. **Open in browser**:
   Visit `http://localhost:3000`

## Project Structure

```
├── app/
│   ├── api/auth/[...all]/          # Better Auth endpoints
│   ├── dashboard/                   # Protected dashboard routes
│   │   └── accounts/[id]/           # Account detail page
│   ├── actions/                     # Server actions
│   ├── sign-in/                     # Sign in page
│   ├── sign-up/                     # Sign up page
│   └── layout.tsx                   # Root layout with PWA config
├── components/
│   ├── auth-form.tsx                # Sign in/up form
│   ├── dashboard-header.tsx         # Header with user menu
│   ├── account-card.tsx             # Account display card
│   ├── transactions-list.tsx        # Transaction list
│   ├── transfer-form.tsx            # Transfer/deposit form
│   └── new-account-button.tsx       # Create account button
├── lib/
│   ├── auth.ts                      # Better Auth config
│   ├── auth-client.ts               # Client auth utilities
│   └── db/
│       ├── index.ts                 # Drizzle client
│       └── schema.ts                # Database schema
└── public/
    ├── manifest.json                # PWA manifest
    ├── service-worker.js            # Service worker
    ├── offline.html                 # Offline fallback page
    └── icon-*.png                   # App icons
```

## Database Schema

### Better Auth Tables
- `user` - User accounts
- `session` - User sessions
- `account` - OAuth accounts
- `verification` - Email verification tokens

### App Tables
- `bank_account` - Bank accounts (checking, savings)
- `transaction` - Transaction history

## Key Features

### Authentication
- Email/password registration and login
- Session-based authentication
- Secure password hashing via Better Auth

### Banking Operations
- Create multiple accounts (checking/savings)
- View account balance
- Transfer money between accounts
- Deposit funds
- View transaction history
- Transaction status tracking

### PWA Features
- Service worker for offline support
- App manifest for installation
- Web app icons (multiple sizes)
- Offline fallback page
- Push notification ready

## Server Actions

All banking operations are implemented as server actions with proper user ID validation:

- `getBankAccounts()` - Get user's accounts
- `createBankAccount()` - Create new account
- `getTransactions()` - Get recent transactions
- `createTransaction()` - Transfer funds
- `depositFunds()` - Add funds to account

## Security Considerations

- All queries are scoped to the authenticated user via `getUserId()`
- Server actions verify session before executing
- Passwords are hashed with Better Auth
- CSRF protection via Better Auth
- No sensitive data exposed to client
- Transaction validation before processing

## Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Connect your GitHub repository
   - Add environment variables:
     - `DATABASE_URL`
     - `BETTER_AUTH_SECRET`

3. **Deploy**:
   - Vercel will automatically deploy on push

### PWA Installation

The app is automatically installable on:
- **Android**: Install via Chrome/Firefox browser prompt
- **iOS**: Use "Add to Home Screen" in Safari
- **Desktop**: Install via browser menu

## Future Enhancements

- [ ] Push notifications via Firebase Cloud Messaging
- [ ] Bill pay functionality
- [ ] Mobile app detection and deeplinks
- [ ] Transaction search and filtering
- [ ] Export transaction history
- [ ] Budget tracking
- [ ] Account analytics
- [ ] 2FA/MFA security
- [ ] Transaction categories
- [ ] Recurring transfers

## API Endpoints

### Authentication
- `POST /api/auth/sign-in` - Sign in
- `POST /api/auth/sign-up` - Register
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session

## Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
pnpm start
```

### Linting
```bash
pnpm lint
```

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Ensure app is served over HTTPS (except localhost)
- Clear service worker cache: DevTools > Application > Service Workers > Unregister

### Session Not Persisting
- Verify `BETTER_AUTH_SECRET` is set
- Check browser cookies are enabled
- Clear browser cache and cookies

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure Neon project allows connections
- Check network connectivity

## Support

For issues or questions, open an issue on GitHub or contact support.

## License

MIT
