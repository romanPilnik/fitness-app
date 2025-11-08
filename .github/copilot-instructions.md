## Quick orientation for AI contributors

This repository is a two-part app: a Vite + React frontend (`/client`) and an Express + Mongoose backend (`/server`). The file layout and conventions below are derived from the codebase and are intended to make edits predictable and safe.

Key facts
- Server: CommonJS (see `server/package.json` has `"type": "commonjs"`) and runs from `server/server.js`.
- Client: ESM React app using Vite (`client/package.json`, `type: "module"`).
- DB: MongoDB connection string is read from `process.env.MONGODB_URI` in `server/server.js`.
- Auth: JSON Web Tokens (JWT) issued in auth routes and verified by `server/middleware/auth.js` (expects header `Authorization: Bearer <token>`; attaches `req.user`).
- Routes: API prefixes are wired in `server/server.js`: `/api/auth`, `/api/user`, `/api/v1/templates`, `/api/v1/programs`.

Architectural patterns
- Service layer pattern: Business logic lives in `services/`, controllers handle HTTP concerns, routes define endpoints
- Standard response format using `utils/response.js`: `sendSuccess()`, `sendError()`, `sendPaginated()`
- Pagination utilities in `utils/pagination.js`: Used across services for consistent list handling
- Rich Mongoose schemas with business logic: See models using virtuals, methods, statics, and hooks

Where to look for patterns/examples
- Register/login flows: `server/routes/auth.routes.js` (token creation and responses)
- User model and password handling: `server/models/User.js` (password `select: false`, `pre('save')` hashing)
- Rich domain models: `WorkoutSession.js`, `UserExerciseProfile.js` (complex schemas with business logic)
- Role-based auth: `middleware/authorize.js` using `requireRole()` middleware
- Resource ownership: `middleware/ownership.js` using `verifyOwnership()` middleware
- Error handling: `middleware/errorHandler.js` with standardized error responses

Response format conventions
```js
// Success response
{
  "success": true,
  "data": { /* payload */ },
  "message": "Optional success message"
}

// Error response 
{
  "success": false,
  "error": {
    "message": "Human readable message",
    "code": "ERROR_CODE",
    "details": {} // Optional validation details
  }
}
```
