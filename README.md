# Unison Admin Dashboard

A modern admin dashboard application built with React, Vite, TypeScript, and Tailwind CSS. It leverages shadcn/ui for accessible, customizable components and React Query for efficient data fetching and state management.

## Features

- **Framework**: React 18 with Vite for lightning-fast HMR and building.
- **Language**: TypeScript for static type checking and better developer experience.
- **Styling**: Tailwind CSS with shadcn/ui and Radix UI primitives for beautiful, accessible components.
- **Routing**: React Router DOM for client-side navigation.
- **Data Fetching**: TanStack React Query for declarative data fetching and caching.
- **Forms**: React Hook Form combined with Zod for robust form state management and validation.
- **Testing**: Configured with Vitest for unit testing and Playwright for end-to-end testing.
- **Linting & Formatting**: ESLint configured for code quality.

## Prerequisites

Ensure you have Node.js installed. This project uses `bun` as its primary package manager (evident by the `bun.lockb` file), but standard `npm` can also be used.

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Bun](https://bun.sh/) (optional, but recommended for faster installs)

## Getting Started

### Installation

Clone the repository and install dependencies:

```bash
# Using bun
bun install

# Or using npm
npm install
```

### Development Server

Run the local development server:

```bash
# Using bun
bun run dev

# Or using npm
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

Create a production build:

```bash
# Using bun
bun run build

# Or using npm
npm run build
```

To preview the production build locally:

```bash
# Using bun
bun run preview

# Or using npm
npm run preview
```

### Testing

Run unit tests with Vitest:

```bash
npm run test
```

Watch mode for tests:

```bash
npm run test:watch
```

## Project Structure

- `src/`: Source code including components, pages, hooks, and utilities.
- `public/`: Static assets.
- `components.json`: Configuration for shadcn/ui components.
- `vite.config.ts`: Vite bundler configuration.
- `tailwind.config.ts`: Tailwind CSS configuration.
- `playwright.config.ts`: Playwright e2e testing configuration.
- `vitest.config.ts`: Vitest unit testing configuration.

## License

This project is private and proprietary.
