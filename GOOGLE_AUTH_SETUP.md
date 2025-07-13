# Google Authentication Setup

To enable Google login functionality, follow these steps:

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Choose "Web application" as the application type
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - `https://yourdomain.com/api/auth/callback/google` (for production)
8. Copy the Client ID and Client Secret

## 2. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Database Configuration (for Docker)
DATABASE_URL=postgresql://ainterest_user:ainterest_password@postgres:5432/ainterest
```

## 3. Generate NextAuth Secret

You can generate a secure secret using:

```bash
openssl rand -base64 32
```

## 4. Start the Development Server

### Using Docker (Recommended):
```bash
./docker-manage.sh build
./docker-manage.sh start
```

### Using Local Development:
```bash
npm run dev
```

## 5. Database Setup

After starting the containers, run the database migrations:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

## 6. Database Management

Use the docker management script for database operations:

```bash
# Access PostgreSQL shell
./docker-manage.sh db-shell

# Reset database (removes all data)
./docker-manage.sh db-reset
```

The Google login button will now appear in the navbar on the right side of the avatar. When clicked, it will redirect users to Google for authentication. User data will be stored in PostgreSQL. 