// ...existing code moved to md/FRONTEND_DOCUMENTATION.md
# Frontend Documentation

This document provides an overview of the frontend codebase, including the main pages, components, hooks, and contexts. It is intended to help developers understand the structure and responsibilities of each part of the frontend.

---

## Pages (`/app`)

- **app/page.tsx**: Main landing page of the application.
- **app/layout.tsx**: Root layout, sets up global providers and layout structure.
- **app/chat/page.tsx**: Chat interface for AI and user interaction.
- **app/admin/**: Admin dashboard pages (audit logs, reports, bookings, users, etc.).
- **app/carrier/**: Carrier dashboard pages (bookings, fleet, reports, etc.).
- **app/operator/**: Operator dashboard pages (queue, capacity, bookings, reports, etc.).

Each subfolder (admin, carrier, operator) contains its own `layout.tsx` and `page.tsx` for role-specific dashboards and navigation.

---

## Components (`/components`)

- **login-form.tsx**: Handles user authentication UI.
- **theme-provider.tsx**: Manages dark/light theme switching.
- **admin/**: Admin-specific UI (sidebar, header, charts, KPIs, quick actions, etc.).
- **carrier/**: Carrier-specific UI (sidebar, header, booking charts, KPIs, etc.).
- **operator/**: Operator-specific UI (charts, quick actions, KPIs, etc.).
- **notifications/**: Notification toasts and dialogs.
- **providers/**: Context providers for security, real-time updates, etc.
- **ui/**: Shared UI components (button, input, card, dropdown, skeleton, etc.).

---

## Hooks (`/hooks`)

- **use-api.ts**: Custom hook for API data fetching with loading/error states.
- **use-toast.ts**: Toast notification hook.
- **use-secure-error.ts**: Handles secure error reporting.
- **use-rate-limit.ts**: Rate limiting logic for actions.
- **use-mobile.tsx**: Detects mobile device usage.
- **use-keyboard-shortcuts.ts**: Keyboard shortcut handling.

---

## Contexts (`/contexts`)

- **auth-context.tsx**: Authentication state and user context.
- **notification-context.tsx**: Notification state and context.
- **socket-context.tsx**: WebSocket connection and real-time events.
- **index.ts**: Exports all contexts for easy import.

---

## General Structure

- **Routing**: Next.js App Router, with role-based layouts and nested routes.
- **State Management**: React context for auth, notifications, and sockets; hooks for local state.
- **Styling**: Tailwind CSS with custom themes and utility classes.
- **API Integration**: Service files in `/services` handle API requests.
- **Type Safety**: TypeScript throughout, with shared types in `/services/types.ts`.

---

## How to Extend

- Add new pages in the appropriate `/app/[role]/` folder.
- Create new components in `/components/[role]/` or `/components/ui/`.
- Add hooks to `/hooks/` for reusable logic.
- Use contexts for global state.

---

