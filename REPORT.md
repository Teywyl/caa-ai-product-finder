# Weekly Increment Report

## Week of: September 14-20, 2026 — Week 1

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

# Weekly Increment Report

## Week of: September 21–27, 2026

## What changed this week

- Added filters for car brand, model, and year. The available model choices change based on the selected brand.
- Added a Clear filters button, a product count, and a message when no products match.
- Expanded the sample catalog from three to 20 products, with five cabin filters, five compressors, five evaporators, and five blower motors.
- Revised product names, part numbers, and year ranges in `products.json`.
- Updated the demo notice to explain the current limitations.
- Deployed the updated client to GitHub Pages.

## Why

I added the filters so users can narrow down the products using their vehicle information instead of checking every item manually. Expanding the catalog gave me more products and categories to work with when checking the filters. I also revised the product information to make the sample listings more useful, although exact compatibility still needs verification.

## What broke or what I got stuck on

I had difficulty finding exact compatible years and part numbers for some products. Some listings did not provide enough information, so I still need to verify these records.

Two deployment runs failed before the latest successful deployment. I still need to review their logs to confirm the causes.

The server still uses the template’s sightings routes and database tables. It does not have a working product endpoint yet, so the client remains in demo mode. The README and screenshot also need updating to match the current interface.

## What is left

- Update the documentation and screenshot, and complete the security checklist.
- Verify the product information and expand the catalog to 50 products.
- Add category filtering and improve the product details display.
- Create the product API and PostgreSQL tables, then deploy and connect them to the client.
- Add login and authorized product management.
- Implement AI-assisted searches using the products stored in the database.
- Test the completed application and fix remaining issues.
