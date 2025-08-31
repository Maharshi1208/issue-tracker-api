# Issue Tracker API

![CI](https://github.com/Maharshi1208/issue-tracker-api/actions/workflows/ci.yml/badge.svg)

Minimal Issue Tracker API built with **TypeScript + Express + SQLite**.  
Includes **CRUD endpoints**, **Swagger docs**, **Jest tests**, **Docker** runtime, and a **JMeter performance test** with HTML report.
---

## ✨ Features
- CRUD operations for issues (create, list, update, delete)
- Input validation with [Zod](https://zod.dev)
- SQLite database (file or in-memory for tests)
- Jest + Supertest integration tests
- GitHub Actions CI pipeline
- ESLint + Prettier setup for clean code

---

## 🛠️ Tech Stack
- Node 18, TypeScript
- Express 5, better-sqlite3
- Zod validation
- Jest + Supertest
- Swagger UI at `/docs`
- Docker + docker-compose (SQLite persisted via named volume)
- JMeter (non-GUI) load test with assertions
---

## 🚀 Getting Started

## Quick Start (dev)

```bash
npm ci
npm run dev

Health: curl http://localhost:3000/health
Swagger: http://localhost:3000/docs

### 1. Clone the repo
```bash
git clone git@github.com:Maharshi1208/issue-tracker-api.git
cd issue-tracker-api

### 2.API summary
GET /api/issues — list

POST /api/issues — create { title, description?, priority? }

GET /api/issues/:id — fetch by id

PATCH /api/issues/:id — update any field

DELETE /api/issues/:id — delete

### 3. Tests
Tests :- npm test

### Docker (production-like)
docker compose up --build
# stop
docker compose down


App on http://localhost:3000

DB persisted in named volume dbdata → /app/data/data.sqlite

### Performance Test (JMeter)

Plan: perf/jmeter/issue-api.jmx (asserts POST=201, GET=200).

Run and generate HTML report (timestamped output):

OUT="report-$(date +%Y%m%d-%H%M%S)"
docker compose run --rm jmeter \
  -n -t /test/issue-api.jmx \
  -Jserver=api -Jport=3000 \
  -Jusers=50 -Jloops=20 \
  -l /results/$OUT.jtl \
  -e -o /results/$OUT


### Open report:

Windows/WSL: explorer.exe perf\\results\\$OUT

Linux/macOS: xdg-open perf/results/$OUT/index.html

Parameters

-Jusers — concurrent users (default 20)

-Jloops — iterations per user (default 10)

### Cleanup tip (owned by root)

docker run --rm -v "$(pwd)/perf/results:/results" alpine sh -c 'rm -rf /results/*'

#Scripts
"dev": "cross-env NODE_ENV=development ts-node-dev --respawn --transpile-only src/index.ts",
"build": "tsc",
"start": "node dist/index.js",
"test": "cross-env NODE_ENV=test jest --runInBand",
"lint": "eslint . --ext .ts",
"format": "prettier --write ."

