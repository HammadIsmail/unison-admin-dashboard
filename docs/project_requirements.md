# UNISON Admin Dashboard Requirements

A fully professional, production-ready Admin Dashboard for UNISON (Alumni Network System).

## 🧱 Tech & Architecture
- Reactjs + TypeScript
- Tailwind CSS
- shadcn/ui
- React Query (TanStack Query) / SWR
- Axios
- JWT-based authentication (Bearer Token)

## 🎨 UI/UX Requirements
- Color scheme: Blue + shades (primary color: #2563eb, #1e40af, #60a5fa)
- Support Dark Mode + Light Mode toggle
- Clean, Minimal, Professional (Stripe/Vercel style)
- Responsive (desktop, tablet, mobile)
- Cards, Tables, Modals, Dropdowns, Tabs
- Loading skeletons, empty states, toast notifications

## 🔐 Authentication Flow
- Login page (email + password)
- Store JWT in httpOnly cookie or localStorage
- Protect all admin routes
- Redirect if unauthorized

## 📊 Dashboard Layout
### Sidebar (Collapsible)
- Dashboard
- Pending Accounts
- Alumni
- Students
- Opportunities (optional placeholder)
- Network Analytics
- Settings

### Top Navbar
- Search bar
- Dark/Light toggle
- Admin profile dropdown
