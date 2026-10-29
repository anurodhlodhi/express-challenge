# The Code Clash 2026 · FaultLine Commerce (Express.js)

This is the Express.js track of the individual debugging round. You have 120 minutes to investigate and improve the supplied application while preserving working behavior. Use only agents and resources approved by the organisers. Payments are simulated.

## Explore the app

The application uses Node.js, Express and SQLite. JSON endpoints under `/api` support product browsing, session-based carts, coupon validation, order creation, simulated payments and refunds. The root `/` returns service information; health checks are available at `/health` and `/api/health`.

This checkout does not currently expose a customer shop or admin interface. The admin routes and view templates are placeholders. Use this track's source and public tests rather than the Django or FastAPI routes and demo accounts.

For requests protected by CSRF, first call `GET /api/csrf`, keep the session cookie, and send the returned `token` in the `x-csrf-token` header using the same session.

## Setup with Node.js 22 or newer

Install Node.js 22 or newer and npm. The locked `better-sqlite3` dependency requires Node.js >=22. Run these commands from this directory in PowerShell:

~~~powershell
npm ci
Copy-Item .env.example .env
node scripts/seed-demo.js
npm test
npm start
~~~

On macOS/Linux use `cp .env.example .env` instead of `Copy-Item`; the other commands are the same. Set a local `SESSION_SECRET` in `.env` before starting the app. Visit http://localhost:3000/, http://localhost:3000/health or http://localhost:3000/api/products. Stop the server with Ctrl+C. Use `npm run dev` to restart the server automatically when source files change.

The database connection creates the SQLite database and applies `src/db/schema.sql` automatically. With the example environment settings, the database is stored at `data/faultline.sqlite`. The seed script adds three demo products if their SKUs are absent; it does not create customer accounts, admin accounts or coupons. Never submit `.env` or a local database.

`package.json` defines dependencies and commands; `package-lock.json` pins the dependency versions used by `npm ci`. Tests use Node.js's built-in test runner and Supertest.

## Business rules

- Money uses integer paise in the API and database.
- Product prices, stock and cart quantities must satisfy validation rules. Adding the same product increases its cart quantity.
- Cart totals multiply unit prices by quantities and remain consistent after updates and removals.
- Coupons may be percentage or fixed value and can have expiry dates, minimum spend, discount caps and usage limits.
- Checkout must validate stock, create a complete order with price snapshots or make no change, and clear the cart after success.
- Simulated payments must preserve the correct order state for their outcome. Refunds apply only to successful payments and must not be processed twice.
- Cart operations use the browser session. Preserve session handling and CSRF protections when fixing defects.

Start with public tests in `tests/` and add your own regression tests when useful. Inspect `src/api/`, `src/services/` and `src/db/` for this track's routes, request fields and data model. `CHALLENGE_SPEC.md` is currently empty in this checkout; follow any additional specification supplied by the organisers.

## Submission and evaluation

Edit application code, add tests and document fixes. Do not alter protected evaluator files or fixtures, hardcode judge data, or bypass authentication and CSRF. Work individually under the announced tool policy.

Submit the final source ZIP in the organiser's format, including completed `DEBUG_REPORT.md` and `SUBMISSION.json` when supplied or required by the organisers. These files are not included in this checkout. Exclude `.env`, credentials, databases, `node_modules`, caches and private tests. Stop editing at the official 16:00 freeze; the next 15 minutes are for collection. The organiser's timestamped ZIP is the primary submission.

The debug report should describe failures found, files changed, reasons for fixes, public tests run, remaining issues and permitted agent tools used. The announced ranking order is correctly resolved defects, fewer regressions, code quality and then completion time. Faculty and organisers control final policy and allowed tools.
