# AI Coding Instructions for Dent-Klinic

This is a Vue 3 + Nuxt 3 based dental clinic website with SSR (Server-Side Rendering) capabilities and an admin panel for content management. The project uses a file-based JSON database for content storage.

## Project Architecture

### Key Components
- `pages/` - Vue pages using Nuxt file-based routing
- `components/` - Reusable Vue components 
- `server/` 
  - `api/` - Server API endpoints with proper validation and rate limiting
  - `data/` - JSON file-based database
  - `utils/` - Shared server utilities
- `composables/` - Vue composition API hooks for data management
- `assets/styles/` - SCSS styling
- `public/` - Static assets (images, icons)

### Data Flow Patterns
1. Content Management:
   - JSON files in `server/data/` store website content
   - Admin panel routes in `pages/admin/` manage content
   - Composables (e.g., `useAbout.ts`, `useDoctors.ts`) handle data fetching/caching
   - Example: `useHeaderConfig.ts` for global header configuration

2. Form Submissions:
   - Contact forms use `server/api/contact.post.ts`
   - Built-in spam protection with honeypots and rate limiting
   - Nodemailer integration for email notifications

### Security Patterns
1. API Security:
   ```typescript
   // Example from contact.post.ts
   const ip = getRequestIP(event)
   await assertRateLimit(`contact:${ip}`, 5 * 60 * 1000)  // 1 request per 5 min
   ```

2. Content Security:
   - Strict CSP headers defined in `nuxt.config.ts`
   - Input sanitization on all user inputs
   - Admin routes protected by auth middleware

## Development Workflow

### Setup & Running
```bash
npm install
npm run dev    # Development on port 8080
npm run build  # Production build
npm run start  # Start production server
```

### Environment Configuration
Required `.env` variables:
- `SITE_URL` - Production site URL
- `MAIL_*` - Email configuration for contact forms
- `NUXT_ADMIN_*` - Admin panel authentication

### Key Conventions

1. Component Structure:
   - Single-file components with `<script setup lang="ts">`
   - Props interface defined with `defineProps<{...}>()`
   - Styles scoped by default
   - Responsive design with mobile-first approach

2. API Endpoints:
   - Use Zod for request validation
   - Include rate limiting for public endpoints
   - Return structured error responses
   - Sanitize all user inputs

3. State Management:
   - Use composables for shared state
   - Prefer URL-based state when possible
   - Cache API responses appropriately

## Common Tasks

1. Adding New Content Section:
   - Create JSON file in `server/data/`
   - Add corresponding API endpoints
   - Create composable for data management
   - Add admin panel page for content editing
   - Integrate into frontend components

2. Updating Site Meta:
   - Edit `nuxt.config.ts` for global meta
   - Use `useSeoMeta.ts` for page-specific meta
   - Schema.org data via `useJsonLd.ts`

## Troubleshooting

- Build errors often relate to TypeScript types - check composable return types
- CSP violations logged to `/api/csp-report` endpoint
- Check rate limiting if API requests fail
- Verify JSON file permissions for content updates