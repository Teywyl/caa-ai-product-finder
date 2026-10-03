# AI usage

I used ChatGPT while building CAA AI Product Finder. It helped me plan changes, suggested code, explained why files needed to change, and guided me through errors and deployment. I made the changes in Codespaces and checked the results myself. I used the explanations to learn how the React client, API files, build, and GitHub Pages deployment work together.

## 1. How I used AI

### 2026-09-23 — Turning the template into a product browser

- **Tool:** ChatGPT
- **What I asked for:** Step-by-step help changing the sightings template into a CAA product browsing app, with explanations of what to edit and why.
- **What it gave back:** Suggested changes to the React page, sample product data, and API files.
- **What I kept, what I changed, and why:** I used the suggestions to build the first product list and details view. I chose the CAA project direction, entered and reviewed the changes in Codespaces, and checked the page in my browser. The products are labelled as samples because their fitment has not been verified.
- **Commit:** [First product browsing increment](https://github.com/Teywyl/caa-ai-product-finder/commit/db8da570fe37233cfe06017f6261022ea2e15384)

### 2026-09-23 — Understanding and fixing the blank page

- **Tool:** ChatGPT
- **What I asked for:** Help understanding why the page was blank and what the browser error about `listProducts` meant.
- **What it gave back:** An explanation that `App.jsx` imported `listProducts` but `src/api/index.js` did not export it correctly.
- **What I kept, what I changed, and why:** I checked the browser console, corrected the API export, and reloaded the page to confirm the products appeared. This helped me understand that an imported function must also be exported from the module named in the import.
- **Commit:** [First product browsing increment](https://github.com/Teywyl/caa-ai-product-finder/commit/db8da570fe37233cfe06017f6261022ea2e15384)

### 2026-09-23 — Checking the build and deployment

- **Tool:** ChatGPT
- **What I asked for:** Help building the client and publishing it through GitHub Pages.
- **What it gave back:** The build command, an explanation of why it must run inside `client/`, and guidance for selecting GitHub Actions as the Pages source.
- **What I kept, what I changed, and why:** I ran `npm run build` in `client/`, checked the Actions result, corrected the Pages setting after the first deployment failed, and opened the live site in an incognito window. This taught me the difference between a successful local build and a successful deployment.
- **Commit:** [First product browsing increment](https://github.com/Teywyl/caa-ai-product-finder/commit/db8da570fe37233cfe06017f6261022ea2e15384)

### 2026-10-04 — Correcting filenames and command typos

- **Tool:** ChatGPT/Codex
- **What I asked for:** Help implementing the revised files and checking why the project was not building correctly.
- **What it gave back:** Code, inconsistent filenames and commands for the revised client and server. The implementation process left some filenames inconsistent with their imports and some package scripts with incorrect syntax.
- **What I kept, what I changed, and why:** I corrected the filenames so they matched the imports exactly:
  - `client/src/design.css` → `client/src/designs.css`
  - `client/src/pages/Items.jsx` → `client/src/pages/Item.jsx`
  - `server/src/repos/ProductRepo.js` → `server/src/repos/productsRepo.js`
  - `server/src/repos/CompatibilityRepo.js` → `server/src/repos/compatibilityRepo.js`
  
  I also corrected the server scripts to use `--env-file=.env`. These corrections were necessary because incorrect spelling, capitalization and command syntax prevented the files and scripts from working together.
- **Commits:**
  - [Stylesheet filename](https://github.com/Teywyl/caa-ai-product-finder/commit/c1d734c)
  - [Item page filename](https://github.com/Teywyl/caa-ai-product-finder/commit/924d6f0)
  - [Product repository filename](https://github.com/Teywyl/caa-ai-product-finder/commit/df07ceb)
  - [Compatibility repository filename](https://github.com/Teywyl/caa-ai-product-finder/commit/b63d9a1)
  - [Package script corrections](https://github.com/Teywyl/caa-ai-product-finder/commit/89db528)

### 2026-10-04 — Connecting the application and checking the results

- **Tool:** ChatGPT/Codex
- **What I asked for:** Help with database connection and login errors.
- **What it gave back:** Diagnostic commands and explanations for checking PostgreSQL, database tables and the client-to-server connection.
- **What I kept, what I changed, and why:** I ran the checks and provided the actual terminal output. I corrected the database connection from port 5432 to 5433. I confirmed that the application database was empty before initializing its tables and creating my admin account.

  I then checked the API directly and through Vite. Both responded, but the browser still could not sign in. I found that `client/.env` used `VITE_API_BASE_URL=http://localhost:3000`. I changed it to a blank value, restarted the client and successfully signed in through the development proxy.

  The first test run was cancelled because `caa_revision_test` did not exist. I created that separate database and reran the tests. All 62 passed, and the frontend production build also passed.
- **Related code commits:**
  - [Client API connection](https://github.com/Teywyl/caa-ai-product-finder/commit/a1f024f)
  - [API tests](https://github.com/Teywyl/caa-ai-product-finder/commit/589a507)
  - [Compatibility tests](https://github.com/Teywyl/caa-ai-product-finder/commit/74a1bda)
- **Evidence note:** The environment changes and database setup were local operations, not committed source changes. The commit links identify the related implementation and tests; the results came from the commands I ran.

## 2. Where the AI got it wrong

### Case 1 — Unclear instructions for the API exports

- **What it gave me:** Directions to add `listProducts` to `client/src/api/index.js`.
- **What was wrong with it:** The instructions did not make it clear enough that I needed to edit the existing export block. I ended up with two blocks, and the product page did not work.
- **What I did instead:** I checked the browser console, kept one export block with `listProducts`, and verified that the page displayed the products.
- **Commit:** https://github.com/Teywyl/caa-ai-product-finder/commit/db8da570fe37233cfe06017f6261022ea2e15384

I will add other specific cases when I have corrected and committed them.

### Case 2 — Filename mismatches

- **What it gave me:** File-by-file implementation guidance that did not prevent mismatches between filenames and imports.
- **What was wrong with it:** Some names used the wrong capitalization or singular/plural form. The application expected exact names, so these inconsistencies caused problems.
- **What I did instead:** I renamed the stylesheet, Item page, product repository and compatibility repository to match their imports.
- **Commits:**
  - https://github.com/Teywyl/caa-ai-product-finder/commit/c1d734c
  - https://github.com/Teywyl/caa-ai-product-finder/commit/924d6f0
  - https://github.com/Teywyl/caa-ai-product-finder/commit/df07ceb
  - https://github.com/Teywyl/caa-ai-product-finder/commit/b63d9a1

### Case 3 — Incorrect package script syntax

- **What it gave me:** Guidance for package scripts during the manual implementation.
- **What was wrong with it:** The resulting scripts included incorrect forms such as `--env-file_.env` and `--env-file+.env` instead of `--env-file=.env`.
- **What I did instead:** I corrected the syntax and checked the scripts by running the application and tests.
- **Commit:** https://github.com/Teywyl/caa-ai-product-finder/commit/89db528

### Case 4 — Incomplete startup instructions

- **What it gave me:** Instructions to create an account and run the application before confirming that every database setup step had been completed.
- **What was wrong with it:** The instructions did not establish whether the database connection used the correct port or whether the required tables existed. The account script also displayed a blank `Failed:` message for the initial connection error, which made the cause harder to understand.
- **What I did instead:** I ran the diagnostic commands and supplied their output. I confirmed PostgreSQL was accepting connections, identified the incorrect port, and checked the tables. The database reported “Did not find any relations.” Only after confirming it was empty did I initialize it and create the account.
- **Evidence:** Local terminal checks and successful account creation on October 4. These setup operations have no source-code commit.

### Case 5 — Browser connection and missing test database

- **What it gave me:** Startup and test instructions without first checking the client environment or confirming that the separate test database existed.
- **What was wrong with it:** The browser's API address pointed to localhost on my computer, and the test database was missing. Running both application processes was not enough to resolve these setup problems.
- **What I did instead:** I verified the API responses, changed the client API base URL to blank, restarted Vite and signed in. I then created the test database and reran the tests.
- **Result:** All 62 tests passed, and the frontend build succeeded.
- **Related test commits:**
  - https://github.com/Teywyl/caa-ai-product-finder/commit/589a507
  - https://github.com/Teywyl/caa-ai-product-finder/commit/74a1bda
- **Evidence note:** The local configuration corrections are intentionally untracked.

## 3. Who wrote what

### Written by me

### Corrections and verification I completed

On October 4, I corrected filename mismatches and package script syntax, configured the database connection, confirmed that the database was empty, initialized it, and created an admin account.

I also corrected the client API configuration, successfully signed in, opened the main screens, created the separate test database, and ran all 62 passing tests and the successful frontend build.

I completed these actions with AI guidance and checked the results myself. They demonstrate my integration, troubleshooting and verification work.

### The AI-written part I understand best

- **Files:** `server/src/repos/compatibleProductsRepo.js` and `server/src/routes/compatibleProducts.js`
- **Query commit:** https://github.com/Teywyl/caa-ai-product-finder/commit/02a7ff0420edf11b53a23c152ef4f86c414b8e3d
- **Route commit:** https://github.com/Teywyl/caa-ai-product-finder/commit/60d705c2b9cbbacd3340060ccd00b883d615216b

This code finds products that have confirmed compatibility with the selected vehicle model and year. The route first checks whether the model exists and whether the year is valid and within the model's recorded range. It then calls the database query. The query only returns listed products with confirmed fit records. The selected year must be on or after the starting year and on or before the ending year. If the ending year is empty, the record means that compatibility continues onward. It selects one matching fit record per product so overlapping records do not display the same product twice. It also uses SQL parameters for the model and year instead of joining user input into the query text. I kept this implementation because the app should show recorded compatibility without treating unverified information as a confirmed match. A valid search with no matches returns an empty list. AI supplied this implementation. I applied it and ran the tests, including checks for year boundaries, unverified records, unlisted products and duplicate results. All 62 server tests passed on October 4, 2026.
