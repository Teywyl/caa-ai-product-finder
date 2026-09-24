# CAA AI Product Finder

CAA AI Product Finder is a web app for Cabalen Auto Aircon users to browse car air-conditioning products and, as development continues, find products that match a vehicle.

**Live site:** https://teywyl.github.io/caa-ai-product-finder/
**Repository:** https://github.com/Teywyl/caa-ai-product-finder
**API:** Not deployed yet.
**Demo video:** Not recorded yet.

> **This site is running in demo mode.** It displays sample products bundled with the React client. The product API and PostgreSQL database are not connected yet. The vehicle information is sample data and must be verified before use.

## What it does

- Displays three sample car air-conditioning products.
- Shows each product's part number and example vehicle information.
- Opens a product's description when the user selects **View details**.

Vehicle search, product management, and AI features are planned; they are not available in the current demo.

## Built with

The working client uses React and Vite and is hosted on GitHub Pages. The repository also contains Express and PostgreSQL starter code from the course template. That server code still uses sightings and needs to be adapted for products before it can be deployed as this app's API.

## Demo mode

The current product list comes from `client/src/api/products.json`. The client reads it through `client/src/api/mockApi.js`; visitors cannot add or edit products. The site does not currently request products from a server or save them to a database.

The client chooses its API implementation at build time:

| `VITE_USE_MOCK_API` | Current behavior |
| --- | --- |
| Unset or any value except `false` | Uses the sample products included in the client build. |
| `false` | Calls the API URL in `VITE_API_BASE_URL`. Do not select this yet: the product endpoint is not implemented on the server. |

The completed project is intended to connect the React client, an Express product API, and PostgreSQL. GitHub Pages hosts the client; the API and database will need separate hosts.

## Running it yourself

From the repository root, run the client in demo mode:

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Open the local address printed by Vite. To check the production build, run `npm run build` inside `client/`.

The existing server is still template starter code, so its sightings routes do not serve the product list shown on the client.

## Environment variables

| Name | Where | Purpose |
| --- | --- | --- |
| `VITE_USE_MOCK_API` | Client build | Only `false` selects the real API; demo mode is the default. |
| `VITE_API_BASE_URL` | Client build | Public Express API URL when the product API is ready. |
| `DATABASE_URL` | Server | PostgreSQL connection string; keep it secret. |
| `CORS_ORIGINS` | Server | Origins allowed to call the API. |

Values beginning with `VITE_` are included in public client code. Do not put passwords or secret keys in them.

## Deploying

The client deploys through `.github/workflows/deploy-pages.yml`. The repository's **Settings → Pages → Source** is set to **GitHub Actions**. I checked the live product page in an incognito window.

The product API and database are not deployed yet. When they are ready, the client will need the correct API URL and a new build with demo mode turned off.

## Project structure

- `client/` — React interface and Vite build.
- `client/src/api/` — sample product data, simulated API, real API client, and data-source selection.
- `server/` — Express and PostgreSQL starter code to adapt for products.
- `docs/` — project documentation and progress reports.

## Architecture

The browser loads the React client from GitHub Pages. In the current demo, the client reads sample products included in its build. In the planned full version, the client will request products from an Express API, which will read product records from PostgreSQL.

## What I would do next

- Add search by vehicle brand, model, and year.
- Replace the server's sightings routes and database tables with product routes and tables.
- Deploy the product API and PostgreSQL database, then connect and test the three parts.

## Author

Wylengco, Teyshaun Zell R. | GitHub: https://github.com/Teywyl | BSCS, CS-403

## AI use

I used ChatGPT heavily for this first increment. It guided me through changing the template into a product browsing page, explained why each file needed to change, and helped me diagnose the blank page and deploy the site. ChatGPT suggested much of the initial client code and sample data. I entered and reviewed the changes in Codespaces, checked the browser error, ran the production build, and verified the live site. I record the specific assistance and what I learned in [AI-USAGE.md](AI-USAGE.md).

![Built with AI assistance](https://img.shields.io/badge/built%20with-AI%20assistance-0b5fff)

## Licence

MIT. See [LICENSE](LICENSE).