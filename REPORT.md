# Weekly Increment Report

## Week of: September 21–23, 2026 — Week 1

## What changed this week

- Created the CAA AI Product Finder repository from the course template and opened it in Codespaces.
- Changed the template’s sightings interface into a product browsing page.
- Added three sample products with part numbers and example vehicle information.
- Added a View details button that displays the selected product’s information.
- Connected the product page to the simulated API through `listProducts`.
- Built the React client and deployed the demo to GitHub Pages.

## Why

I wanted to create the first working version of CAA AI Product Finder so users could browse sample car air-conditioning products and view their information. I started in demo mode so I could work on the interface before connecting the Express API and PostgreSQL database.

## What broke or what I got stuck on

Changing the title in `index.html` only changed the browser tab title. I had to edit `App.jsx` to change the heading and content inside the page.

The page became blank because `App.jsx` imported `listProducts`, but the shared API file did not export it correctly. I checked the browser console and corrected the export.

I also ran `npm run build` from the repository root, where there was no `package.json`. Running it inside `client/` completed the build.

The first deployment failed because GitHub Pages was not enabled correctly. After selecting GitHub Actions as the source and rerunning the deployment, I opened the live site in an incognito window.

## What is left

- Add filters for vehicle brand, model, year, and product category.
- Expand and verify the sample product catalog.
- Replace the sightings backend with product routes and PostgreSQL tables.
- Add login and authorized product management.
- Deploy the API and database and connect them to the client.
- Implement AI-assisted product searches using stored product information.
- Keep the documentation, screenshots, and AI usage record current.
