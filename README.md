# MileChain ✈️

> Decentralized AI assistant for award flight search. Tell it what points you have, it figures out the best redemptions — powered by 0G Compute and Storage.

Built at **EthDenver 2026** Zero Coding Hackathon on 0G.

## What it does

- 🤖 **AI chatbot** asks clarifying questions then finds the best award redemptions
- 🔍 **Live transfer partner validation** via web search (Serper.dev) — no hardcoded rules
- ✈️ **Flight results** filtered by your actual points (Amex, Chase, Citi, Alaska, etc.)
- ⛓️ **0G Compute** — AI inference on decentralized GPUs (primary AI provider)
- 💾 **0G Storage** — search history saved to decentralized storage

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 and enter your 0G Compute provider URL and API key.

## Project Structure

```
milechain/
├── index.html              # Entry point
├── src/
│   ├── main.js             # App orchestrator
│   ├── ui/
│   │   ├── chat.js         # Chat panel
│   │   ├── form.js         # Search form
│   │   └── results.js      # Flight cards
│   ├── ai/
│   │   ├── 0g-compute.js   # 0G Compute (default — decentralized AI)
│   │   └── claude.js       # Claude API (fallback option)
│   ├── search/
│   │   ├── serper.js       # Live web search for transfer rules
│   │   └── mock.js         # Mock flight data
│   └── storage/
│       └── 0g-storage.js   # 0G decentralized storage
└── styles/
    └── main.css
```

## Setting up 0G Compute

0G Compute is the default AI provider. Get set up:

```bash
pnpm add @0glabs/0g-serving-broker -g
0g-compute-cli ui start-web
# Open http://localhost:3090, connect wallet, get API key
```

Then add your 0G provider URL and API key in the settings modal.

## Switching to Claude (Optional)

To use Claude instead of 0G Compute, in `src/main.js`, swap the import:
```js
// FROM:
import { parseIntent } from './ai/0g-compute.js';
// TO:
import { parseIntent } from './ai/claude.js';
```

## API Keys

| Key | Required | Purpose |
|-----|----------|---------|
| 0G Provider URL | Yes | Decentralized AI inference |
| 0G API Key | Yes | Decentralized AI inference |
| Claude API | Optional (fallback) | AI intent parsing (if not using 0G) |
| Serper.dev | Optional | Live transfer partner rules |
| Seats.aero | Optional | Live award availability |

## 0G Integration

- **0G Compute**: Decentralized GPU inference via OpenAI-compatible API
- **0G Storage**: Search history stored on-chain (testnet: Galileo)
  - RPC: https://evmrpc-testnet.0g.ai
  - Faucet: https://faucet.0g.ai

## Built With

- Vanilla JS + Vite (zero framework overhead)
- 0G Compute for AI (decentralized GPU inference)
- Serper.dev for live web search
- 0G Storage SDK (@0glabs/0g-ts-sdk)
