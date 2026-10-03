# CAA AI Product Finder

## Overview

CAA AI Product Finder is a private web app for Cabalen Auto Aircon and authorized users. Users select a vehicle brand, model and year to find products with confirmed compatibility records and open the shop's marketplace listings.

Editors and Admins can maintain products, shop links and compatibility records. Admins can also manage authorized accounts. There is no public registration.

Project repository: https://github.com/Teywyl/caa-ai-product-finder

Full application deployment: Not completed yet.

## Current status

As of October 4, 2026:

- The React client, Express API and PostgreSQL database work together in Codespaces.
- Admin login works.
- Vehicle browsing, item details, Product Records and User Administration can be opened.
- All 62 automated server tests passed.
- The frontend production build passed.
- The active client uses the real API.
- The Finder uses server-side keyword matching. Gemini is not connected.

These results verify local operation. The complete hosted application still needs deployment and testing.

## Setup and installation

### Requirements

- Node.js 20 or later and npm.
- Git.
- Docker for the PostgreSQL setup below.
- A web browser.

### Get the code

```bash
git clone https://github.com/Teywyl/caa-ai-product-finder.git
cd caa-ai-product-finder
```

### Create the local database

Replace `CHANGE_ME` with a local development database password. Use the same password in `server/.env`.

```bash
docker run --name caa-revision-db \
  -e POSTGRES_PASSWORD=CHANGE_ME \
  -e POSTGRES_DB=caa_revision \
  -p 127.0.0.1:5433:5432 \
  -d postgres:17
```

Check that PostgreSQL is ready:

```bash
docker exec caa-revision-db pg_isready -U postgres -d caa_revision
```

Once it reports accepting connections, create a separate test database:

```bash
docker exec caa-revision-db createdb -U postgres caa_revision_test
```

These creation commands are only needed during the first setup. To restart an existing stopped container:

```bash
docker start caa-revision-db
```

### Install server dependencies

From the repository root:

```bash
cd server
npm ci
cp .env.example .env
```

### Server environment

Edit `server/.env`:

```env
DATABASE_URL=postgresql://postgres:CHANGE_ME@localhost:5433/caa_revision
TEST_DATABASE_URL=postgresql://postgres:CHANGE_ME@localhost:5433/caa_revision_test
CORS_ORIGINS=http://localhost:5173
SESSION_HOURS=12
NODE_ENV=development
```

Replace the example password with the local password chosen above. These instructions assume a newly created environment file; preserve existing settings when updating an established setup.

### Create tables and load the catalogue

Only against a new or disposable development database, run inside `server/`:

```bash
npm run db:reset
```

This creates the tables and loads the starting catalogue.

**This command deletes and rebuilds the app's tables, including accounts. Do not run it against data you need to keep.**

The database contains tables for:

- Users and sessions.
- Brands and vehicle models.
- Products and marketplace links.
- Vehicle compatibility records.

### Create the first admin

Inside `server/`:

```bash
npm run user:create -- --name "Shop Admin" --email "admin@example.com" --role admin
```

Replace the example name and email with your account details. Enter a private password of 10 to 200 characters when prompted.

There are no default login credentials.

### Install client dependencies

From the repository root:

```bash
cd client
npm ci
cp .env.example .env
```

Edit `client/.env` so the API base URL is blank:

```env
VITE_API_BASE_URL=
```

This makes the development client send requests through Vite's `/api` proxy to the Express server.

In Codespaces, using `http://localhost:3000` as the browser's API address would point to the user's computer rather than the Codespace.

### Environment and configuration

| Variable | Location | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Server | Connection to the application database. |
| `TEST_DATABASE_URL` | Server | Connection to a separate disposable test database. |
| `CORS_ORIGINS` | Server | Comma-separated allowed browser origins. |
| `SESSION_HOURS` | Server | Session duration in hours; normally `12`. |
| `NODE_ENV` | Server | `development` locally or `production` when hosted. |
| `PORT` | Server | API port; defaults to `3000` when unset. Hosting providers normally supply it. |
| `VITE_API_BASE_URL` | Client | Blank for the development proxy; the hosted API URL for deployment. |
| `VITE_BASE_PATH` | Client build | Asset prefix. The Pages workflow sets `/caa-ai-product-finder/`. |
| `POSTGRES_PASSWORD` | PostgreSQL container | Password chosen when creating the local database container. |

Real credentials belong in untracked environment files or hosting settings. Values beginning with `VITE_` are public and must not contain passwords, database connection strings or API keys.

The revised client does not use the old `VITE_USE_MOCK_API` switch.

## How to run it

Start the API in one terminal:

```bash
cd server
npm run dev
```

Start the client in a separate terminal, from the repository root:

```bash
cd client
npm run dev -- --host 0.0.0.0
```

Open `http://localhost:5173/` locally. In Codespaces, open the forwarded browser address for port 5173.

The first screen is Login. Sign in with the account created earlier. Keep both terminals running while using the app.

The API normally runs on port 3000. PostgreSQL uses port 5433 in this setup; that port is not a website.

## Features and usage

### Main browsing flow

1. Sign in with an authorized account.
2. Select a brand from Home or Brands.
3. Select a vehicle model from its garage.
4. Choose the vehicle year.
5. Browse products with confirmed compatibility for that selection.
6. Open an item to view its details, fit records and available marketplace links.

The garage includes available models and decorative locked slots. Locked slots cannot be selected.

The starting catalogue contains:

- 3 brands.
- 9 vehicle models.
- 7 products.
- 11 compatibility records.

Six compatibility records still need verification. They are excluded from confirmed matches.

A product's presence in the catalogue does not establish its current stock availability.

### Account roles

| Role | Access |
| --- | --- |
| Viewer | Browse vehicles, products and confirmed matches, and use the Finder. |
| Editor | Viewer access plus product, shop-link and compatibility management. |
| Admin | Editor access plus account administration. |

Passwords are hashed on the server. Protected API routes check the session and required role.

### Finder

The Finder accepts text such as:

```text
cabin filter for terra 2020
```

It uses keyword matching to identify the vehicle, year and category, then searches the database. It asks for missing information.

Gemini is not connected. The Finder does not generate new compatibility claims.

### Vehicle previews

The interface supports interactive vehicle previews. Generic shapes are used where an exact model asset is unavailable.

Installing the required licensed 3D assets and checking their credits in the public repository remain unfinished.

### Main API endpoints

Protected requests use:

```text
Authorization: Bearer <session-token>
```

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/healthz` | Check API process health. |
| GET | `/readyz` | Check database connectivity. |
| POST | `/api/auth/login` | Sign in and create a session. |
| GET | `/api/auth/me` | Read the current account. |
| POST | `/api/auth/logout` | End the session. |
| GET | `/api/brands` | List brands. |
| GET | `/api/brands/:brandId/models` | List models for a brand. |
| GET | `/api/models` | List vehicle models. |
| GET | `/api/models/:modelId` | Read a vehicle model. |
| GET | `/api/models/:modelId/products?year=2020` | Find confirmed compatible products. |
| GET | `/api/models/:modelId/pending` | Read unverified fit records separately. |
| GET, POST | `/api/products` | List or create products. |
| GET, PUT, DELETE | `/api/products/:id` | Read, update or delete a product. |
| GET, POST | `/api/compatibility` | List or create compatibility records. |
| PUT, DELETE | `/api/compatibility/:id` | Update or delete a compatibility record. |
| POST | `/api/finder` | Search using a text request. |
| GET, POST | `/api/users` | List or create accounts as Admin. |
| PATCH, DELETE | `/api/users/:id` | Update or remove an account as Admin. |

Product and compatibility writes require Editor or Admin access. User administration requires Admin access.

## Testing and production build

Inside `server/`:

```bash
npm test
```

Tests create their own tables and sample records in the separate test database. Never point `TEST_DATABASE_URL` at the application database.

Inside `client/`:

```bash
npm run build
```

Verified on October 4, 2026:

- 62 server tests passed.
- 0 failures or cancellations.
- Vite successfully built 57 modules.

The tests cover authentication, permissions, catalogue access, product management, account administration and compatibility-search behavior.

## Project structure

| Path | Contents |
| --- | --- |
| `client/src/App.jsx` | Application routing and screen composition. |
| `client/src/pages/` | Login, browsing, vehicle, item, Finder and management screens. |
| `client/src/components/` | Shared interface and vehicle preview components. |
| `client/src/api/` | API requests and session handling. |
| `client/src/context/` | Shared application state. |
| `client/src/lib/` | Navigation and catalogue helpers. |
| `client/src/styles.css` | Shared styling. |
| `client/src/designs.css` | Interface themes. |
| `client/src/luxe.css` | Additional visual styling. |
| `server/server.js` | API startup. |
| `server/src/app.js` | Express application and middleware. |
| `server/src/routes/` | API route handlers. |
| `server/src/repos/` | PostgreSQL queries. |
| `server/db/` | Database connection, schema and seed scripts. |
| `server/scripts/` | Account-creation command. |
| `server/test/` | Automated API and compatibility tests. |
| `.github/workflows/deploy-pages.yml` | Frontend build and GitHub Pages deployment. |
| `docs/` | Supporting documentation and screenshots. |

## Screenshots

![Current CAA product browser](docs/screenshot.png)

## Known issues and next steps

- Deploy the database and API, then connect the public frontend.
- Test the complete deployed workflow.
- Finish product details, marketplace links and compatibility verification.
- Upload and verify licensed 3D assets and their credits.
- Review frontend concerns and mobile layouts.
- Replace outdated screenshots.
- Review the security checklist against the revised implementation.
- Connect Gemini if time permits, keeping results grounded in CAA records.
- Complete the presentation materials.

Public hosting is planned for GitHub Pages, Render and Neon. The complete hosted system has not been verified yet.

## AI usage

Claude supplied most of the revised interface and backend code. ChatGPT/Codex reviewed files, explained implementation choices and guided troubleshooting while still explaining how things happen and why things happen.

I provided the project requirements, wireframes and catalogue information, manually applied changes to this repo, configured the local environment and ran the checks.

See [AI-USAGE.md](AI-USAGE.md) for the assistance record and contribution details.
