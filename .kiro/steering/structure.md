# Project Structure

## Monorepo Layout

Separate client and server directories at root level.

## Server Architecture (`/server`)

Follows MVC pattern with service layer:

```
server/
├── controllers/     # HTTP request handlers, delegate to services
├── services/        # Business logic layer (organized by domain)
├── models/          # Mongoose schemas and model definitions
├── routes/          # Express route definitions
├── middleware/      # Custom middleware (auth, error handling, authorization)
├── utils/           # Helper functions (pagination, response formatting)
└── server.js        # Application entry point
```

### Conventions

- **Controllers**: Handle HTTP layer, call services, return responses. Use JSDoc comments for API documentation.
- **Services**: Contain business logic, interact with models. Organized in domain folders (auth/, exercise/, program/, user/).
- **Models**: Mongoose schemas with validation, indexes, pre-save hooks, instance/static methods.
- **Routes**: Define endpoints, map to controllers. Named as `*.routes.js`.
- **Middleware**:
  - `auth.js` - JWT token verification
  - `authorize.js` - Role-based access control
  - `ownership.js` - Resource ownership validation
  - `errorHandler.js` - Centralized error handling
- **Error Handling**: Use `next(error)` in async functions, errors caught by errorHandler middleware.
- **Module System**: CommonJS (`require`/`module.exports`)

## Client Architecture (`/client`)

Standard Vite + React setup:

```
client/
├── src/
│   ├── assets/      # Static assets
│   ├── App.jsx      # Root component
│   ├── main.jsx     # Application entry
│   └── *.css        # Styles
├── public/          # Public static files
└── index.html       # HTML template
```

### Conventions

- **Module System**: ES modules (`import`/`export`)
- **Components**: `.jsx` extension for React components
- **Styling**: CSS files co-located with components

## API Structure

RESTful endpoints under `/api`:

- `/api/auth` - Authentication (register, login)
- `/api/user` - User management
- `/api/v1/templates` - Program templates
- `/api/v1/programs` - User programs
