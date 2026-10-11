# Final project - proposal

## The idea
I'm building CAA AI Product Finder, a private web app for Cabalen Auto Aircon, our family's car aircon parts shop. You pick a car brand, model and year, and the app shows the parts we've confirmed fit that car, with a button straight to our listing on Lazada, Shopee or TikTok Shop. Staff with the right account can also keep the product list and the fit records up to date.

## Why
The app will make it easier for me, my family, and authorized Cabalen Auto Aircon users to find 
the correct product for a vehicle without checking product information manually. 
I also want to learn how to connect a React with Vite front end, an Express API, a PostgreSQL 
database, and an AI API such as Gemini in one working application.

## Scope
**For the first version, the app will include: **

- A private login with Viewer, Editor and Admin roles. There's no public sign-up. Passwords are hashed on the server, and the first admin is created from the command line.
- A Home page with Quick Search, a 3D vehicle preview and brand cards you can scroll through sideways.
- A brand garage for each brand: 12 slots, with the available models lit up and the empty slots shown as locked car silhouettes. The locked ones are just decoration and can't be clicked.
- A vehicle page with the model name, a year you can change, the 3D preview, and the compatible parts for that year. The Nissan Terra uses its real 3D model (credited, CC BY 4.0). The other cars use a simple 3D shape for now.
- Item details with the product info, its recorded fit, and our exact marketplace links. If a part isn't on one of the marketplaces, that button shows as unavailable.
- Product records for Editors and Admins: add, edit and delete products, shop links and compatibility records.
- User administration for Admins, opened from the account menu: add users, change roles, turn accounts off and reset passwords.
- PostgreSQL tables for users, sessions, brands, vehicle models, products, shop links and compatibility. They're seeded with our real data so far: 3 brands, 9 models, 7 products and 11 fit records.
- A Finder that reads a request like "cabin filter for terra 2020" and searches our records. If the car or the year is missing, it asks. Right now this is keyword matching on the server, not an AI API. I haven't connected Gemini yet, so I'm not counting that as done.

**For the first version, the app will not include: **

• Online payments  
• Customer ordering  
• Delivery tracking  
• A full inventory management system with shelf or rack locations  
• Public account registration  
• AI-generated product compatibility that is not found in the CAA database

## Milestones
- Set up the React (Vite) front end, the Express API and the PostgreSQL database
- Login, roles and basic navigation
- Home, Brands and garage, Vehicle, Item details and Finder pages
- Database tables and the first real CAA product and fit data
- Quick Search and the year filter
- Create, edit and delete products, shop links and fit records
- Run the automated API tests and record the results.
- Write the confirmed-compatibility search myself. This is the query and route that decide which parts fit a car and year. It's my own part of the project, and the vehicle page and Finder depend on it.
- Deploy the database (Neon) and the API (Render), and connect the GitHub Pages site to them
- Connect Gemini or another AI API to the Finder, still only searching our own records.
- Test everything on the deployed site, on desktop and phone, and fix what breaks


## Open questions
The biggest risk is time. The final project is due October 7, so I need to finish my part of the search and get the deployed client, API and database talking to each other before then. If that runs late, the Gemini connection is the first thing I'd cut, since the keyword parsing is implemented, but returning compatible matches still depends on the unfinished search.

The data still needs work too. Six fit records are marked "needs verification" and aren't shown as matches yet. The Suzuki and Honda models have no confirmed parts. Only the Terra has its exact 3D model, so the other eight still need downloading and crediting.
