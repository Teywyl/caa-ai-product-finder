# CAA AI Product Finder

## Overview

CAA AI Product Finder is a private web app for Cabalen Auto Aircon and authorized users. Users select a vehicle brand, model and year to find products with confirmed compatibility records and open the shop's marketplace listings.

Editors and Admins can maintain products, shop links and compatibility records. Admins can also manage authorized accounts. There is no public registration.

Project repository: https://github.com/Teywyl/caa-ai-product-finder 

Live website: https://teywyl.github.io/caa-ai-product-finder/

API health: https://caa-product-finder-api.onrender.com/healthz

Database readiness: https://caa-product-finder-api.onrender.com/readyz

Demonstration video: https://drive.google.com/file/d/1DZ-Q6FQHfPUGiCPfDmcmF7NHz2CaTh_2/view?usp=drive_link

Full application deployment: The frontend is hosted on GitHub Pages, the Express API on Render and the PostgreSQL database on Neon.

## Current status

Documentation updated on October 11, 2026.

- The React client, Express API and PostgreSQL database are deployed and connected.
- The migrated database check showed 9 vehicle models and 27 products.
- Three accounts were created for the Admin, Editor and Viewer roles, and the previous account was deleted.
- I tested the complete deployed browsing flow and permissions for all three roles.
- All nine catalogue model files and the Ferrari F40 login model are committed to the repository.
- Viewer fixes were added for Honda City framing and S-Presso centering.
- The brand initials were replaced with Honda, Nissan and Suzuki logos.
- Home keeps the CABALEN heading after selecting a vehicle.
- I checked every vehicle model and reviewed the mobile layouts.
- I reviewed product details, marketplace links and compatibility restrictions.
- I completed the review of model credits and license conditions.
- The final demonstration link and private course-workspace pointer were added.
- The active client uses the real API.
- The Finder uses server-side keyword matching. Gemini is not connected.

All 62 automated server tests passed with 0 failures, and the full frontend production build passed on October 4, 2026. Later visual changes received focused code checks. These results do not represent a new full automated test run after every change.

The final deployed checks were completed manually. Further feedback fixes were deferred because of the submission deadline.

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

The current seed file has malformed quotation marks in some compatibility source notes. Correct these before using it for a fresh database setup. The existing deployed database is separate from this source-file issue.

After correcting the seed file, run inside `server/`, only against a new or disposable development database:

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

There are no default login credentials. Additional accounts are created through User Administration by an Admin.

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

The deployed application uses:

- GitHub Pages for the client, built through GitHub Actions.
- Render for the API, using `server` as the root directory, `npm ci` as the build command and `npm start` as the start command.
- Neon for PostgreSQL.
- `VITE_API_BASE_URL=https://caa-product-finder-api.onrender.com` for the deployed client build.
- `CORS_ORIGINS=https://teywyl.github.io`, `SESSION_HOURS=12` and `NODE_ENV=production` for the hosted API.
- A private `DATABASE_URL` configured in the API hosting settings.

Changes to the client trigger the GitHub Pages workflow. Changes made directly on GitHub should be pulled into Codespaces before continuing local work.

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

The first screen is Login. Sign in with the account created earlier. Keep both terminals running while using the local app.

The API normally runs on port 3000. PostgreSQL uses port 5433 in this setup; that port is not a website.

To use the deployed application, open:

https://teywyl.github.io/caa-ai-product-finder/

Codespaces does not need to remain open for the deployed application. The Render free service may take time to wake up after inactivity.

## Features and usage

### Main browsing flow

1. Sign in with an authorized account.
2. Select a brand from Home or Brands.
3. Select a vehicle model from its garage.
4. Choose the vehicle year.
5. Browse products with confirmed compatibility for that selection.
6. Open an item to view its details, fit records and available marketplace links.

The garage includes available models and decorative locked slots. Locked slots cannot be selected.

Users can return to Home through the Home navigation or the clickable CAA logo. The Home heading remains CABALEN after a vehicle is selected.

The current seed file contains:

- 3 brands.
- 9 vehicle models.
- 27 products.
- 46 marketplace links.
- 31 compatibility records.

All 31 compatibility records in the current seed are marked confirmed. Earlier reports recorded 26 products and seven unverified compatibility records; those figures describe the earlier revision. These counts describe the current source file, not a fresh query of every deployed database table.

Unverified compatibility records, if added, are stored separately and excluded from confirmed matches.

A product's presence in the catalogue does not establish its current stock availability. Engine and transmission differences are not enforced as search filters. Users should read the product details and fit restrictions before opening the marketplace listing.

### Account roles

| Role | Access |
| --- | --- |
| Viewer | Browse vehicles, products and confirmed matches, and use the Finder. |
| Editor | Viewer access plus product, shop-link and compatibility management. |
| Admin | Editor access plus account administration. |

Passwords are hashed with scrypt on the server. Protected API routes check the session and required role.

Three accounts were created for the Admin, Editor and Viewer roles, and the previous account was deleted. I manually tested the permissions of all three roles on the deployed application.

Account information will be submitted privately through Canvas in a text file. Login credentials are not published in this repository.

### Finder

The Finder accepts text such as:

```text
cabin filter for terra 2020
```

It uses keyword matching to identify the vehicle, year and category, then searches the database. It asks for missing information.

Gemini is not connected. The Finder does not generate new compatibility claims.

### Vehicle previews

The interface supports interactive vehicle previews. Generic shapes are used where an exact model asset is unavailable or cannot be loaded.

All nine catalogue model files are committed under `client/public/models/`. The large CR-V file was reduced for upload. Viewer corrections were added for Honda City framing and S-Presso centering.

The login page uses the uploaded Ferrari F40 model. It includes credit to vecarz and a link to the model's CC BY-NC-SA 4.0 license.

I checked every vehicle model and completed the review of model credits and license conditions.

The models are visual references and do not establish parts compatibility. Large files can take time to download.

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

Later viewer, branding and Ferrari login changes received focused code checks. A new full automated test run was not completed after every later change.

Final manual checks completed before submission:

- The complete deployed browsing flow.
- Admin, Editor and Viewer permissions.
- Every vehicle model and the mobile layouts.
- Product details, marketplace links and compatibility restrictions.
- Model credits and license conditions.

These manual checks are separate from the October 4 automated test results.

## Project structure

| Path | Contents |
| --- | --- |
| `client/src/App.jsx` | Application routing and screen composition. |
| `client/src/pages/` | Login, browsing, vehicle, item, Finder and management screens. |
| `client/src/components/` | Shared interface and vehicle preview components. |
| `client/src/api/` | API requests and session handling. |
| `client/src/lib/AppState.jsx` | Shared application state. |
| `client/src/lib/` | Navigation, catalogue helpers and model rendering. |
| `client/src/styles.css` | Shared styling. |
| `client/src/designs.css` | Interface themes. |
| `client/src/luxe.css` | Additional visual styling. |
| `client/src/assets/brands/` | Brand logo images. |
| `client/public/models/` | Catalogue models and the Ferrari login model. |
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

## Screenshots

### Login Page

![Login page](docs/screenshots/login.png)

### Home Page

![Home page](docs/screenshots/home.png)

### Car Brands

![Home page](docs/screenshots/brands.png)

### Car Models

![Home page](docs/screenshots/models.png)

### Product Details

![Product details](docs/screenshots/product-details.png)


## Known issues and next steps

- Correct the malformed quotation marks in some seed-file compatibility notes before running a fresh database setup.
- Address the remaining feedback in a future update. Further feedback fixes were deferred because of the submission deadline.
- Complete the remaining secret-review and current dependency checks.
- Review alternatives to storing the browser session token in localStorage.
- Improve the login limiter so its state persists across API restarts.
- Continue improving loading performance for large vehicle model files.
- Keep Gemini integration as a stretch goal.

The frontend, API and database are deployed. The final manual workflow, permissions, model, mobile and catalogue checks were completed. The demonstration link and private course-workspace pointer were also updated.

The application currently stores its browser session token in localStorage, and the login limiter uses in-memory state. These limitations and the security review are documented in [Security and privacy](docs/06-security-and-privacy.md).

## AI usage

Claude supplied most of the revised interface and backend code. ChatGPT/Codex reviewed files, explained implementation choices and guided troubleshooting and deployment. Codex also directly committed later viewer fixes, logo changes, the CABALEN Home heading and Ferrari login integration. AI image editing was used to remove the Nissan logo's background.

I provided the project requirements and wireframes, independently wrote the revised catalogue entries, gathered marketplace links and confirmed compatibility years with the shop. I independently corrected filenames, package scripts and catalogue test expectations.

I completed setup, database migration, deployment, model uploads and Git operations with AI guidance. I selected and supplied the logos and Ferrari model, checked the interface and reported problems. I personally created the three role accounts and deleted the previous account.

I completed the final manual checks of the deployed browsing flow, role permissions, vehicle models, mobile layouts, product information, marketplace links and model credits. I also added the demonstration link and updated the private course-workspace pointer.

Documentation updates were drafted with AI assistance. I reviewed the proposed information and requested that the existing format be preserved before applying the updates myself.

See [AI-USAGE.md](AI-USAGE.md) for the assistance record, incorrect or incomplete AI guidance and contribution details.
