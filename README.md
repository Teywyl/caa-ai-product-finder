# CAA AI Product Finder

## Overview

CAA AI Product Finder helps Cabalen Auto Aircon users browse car air-conditioning products and narrow the list by vehicle brand, model, and year. The current version is a demo with 20 sample products. Exact vehicle compatibility must still be verified before using a product.

Live app: https://teywyl.github.io/caa-ai-product-finder/

Project repository: https://github.com/Teywyl/caa-ai-product-finder

## Setup and installation

### Requirements

- Node.js 20 or later and npm.
- Git to clone the repository.
- A web browser.

The current demo does not require a database.

### Get the code

```bash
git clone https://github.com/Teywyl/caa-ai-product-finder.git
cd caa-ai-product-finder/client
npm install
cp .env.example .env
```

### Environment and configuration

Keep these client settings in `client/.env`:

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:3000
```

| Variable | Location | Purpose and example |
| --- | --- | --- |
| `VITE_USE_MOCK_API` | Client | `true` uses bundled sample products. Only `false` selects the real API. |
| `VITE_API_BASE_URL` | Client | API address, such as `http://localhost:3000`. Ignored in demo mode. |
| `VITE_BASE_PATH` | Client build | Deployment path. The Pages workflow sets `/caa-ai-product-finder/`. |
| `DATABASE_URL` | Server | PostgreSQL connection string, such as `postgresql://USER:PASSWORD@localhost:5432/DATABASE`. |
| `CORS_ORIGINS` | Server | Allowed browser origins, such as `http://localhost:5173`. |
| `NODE_ENV` | Server | `development` locally or `production` when deployed. |
| `PORT` | Server | Hosting provider’s assigned port. The server defaults to `3000` when unset. |
| `POSTGRES_PASSWORD` | Optional Docker Compose setup | Database password, such as `REPLACE_WITH_A_LOCAL_PASSWORD`. |

Real credentials belong in untracked environment files or hosting settings. Values beginning with `VITE_` are public in the client build and must not contain secrets.

### Database setup and seed status

The product database is not implemented yet. The current catalog comes from `client/src/api/products.json`.

The repository contains PostgreSQL starter files for sightings. To run that starter separately, create a PostgreSQL database, install the server dependencies, and configure its environment file:

```bash
cd ../server
npm install
cp .env.example .env
```

Set `DATABASE_URL` in `server/.env` to your development database connection string. Then run:

```bash
npm run db:schema
npm run db:seed
```

These commands create and seed the template’s sightings table, not a product table. The seed command deletes existing sightings, so use a disposable development database.

## How to run it

From the repository root:

```bash
cd client
npm run dev
```

Open the address printed by Vite, usually `http://localhost:5173/`. In Codespaces, open the forwarded address for port 5173.

The first screen shows the CAA AI Product Finder heading, a demo notice, vehicle filters, and sample product cards.

To check the production build, run inside `client/`:

```bash
npm run build
```

If you configured the starter server and database, start it in a separate terminal from the repository root:

```bash
cd server
npm run dev
```

Its default address is `http://localhost:3000`. Starting it does not connect the product demo to a product database.

## Features and usage

The demo contains 20 products:

- Five cabin filters.
- Five compressors.
- Five evaporators.
- Five blower motors.

To browse the catalog:

1. Select a car brand.
2. Select a model from the available choices.
3. Enter a vehicle year to narrow the results further.
4. Check the matching-product count and displayed cards.
5. Select **View details** to display the product’s category, part number, and description below the list.
6. Select **Close details** to hide that information.
7. Select **Clear filters** to show all products again.

A message appears when no products match. Filters use the sample records and do not independently verify compatibility.

### Current API status

The product client is prepared to request `GET /api/products`, but that endpoint is not implemented on the server. Keep demo mode enabled.

The starter server currently provides:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/healthz` | Checks whether the server process responds. |
| GET | `/readyz` | Checks database connectivity. |
| GET | `/api/sightings` | Lists template sightings. |
| GET | `/api/sightings/:id` | Retrieves one template sighting. |
| POST | `/api/sightings` | Creates a template sighting. |
| PUT | `/api/sightings/:id` | Updates a template sighting. |
| DELETE | `/api/sightings/:id` | Deletes a template sighting. |

The sightings routes are unfinished starter functionality for this project. Their write operations have no access protection and should not be exposed as the finished product API.

## Project structure

| Path | Contents |
| --- | --- |
| `client/src/App.jsx` | Product browsing interface and vehicle filters. |
| `client/src/api/products.json` | Sample product catalog. |
| `client/src/api/index.js` | Selects the demo or HTTP API implementation. |
| `client/src/api/mockApi.js` | Supplies the sample products. |
| `client/src/api/httpApi.js` | Functions for calling the server. |
| `client/src/components/DemoNotice.jsx` | Explains demo limitations. |
| `client/src/styles.css` | Interface styling. |
| `server/` | Express starter server and database queries. |
| `server/db/` | PostgreSQL connection, schema, and seed scripts. |
| `.github/workflows/deploy-pages.yml` | Builds and deploys the client to GitHub Pages. |
| `docs/` | Screenshot and template documentation files. |

## Screenshots

![CAA AI Product Finder](docs/screenshot.png)

## Known issues and next steps

- The application runs in demo mode. The product API and PostgreSQL database are not connected.
- Some product part numbers and compatible years still need verification.
- Product details appear below the full list and can be difficult to notice.
- Category filtering is not implemented.
- The screenshot needs updating.
- The sample catalog contains 20 products; expansion to 50 is planned.
- Login, authorized product management, and AI-assisted product searches are not implemented.
- The server needs dependency updates and access protection before deployment.

## AI usage

![Built with AI assistance](https://img.shields.io/badge/built%20with-AI%20assistance-0b5fff)

I worked on the project with ChatGPT as a guide to keep the development on track. It suggested code, explained the steps, and helped me troubleshoot errors. I entered and reviewed the changes, worked on the product data, ran the build, and checked the live site. I used the guidance to learn why each change was needed and how the parts connect. Details of the assistance and my contributions are recorded in [AI-USAGE.md](AI-USAGE.md).
