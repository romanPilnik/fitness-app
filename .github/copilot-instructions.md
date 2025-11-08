## Quick orientation for AI contributors

This repository is a two-part app: a Vite + React frontend (`/client`) and an Express + Mongoose backend (`/server`). The file layout and conventions below are derived from the codebase and are intended to make edits predictable and safe.

Key facts
- Server: CommonJS (see `server/package.json` has `"type": "commonjs"`) and runs from `server/server.js`.
- Client: ESM React app using Vite (`client/package.json`, `type: "module"`).
- DB: MongoDB connection string is read from `process.env.MONGODB_URI` in `server/server.js`.
- Auth: JSON Web Tokens (JWT) issued in auth routes and verified by `server/middleware/auth.js` (expects header `Authorization: Bearer <token>`; attaches `req.user`).
- Routes: API prefixes are wired in `server/server.js`: `/api/auth`, `/api/user`, `/api/v1/templates`, `/api/v1/programs`.

Where to look for patterns/examples
- Register/login flows: `server/routes/auth.routes.js` (token creation and responses).
- User model and password handling: `server/models/User.js` (password `select: false`, `pre('save')` hashing, `comparePassword` instance method).
- Route -> controller/service pattern: `server/routes/*` -> `server/controllers/*` -> `server/services/*` (business logic lives in `services`).
- Middleware chain: `server/middleware/*` (auth, authorize, ownership, errorHandler). Errors are typically thrown and `errorHandler` middleware formats responses.

Run / dev commands (how developers start things)
- Start server (dev):
  - cd into server and run `npm run dev` (uses nodemon to restart on changes). See `server/package.json`.
- Start client (dev):
  - cd into client and run `npm run dev` (Vite dev server).

Environment variables to set when running locally
- `MONGODB_URI` — Mongo connection string
- `JWT_SECRET` — secret used to sign tokens (used in `auth.routes.js` and `middleware/auth.js`)
- Optional: `PORT` — port the server listens on (defaults to 5000)

Project-specific coding guidance (do this when editing)
- Keep server files CommonJS (use `require` / `module.exports`) unless you update `server/package.json` intentionally.
- When modifying authentication: follow existing flow — create JWT with `jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })` and return it in JSON responses like existing `auth.routes.js`.
- To protect an endpoint use `verifyToken` from `server/middleware/auth.js`. It expects the `Authorization` header with `Bearer ` prefix and attaches `req.user`.
- When changing `User` behaviors, preserve the `pre('save')` hook and `comparePassword` method semantics (passwords are hashed and `password` is stored with `select: false`).
- Throw errors with a `statusCode` property (e.g. `const err = new Error('msg'); err.statusCode = 400; throw err;`) so `server/middleware/errorHandler.js` can format responses.

Small examples (literal examples from repository)
- Authorization header example: `Authorization: Bearer eyJhbGciOiJI...`
- Token creation (from routes): `jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })` (see `server/routes/auth.routes.js`).

When adding features
- Add route files under `server/routes` and register them in `server/server.js` with the proper `/api` prefix.
- Put route handlers in `server/controllers` and business logic in `server/services` to match existing separation.
- Update `server/models` for DB schema changes; use schema `pre('save')` hooks and instance/static methods like existing `User` model.

Files to reference while coding
- `server/server.js` — app wiring, CORS, routes, DB connect
- `server/routes/auth.routes.js` — auth endpoints and token format
- `server/models/User.js` — schema patterns, password rules, instance/static methods
- `server/middleware/auth.js` & `server/middleware/errorHandler.js` — token verification and error handling

If you need more context or want different formatting (more examples, tests, or a code checklist), tell me which section to expand and I'll iterate.
