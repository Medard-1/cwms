'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const runAutoAlerts = require('./autoAlert');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Redirect root to login page
app.get('/', (req, res) => {
  res.redirect('/html/index.html');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/children', require('./routes/childRoutes'));
app.use('/api/cases', require('./routes/caseRoutes'));
app.use('/api/health', require('./routes/healthRoutes'));
app.use('/api/education', require('./routes/educationRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`CWMS server running on http://localhost:${PORT}`);
  runAutoAlerts();
});
