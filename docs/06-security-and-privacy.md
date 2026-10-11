# Security and privacy checklist

Reviewed on October 11, 2026, against the current application code and the manual checks I completed.

Checked items describe implemented controls or confirmed actions. Unchecked items still need verification. This checklist is not a claim that the application has passed a complete security audit.

The repository is public, but the application requires an authorized account. Database credentials, account passwords and session tokens must remain private.

## Before the first push

- [x] `.gitignore` excludes `.env`, other private environment files, database dumps and log files.
- [ ] Complete the final tracked-file check for private environment files and keys.
- [x] Committed `.env.example` files contain example configuration values rather than the deployed credentials.
- [ ] Complete the final secret review of repository contents, history, screenshots and the demo recording.

The deployed database connection belongs in the API hosting settings. Client variables beginning with `VITE_` are included in the public build and must not contain secrets.

Three accounts were created for the Admin, Editor and Viewer roles, and the previous account was deleted. Their account information will be submitted privately through Canvas in a text file. It is not included in the public documentation.

Deleting a committed secret does not remove it from repository history. If a credential is exposed, rotate it at the service before cleaning up the repository.

## The application

- [x] Database queries handling user input use SQL parameters. Product IDs, model IDs, years, account information and edited values are passed separately from the SQL text.
- [x] Input validation runs on the server. Product, compatibility, account and login fields have validation rules and length limits.
- [x] CORS uses an allowed-origin list from `CORS_ORIGINS`; it does not allow every browser origin.
- [x] The deployed API was configured with `NODE_ENV=production`. Unexpected errors return a general message rather than a stack trace in the response body.
- [x] Helmet is installed and applied in the Express application.
- [x] Failed login attempts are limited by email and IP address. The current default blocks further attempts after five failures within a 15-minute window.
- [x] Passwords are hashed with scrypt and a random salt. The account responses do not return password hashes.
- [x] Protected API routes require a valid session. Product and compatibility changes require Editor or Admin access; account administration requires Admin access.

The app uses a shared shop catalogue rather than separate privately owned product records. Authorization is therefore enforced through server-side roles instead of a `user_id` ownership condition on every catalogue query.

I completed manual checks of the deployed browsing flow and permissions for Admin, Editor and Viewer. These checks are separate from the 62 passing automated server tests recorded on October 4.

Session tokens are randomly generated, and their SHA-256 hashes are stored in the database. Sessions expire after the configured duration, normally 12 hours. Signing out removes the server session.

The browser stores the session token in localStorage. This means that malicious JavaScript running in the application's origin could access it. The current implementation does not use an HttpOnly session cookie.

The login limiter uses server memory and resets when the server restarts. It is not a persistent or distributed rate limiter. It also does not provide a general rate limit for every API endpoint.

Helmet is already applied in `server/src/app.js`:

```js
import helmet from 'helmet'
app.use(helmet())
```

## Privacy

- [x] The catalogue seed uses shop product information, marketplace links and compatibility records. It is not a collection of customer profiles or orders.
- [x] The previous account was deleted after the three role accounts were created.

The application stores account names, email addresses, roles, active status, password hashes and session records. Administrators can manage accounts. The public documentation records the three account roles without publishing their login information.

The application opens external marketplace listings. Purchases and payment details are handled by those platforms rather than collected by this app.

I will keep grading credentials in the private Canvas submission. Public screenshots should not show passwords, database connection strings, session tokens or private hosting settings.

## What to write in your journal

The main security risk in my project is exposing credentials because the repository is public and the app has accounts. I kept private environment files out of Git, configured the database connection through the hosting settings and used hashed passwords with server-side account permissions. I created three role accounts and deleted the previous account, and I will submit the login information privately through Canvas. I also recognize the limits of the current implementation: session tokens are stored in localStorage, the login limiter resets when the server restarts, and the final secret and dependency checks are not yet complete. I will not describe these unfinished checks as passed.
