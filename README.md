# <b>Stock & Crypto Investment Analyzer</b>
### <b>"See the data, not the noise."</b>

Help investors compare <b>real-time</b> and <b>historical performance</b> of stocks and crypto to make <b>smarter, data-driven decisions—not emotional ones.</b>

## Why This Matters
Most traders lose money because they:

✅ <b>Chase hype</b> without historical context.

✅ <b>Ignore opportunity costs</b> (e.g., "What if I bought Tesla instead of Bitcoin last year?").

✅ <b>Overlook hidden costs</b> like fees, taxes, and exchange-rate impacts.

## This tool solves those problems by:

📊 <b>Visualizing trends</b> (not just raw numbers).

💡 <b>Showing "what-if"</b> scenarios (e.g., comparing two assets).

🔍 <b>Highlighting hidden costs</b> (fees, taxes, volatility).

## 🚀 How to Run This Project Locally
## Prerequisites
Node.js (v18+)

### 1. Free API keys:
[Finnhub](https://finnhub.io/)

[CoinGecko](https://www.coingecko.com/en/api)

[ExchangeRate-API](https://www.exchangerate-api.com/)

## 2. Setup & Installation
### 1. Clone the repository
git clone [https://github.com/SamuelIVX/Deltabase]

cd deltabase

## 3. Install dependencies
npm install

## 4. Set up environment variables
#### Create a `.env.local` file and add your API keys:

FINNHUB_API_KEY=your_key_here

COINGECKO_API_KEY=your_key_here

EXCHANGE_RATE_API_KEY=your_key_here

## 5. Start the Development Server
npm run dev

Open http://localhost:3000 in your browser.

## ⚙️ Technologies Used
Stocks Data - [Finnhub](https://finnhub.io/) | <b>Reliable stocks API</b>

Crypto Data - [CoinGecko](https://www.coingecko.com/en/api) | <b>Best free crypto API</b>

Exchange Rates - [ExchangeRate-API](https://www.exchangerate-api.com/) | <b>Simple currency conversion</b>

Data Visualization - [Recharts](https://recharts.org/en-US/) | <b>Easy, interactive visualizations</b>

State Management - [Zustand](https://github.com/pmndrs/zustand) | <b>Lightweight, fast, no boilerplate</b>