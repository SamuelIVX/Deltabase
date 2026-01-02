# DeltaBase

**Stock & Crypto Investment Analyzer**

> "See the data, not the noise."

A modern web application that helps investors compare real-time and historical performance of stocks and cryptocurrencies to make smarter, data-driven investment decisions.

## Features

- 📊 **Real-time Market Data** - Live stock quotes and crypto prices
- 📈 **Historical Charts** - Visualize price trends across multiple timeframes (1d, 5d, 1m, 3m, 6m, 1y, 5y)
- 💰 **Dollar-Cost Averaging Calculator** - Simulate DCA investment strategies
- 🔄 **What-If Scenarios** - Compare two assets side-by-side to see potential returns
- 📰 **Financial News** - Stay updated with the latest market news
- 🧮 **Tax & Fee Calculator** - Calculate investment costs and taxes

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization

### Data & State Management
- **TanStack Query** - Server state management
- **React Context API** - Client state management

### APIs & Services
- **Yahoo Finance** - Stock market data (via `yahoo-finance2`)
- **CoinDesk Data API** - Cryptocurrency market data
- **Finnhub** - Financial news feed

## Prerequisites

- Node.js v18 or higher
- npm or yarn
- Free API keys (see below)

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

### 3. Get API Keys

You'll need free API keys from:

- **[Finnhub](https://finnhub.io/)** - For financial news
- **[CoinDesk](https://developers.coindesk.com/)** - For cryptocurrency data

> **Note:** Yahoo Finance data is accessed via the `yahoo-finance2` package and doesn't require an API key.

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_key_here
COINDESK_API_KEY=your_coindesk_key_here
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js pages and routes
├── components/       # React components
│   ├── dashboard/   # Dashboard UI
│   ├── markets/     # Stock & crypto market views
│   └── whatif/      # Investment calculator
├── hooks/           # Custom React hooks
├── pages/api/       # API route handlers
├── types/           # TypeScript definitions
└── utils/           # Utility functions
```