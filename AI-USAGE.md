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

### 2026-10-03 to 2026-10-04 — Correcting filenames and setup instructions

- **Tool:** ChatGPT
- **What I asked for:** Guidance for applying the revised application files and resolving startup errors.
- **What it gave back:** Suggested code, filenames, commands and explanations for running the client, API and database.
- **What I kept, what I changed, and why:** I corrected filenames so they matched the application's imports: `design.css` to `designs.css`, `Items.jsx` to `Item.jsx`, `ProductRepo.js` to `productsRepo.js`, and `CompatibilityRepo.js` to `compatibilityRepo.js`. I also corrected malformed environment-file options to `--env-file=.env`. These corrections taught me why exact filenames and command syntax matter.
- **Related commits:** [Stylesheet filename](https://github.com/Teywyl/caa-ai-product-finder/commit/c1d734c), [Item page filename](https://github.com/Teywyl/caa-ai-product-finder/commit/924d6f0), [Products repository filename](https://github.com/Teywyl/caa-ai-product-finder/commit/df07ceb), [Compatibility repository filename](https://github.com/Teywyl/caa-ai-product-finder/commit/b63d9a1), [Server script corrections](https://github.com/Teywyl/caa-ai-product-finder/commit/89db528)

### 2026-10-04 — Writing the revised product catalogue myself

- **Tool:** ChatGPT
- **What I asked for:** A review of the revised seed file that I wrote myself.
- **What it gave back:** Checks of the SQL structure, record relationships, marketplace links and compatibility year ranges.
- **What I kept, what I changed, and why:** I independently wrote the revised catalogue entries in `server/db/seed.sql`, building on the existing database structure. I gathered product information and marketplace links, identified the brands, models and categories, and confirmed compatibility years with the shop. The revised catalogue contains 26 products, 46 marketplace links and 31 compatibility records. Of those compatibility records, 24 are confirmed and 7 still need verification. I used AI's review to check my work.
- **Related file:** [Product catalogue seed](https://github.com/Teywyl/caa-ai-product-finder/blob/main/server/db/seed.sql)

### 2026-10-04 — Correcting the catalogue tests myself

- **Tool:** ChatGPT
- **What I asked for:** Help understanding why a compatibility test still failed after I had already corrected it.
- **What it gave back:** An explanation of the assertion failure and, after I requested a repository check, confirmation that my correction was already committed on GitHub.
- **What I kept, what I changed, and why:** I independently updated the expected product count to 26 in `server/test/api.test.js`. I also changed `assert.equal(first.record.yearTo, null)` to `assert.equal(first.record.yearTo, 2026)` in `server/test/compatibility-search.test.js`, matching the ending year I confirmed with the shop. AI initially repeated a correction I had already made. The remaining problem was an older copy in Codespaces. I pulled my changes and ran the tests again: all 62 passed with 0 failures.
- **Related files:** [API tests](https://github.com/Teywyl/caa-ai-product-finder/blob/main/server/test/api.test.js), [Compatibility tests](https://github.com/Teywyl/caa-ai-product-finder/blob/main/server/test/compatibility-search.test.js)

### 2026-10-04 — Checking and recovering the local database

- **Tool:** ChatGPT
- **What I asked for:** Help resolving database connection errors and restarting PostgreSQL.
- **What it gave back:** Commands for checking database readiness, inspecting tables and recovering the Docker container using its existing storage volume.
- **What I kept, what I changed, and why:** During the initial setup, I checked the database and confirmed that it had no tables. The earlier guidance had not established this before account creation, which failed because the `users` table did not exist. I followed the setup guidance and corrected the connection configuration. Later, when the container failed to restart, I inspected its storage volume and used the suggested recovery commands. I learned to check the client, API and database separately rather than assume one running service means the whole application is ready.
- **Evidence:** My terminal checks and the successful server test run on October 4, 2026.

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

- **File:** `server/db/seed.sql`
- **What I wrote:** I independently wrote the revised catalogue entries using the existing database structure. I gathered and entered the product information, brands, models, categories, marketplace links and compatibility records. I also confirmed the compatibility years with the shop and updated them myself.
- **What it does and why it matters:** The seed file loads the catalogue into PostgreSQL. Product IDs connect each product to its marketplace links and vehicle compatibility records. My revision contains 26 products, 46 marketplace links and 31 compatibility records, with 24 confirmed and 7 awaiting verification.
- **File link:** [Product catalogue seed](https://github.com/Teywyl/caa-ai-product-finder/blob/main/server/db/seed.sql)

### Existing code I corrected myself

- **Files:** `server/test/api.test.js` and `server/test/compatibility-search.test.js`
- **What I changed:** I updated the expected product count to 26 and changed the expected compatibility ending year from `null` to `2026`. These corrections matched my revised catalogue and the years I confirmed with the shop.
- **Other corrections:** I corrected filenames so they matched the application imports and fixed malformed `--env-file` options in the server scripts.
- **How I checked it:** After pulling my committed changes into Codespaces, I ran `npm test`. All 62 tests passed with 0 failures on October 4, 2026.
- **File links:** [API tests](https://github.com/Teywyl/caa-ai-product-finder/blob/main/server/test/api.test.js), [Compatibility tests](https://github.com/Teywyl/caa-ai-product-finder/blob/main/server/test/compatibility-search.test.js)

### Corrections and verification I completed

On October 4, I corrected filename mismatches and package script syntax, configured the database connection, confirmed that the database was empty, initialized it, and created an admin account.

I also corrected the client API configuration, successfully signed in, opened the main screens, created the separate test database, and ran all 62 passing tests and the successful frontend build.

I completed these actions with AI guidance and checked the results myself. They demonstrate my integration, troubleshooting and verification work.

### The AI-written part I understand best

- **Files:** `server/src/repos/compatibleProductsRepo.js` and `server/src/routes/compatibleProducts.js`
- **Query commit:** https://github.com/Teywyl/caa-ai-product-finder/commit/02a7ff0420edf11b53a23c152ef4f86c414b8e3d
- **Route commit:** https://github.com/Teywyl/caa-ai-product-finder/commit/60d705c2b9cbbacd3340060ccd00b883d615216b

This code finds listed products with confirmed compatibility for the selected vehicle model and year. The route checks that the model exists and that the year is valid and within its recorded range. The database query then checks whether the selected year falls within each confirmed fit record. An empty ending year means the range continues onward. It excludes unverified records, prevents duplicate products and uses SQL parameters to keep user input separate from the query text.

AI supplied this search implementation. I applied it and independently wrote the revised catalogue entries in `server/db/seed.sql`, including product information, marketplace links and compatibility years confirmed with the shop. I also corrected the tests myself by updating the expected product count to 26 and changing the expected ending year from `null` to `2026`.

The test initially continued to fail because Codespaces had an older copy of my GitHub changes. After pulling my updated files, I ran the full server test suite. All 62 tests passed on October 4, 2026. This helped me understand how the search depends on accurate catalogue records and how test expectations must match intentional data changes.
