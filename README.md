# PassXYZ Vault 3

This project is the frontend of PassXYZ Vault 3, which is a password manager compatible with KeePass.

## Overview

`passxyz-web` is the web application component of the PassXYZ ecosystem, providing a secure, feature-rich password management experience in the browser. It connects to [PassXYZ.Server](https://github.com/finanalyzer/server) for backend services, supporting KeePass-compatible vault operations with strong encryption.

**Key Features:**

- KeePass-compatible password vault management
- Two-factor authentication (Cloudflare Access + master password)
- Device lock support
- Real-time OTP token generation
- Automatic session locking
- Internationalization (English/Chinese)
- Responsive design with dark/light theme

## Tech Stack

| Technology      | Version  | Description           |
| --------------- | -------- | --------------------- |
| React           | ^18.2.0  | UI framework          |
| TypeScript      | \~5.9.3  | Type-safe development |
| TanStack Router | ^1.168.7 | Routing management    |
| @openbb/ui      | ^0.14.17 | Design system         |
| TailwindCSS     | ^3.4.1   | CSS framework         |
| Vite            | ^8.0.1   | Build tool            |
| i18next         | ^23.7.0  | Internationalization  |
| React Query     | ^5.8.0   | Data management       |
| zod             | ^3.22.0  | Form validation       |
| axios           | ^1.6.0   | HTTP client           |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager
- PassXYZ.Server running on `http://localhost:5182`

### Installation

```bash
# Clone the repository
git clone https://github.com/finanalyzer/vault.git passxyz-web

# Navigate to the project directory
cd passxyz-web

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm run dev
```

The application will be available at `http://localhost:5173/vault/`

### Build

```bash
# Build for VPS deployment
pnpm run build

# Build for GitHub Pages (static)
pnpm run build:static
```

## Features

### 1. User Authentication

- Username and password login
- WebAuthn biometric authentication
- Device lock support
- Auto-timeout session locking
- Concurrent session detection (409 Conflict handling)

### 2. Vault Management

- **Entry Types:** Group, Entry, PxEntry (extended), Notes
- CRUD operations for entries and groups
- Custom field management
- Markdown note rendering
- Icon customization

### 3. OTP Management

- Client-side TOTP calculation
- Real-time token updates (30-second cycle)
- OTP countdown display

### 4. Security Features

- HTTPS encryption for all communications
- JWT-based authentication
- Session timeout (configurable: 30s, 2min, 5min, 10min, 30min, 1h)
- Single sign-on enforcement
- XSS protection in Markdown rendering

## Architecture

### Core Principles

1. **Separation of Concerns:** Frontend communicates with backend via REST API
2. **Stateless API Design:** Context passed explicitly through URL parameters
3. **Server-side Encryption:** KeePass database decryption handled by VaultSessionManager
4. **Multi-layer Authentication:** Cloudflare Access (identity) + master password (data)

### Authentication Flow

```
1. User → Cloudflare Access → JWT (contains email)
2. Frontend → POST /api/user/login (Cloudflare JWT + credentials)
3. Backend → Verify JWT → Query user → Open KeePass database
4. Return local JWT → Store in localStorage
```

### Session Management

- Token stored in `localStorage` as `passxyz-token`
- Auto-lock using Page Visibility API + activity detection
- Session timeout triggers `POST /api/user/logout`
- Concurrent login attempts return 409 Conflict

### Routes

| Route                            | Page           | Description              |
| -------------------------------- | -------------- | ------------------------ |
| `/`                              | LoginPage      | Redirect to login        |
| `/login`                         | LoginPage      | User login               |
| `/signup`                        | SignUpPage     | User registration        |
| `/vault`                         | ItemsPage      | Root group items         |
| `/vault/groups/{groupId}`        | ItemsPage      | Items in specified group |
| `/vault/groups/{groupId}/fields` | GroupEditPage  | Edit group information   |
| `/vault/entries/{entryId}`       | ItemDetailPage | Entry details            |
| `/vault/new/{groupId}`           | NewItemPage    | Create new item in group |
| `/vault/search`                  | SearchPage     | Global search            |
| `/vault/otp`                     | OtpListPage    | OTP tokens list          |
| `/vault/notes/{entryId}`         | NotesPage      | Markdown notes view      |
| `/vault/settings`                | SettingsPage   | Application settings     |
| `/vault/about`                   | AboutPage      | About PassXYZ            |

**Route Structure:** Uses TanStack Router layout route pattern. `/vault/groups/$groupId` and `/vault/entries/$entryId` serve as layout routes rendering `<Outlet />`, with child routes for specific pages.

### State Management

| State Type    | Storage         | Description                      |
| ------------- | --------------- | -------------------------------- |
| Auth Token    | localStorage    | JWT token for API requests       |
| User Info     | React Query     | Cached user profile              |
| Current Group | React Context   | Navigation stack for breadcrumbs |
| Item List     | React Query     | Cached query results             |
| Form State    | react-hook-form | Form input and validation        |

## API Reference

### User Management (`/api/user`)

| Method | Endpoint               | Description         | Authentication |
| ------ | ---------------------- | ------------------- | -------------- |
| POST   | `/api/user/signup`     | User registration   | Cloudflare JWT |
| POST   | `/api/user/login`      | User login          | Cloudflare JWT |
| POST   | `/api/user/logout`     | User logout         | Local JWT      |
| GET    | `/api/user/profile`    | Get user profile    | Local JWT      |
| PUT    | `/api/user/profile`    | Update user profile | Local JWT      |
| DELETE | `/api/user/{username}` | Delete user         | Local JWT      |
| GET    | `/api/user/list`       | Get user list       | Local JWT      |

### Vault Management (`/api/vault`)

| Method | Endpoint                                   | Description            | Authentication |
| ------ | ------------------------------------------ | ---------------------- | -------------- |
| GET    | `/api/vault/groups/{groupId}/items`        | Get items in group     | Local JWT      |
| GET    | `/api/vault/items/{itemId}`                | Get single item        | Local JWT      |
| GET    | `/api/vault/entries/{entryId}`             | Get entry details      | Local JWT      |
| GET    | `/api/vault/groups/{groupId}`              | Get group details      | Local JWT      |
| GET    | `/api/vault/search?keyword={keyword}`      | Search entries         | Local JWT      |
| GET    | `/api/vault/icons`                         | Get icon list          | Local JWT      |
| POST   | `/api/vault/groups/{groupId}/entries`      | Create entry           | Local JWT      |
| POST   | `/api/vault/groups/{parentGroupId}/groups` | Create group           | Local JWT      |
| PUT    | `/api/vault/entries/{entryId}`             | Update entry           | Local JWT      |
| PUT    | `/api/vault/groups/{groupId}`              | Update group           | Local JWT      |
| DELETE | `/api/vault/entries/{entryId}`             | Delete entry           | Local JWT      |
| DELETE | `/api/vault/groups/{groupId}`              | Delete group           | Local JWT      |
| POST   | `/api/vault/change-password`               | Change master password | Local JWT      |

### Attachment Management

| Method | Endpoint                                                  | Description         |
| ------ | --------------------------------------------------------- | ------------------- |
| GET    | `/api/vault/entries/{entryId}/attachments`                | Get attachment list |
| GET    | `/api/vault/entries/{entryId}/attachments/{attachmentId}` | Download attachment |
| POST   | `/api/vault/entries/{entryId}/attachments`                | Upload attachment   |
| DELETE | `/api/vault/entries/{entryId}/attachments/{attachmentId}` | Delete attachment   |

## Project Structure

```
passxyz-web/
├── public/                    # Static assets
├── src/
│   ├── components/           # Reusable components
│   │   ├── forms/            # Form components
│   │   ├── layout/           # Layout components (Sidebar, Breadcrumbs)
│   │   ├── items/            # Item-related components
│   │   ├── otp/              # OTP components
│   │   └── ui/               # Generic UI components
│   ├── pages/                # Page components
│   │   ├── LoginPage.tsx
│   │   ├── SignUpPage.tsx
│   │   ├── ItemsPage.tsx
│   │   ├── ItemDetailPage.tsx
│   │   ├── NewItemPage.tsx
│   │   ├── FieldEditPage.tsx
│   │   ├── IconsPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── NotesPage.tsx
│   │   ├── OtpListPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── AboutPage.tsx
│   ├── routes/               # TanStack Router configuration
│   ├── services/             # API service layer
│   │   ├── apiClient.ts
│   │   ├── authService.ts
│   │   └── vaultService.ts
│   ├── contexts/             # React Context providers
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useAutoLock.ts
│   │   └── useOtp.ts
│   ├── i18n/                 # Internationalization resources
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript type definitions
│   ├── main.tsx              # Application entry
│   ├── App.tsx               # Root component
│   └── index.css             # Global styles
├── index.html
├── package.json
├── vite.config.ts            # VPS deployment config
├── vite.static.config.ts     # GitHub Pages config
├── tailwind.config.ts
└── tsconfig.json
```

## Deployment

### VPS Deployment

```bash
pnpm run build
# Output: dist/
```

**Configuration:**

- Base path: `/` (default, configurable via `VITE_APP_BASE`)
- Includes development server proxy
- Sourcemaps enabled

### GitHub Pages

```bash
pnpm run build:static
# Output: dist-static/
```

**Configuration:**

- Base path: `/vault/` (default)
- Hash history routing
- No development server
- Sourcemaps disabled

### CORS Configuration

PassXYZ.Server supports CORS configuration via `appsettings.json`:

```json
{
  "Cors": {
    "AllowedOrigins": ["http://localhost:5173", "http://localhost:5174"],
    "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "AllowedHeaders": ["Authorization", "Content-Type", "Accept"],
    "AllowCredentials": true
  }
}
```

## Development Testing Setup

### Local Services

| Application     | Port | Description                 |
| --------------- | ---- | --------------------------- |
| passxyz-web     | 5173 | Frontend authentication app |
| finanalyzer-app | 5174 | Dashboard application       |
| PassXYZ.Server  | 5182 | Backend API service         |

### Proxy Configuration

**passxyz-web** (`vite.config.ts`):

```typescript
proxy: {
  "/api": {
    target: "http://localhost:5182",
    changeOrigin: true,
    secure: false,
  },
  "/app": {
    target: "http://localhost:5174",
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path.replace(/^\/app/, ""),
  },
},
```

### Testing Modes

#### Mode 1: Proxy Integration (Recommended)

Share localStorage across applications via proxy:

```
http://localhost:5173/vault/          → passxyz-web
http://localhost:5173/app/            → passxyz-web proxy → finanalyzer-app
http://localhost:5173/api/            → passxyz-web proxy → PassXYZ.Server
```

**Steps:**

1. Start PassXYZ.Server: `cd PassXYZ.Server && dotnet run`
2. Start finanalyzer-app: `cd finanalyzer-app && pnpm run dev`
3. Start passxyz-web: `cd passxyz-web && pnpm run dev`
4. Visit `http://localhost:5173/vault/#/login` to log in
5. Visit `http://localhost:5173/app/ `to access dashboard

#### Mode 2: Independent Development

Run each app separately and manually sync tokens:

1. Follow steps 1-4 from Mode 1
2. Copy `passxyz-token` from localStorage
3. Set token in finanalyzer-app localStorage via browser console

## Security

- **Password Protection:** HTTPS encryption in transit, KeePass native encryption at rest
- **JWT Security:** Strong key signing with reasonable expiration
- **Session Timeout:** Configurable idle timeout (default 1 hour)
- **Single Sign-On:** Prevents concurrent logins on multiple devices
- **Input Validation:** Zod schema validation for all API inputs
- **Device Lock:** WebAuthn standard for biometric verification
- **XSS Protection:** Markdown rendering with HTML tag sanitization
- **OTP Security:** TOTP keys processed client-side only

## Internationalization

Supports English and Chinese languages. Language resources are stored in `src/i18n/resources/`.

## References

- [PassXYZ.Server](https://github.com/finanalyzer/server)
- [PassXYZ.Vault2 Mobile Application](https://github.com/passxyz/PassXYZ.Vault2)

