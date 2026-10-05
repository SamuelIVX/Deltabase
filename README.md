# DeltaBase

A Next.js 16 application for comparing historical asset performance and simulating dollar-cost averaging (DCA) investment strategies across stocks and cryptocurrencies.

This repository enforces strict CI gates (Build/Lint) on all pull requests and has Renovate auto-merge enabled for dependency management.

## Features

- Real-time stock quotes and crypto prices
- Historical price trend visualization (1d to 5y)
- Dollar-Cost Averaging (DCA) strategy simulator
- Side-by-side asset comparison for "what-if" return scenarios
- Aggregated financial news feed
- Investment cost and tax calculator

## Tech Stack

### Frontend
- **Next.js 16** / **React 19** 
- **TypeScript**
- **Tailwind CSS**
- **Recharts**

### Data & State Management
- **TanStack Query**
- **React Context API**

### APIs & Services
- **Yahoo Finance** (via `yahoo-finance2`)
- **CoinDesk Data API**
- **Finnhub**

## Prerequisites

- Node.js v18 or higher
- npm or yarn

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/SamuelIVX/Deltabase.git
cd deltabase
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add your free API keys for Finnhub and CoinDesk (Yahoo Finance data does not require a key).

```env
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_key_here
COINDESK_API_KEY=your_coindesk_key_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```bash
src/
├── app/              # Next.js pages and routes
├── components/       # React components
│   ├── dashboard/    # Dashboard UI
│   ├── markets/      # Stock & crypto market views
│   └── whatif/       # Investment calculator
├── hooks/            # Custom React hooks
├── pages/api/        # API route handlers
├── types/            # TypeScript definitions
└── utils/            # Utility functions
```
