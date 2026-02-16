# Pricewatch

A small CLI tool to track product prices and detect when items go on sale.

Currently supports JSON-based providers (e.g., Garmin) and includes a basic rule
engine to determine sale state. Designed to be modular and extensible for
additional site integrations.

---

## What It Does (Today)

- Reads products from `config/watches.json`
- Fetches prices from modular providers (currently REST-based)
- Normalizes everything into a consistent shape
- Uses a rule engine (`anySale`) to decide if something is on sale
- Stores state in `data/state.json`
- Detects sale transitions:

Notifications are stubbed for now — events are generated but not delivered yet.

---

## How It Works

### Providers

Providers are responsible for:

- Fetching remote price data
- Normalizing it into a common `Snapshot` shape:

```ts
type Snapshot = {
  currentPrice: number;
  listPrice: number;
};
```

---

### Rules Engine

Rules interpret snapshots.

Currently implemented:

- `anySale`
  - True when `currentPrice < listPrice`

The rule engine:

- Computes rule state
- Detects transitions
- Tells the runner whether something started or stopped being on sale

This keeps business logic out of providers.

---

### State

Runtime state is stored in:

`data/state.json`

It looks like this:

```json
{ "watch-id": { "onSale": true, "updatedAt": "2026-02-16T20:00:00Z" } }
```

State is only written when:

- A watch appears for the first time
- Sale status changes

The loader is resilient to:

- Missing state file
- Empty file
- Invalid JSON

---

## Usage

Install dependencies:

`npm install`

Run all watches:

`pricewatch run`

Run a specific watch:

`pricewatch run --id garmin-descent-g2`

Enable debug mode:

`pricewatch run --debug`

---

## Configuration

### Watches

`config/watches.json`

```json
[
  {
    "id": "garmin-descent-g2",
    "provider": "garmin",
    "config": { "sku": "010-02986-01" },
    "rule": { "type": "anySale" }
  }
]
```

### Provider URLs

`config/providerUrls.json`

```json
{
  "garmin": {
    "type": "rest",
    "template": "https://buy.garmin.com/pricing-proxy-services/countries/{country}/skus/{sku}/price",
    "defaults": { "params": { "country": "US" } }
  }
}
```

---

## Roadmap

This is intentionally structured so I can grow it without rewriting everything.

### 1) Run Periodically

Next step:

- Run via cron every 1–2 days
- Or GitHub Actions on a schedule
- Eventually push notifications somewhere (Discord, email, etc.)

### 2) More Provider Types

The goal is to support multiple extraction strategies:

- REST JSON endpoints
- GraphQL endpoints
- JSON-LD embedded in HTML
- Lightweight scraping
- Headless browser fallback (if absolutely necessary)

Providers stay isolated from rule logic.

### 3) More Rules

Eventually:

- `belowPrice`
- `priceDropSinceLastRun`
- Historical tracking

The rule engine is designed so adding new rules doesn’t require touching
providers.

---
