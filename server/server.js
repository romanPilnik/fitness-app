const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const exerciseRoutes = require('./routes/exercise.routes');
const exerciseProfileRoutes = require('./routes/exerciseProfile.routes');
const templateRoutes = require('./routes/template.routes');
const programRoutes = require('./routes/program.routes');
const sessionRoutes = require('./routes/session.routes');

const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/profile/exercises', exerciseProfileRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/programs', programRoutes);
app.use('/api/v1/session', sessionRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error', err));

app.get('/', (req, res) => {
  res.json({
    message: 'Api is working',
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
