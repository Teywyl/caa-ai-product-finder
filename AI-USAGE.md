# AI usage

I am building CAA AI Product Finder with AI assistance. This is a continuing record of what I asked, what I used, and what I changed.

## 1. How I used AI

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

## 2. Where the AI got it wrong

### Case 1 — Unclear instructions for the API exports

- **What it gave me:** Directions to add `listProducts` to `client/src/api/index.js`.
- **What was wrong with it:** The instructions did not make it clear enough that I needed to edit the existing export block. I ended up with two blocks, and the product page did not work.
- **What I did instead:** I checked the browser console, kept one export block with `listProducts`, and verified that the page displayed the products.
- **Commit:** https://github.com/Teywyl/caa-ai-product-finder/commit/db8da570fe37233cfe06017f6261022ea2e15384

I will add other specific cases when I have corrected and committed them.

## 3. Who wrote what

### Written by me

I have not yet identified a substantial piece of application code that I can honestly claim as independently written. I will add the exact file, commit, and an explanation in my own words after writing and testing that code.

### The AI-written part I understand best

- **File:** `client/src/App.jsx`
- **Commit:** https://github.com/Teywyl/caa-ai-product-finder/commit/db8da570fe37233cfe06017f6261022ea2e15384
- **What it does and why I kept it:** `App.jsx` calls `listProducts` through the shared API entry file. It shows a loading message while waiting, an error if loading fails, and product cards when data arrives. Selecting a card's button stores that product in React state so its details appear. I kept the shared API entry point because the screen can later use the Express product API without changing where `App.jsx` imports its data function.