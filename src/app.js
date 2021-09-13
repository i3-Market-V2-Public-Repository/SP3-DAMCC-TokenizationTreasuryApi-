const express = require('express')
const swaggerUI = require('swagger-ui-express');
const treasuryRouter = require('./routes/treasuryRouter')
const globalErrorHandler = require('./controllers/errorController');
const swaggerDocs = require('./swagger.config')
const app = express()

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use('/api/v1/treasury', treasuryRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//Express error handler
app.use(globalErrorHandler);

module.exports = app;