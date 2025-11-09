# Tech Stack

## Backend

- **Runtime**: Node.js with CommonJS modules
- **Framework**: Express 5.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) with bcryptjs for password hashing
- **Validation**: express-validator
- **Environment**: dotenv for configuration

## Frontend

- **Framework**: React 19.x
- **Build Tool**: Vite 7.x
- **Module System**: ES modules
- **Linting**: ESLint with React hooks and refresh plugins

## Common Commands

### Server

```bash
cd server
npm start          # Production mode
npm run dev        # Development with nodemon
```

### Client

```bash
cd client
npm run dev        # Development server
npm run build      # Production build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## Environment Variables

Server requires `.env` file with:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `PORT` - Server port (defaults to 5000)
