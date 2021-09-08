const express = require('express')
const app = express()
const treasuryRouter = require('./routes/treasuryRouter')
const globalErrorHandler = require('./controllers/errorController');

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use('/api/v1/treasury', treasuryRouter);

//Express error handler
app.use(globalErrorHandler);

module.exports = app;