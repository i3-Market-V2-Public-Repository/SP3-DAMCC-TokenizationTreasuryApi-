/*
 * Copyright (c) 2020-2022 in alphabetical order:
 * GFT, HOPU, Telesto Technologies
 *
 * This program and the accompanying materials are made
 * available under the terms of the EUROPEAN UNION PUBLIC LICENCE v. 1.2
 * which is available at https://gitlab.com/i3-market/code/wp3/t3.3/nodejs-tokenization-treasury-api/-/blob/master/LICENCE.md
 *
 *  License-Identifier: EUPL-1.2
 *
 *  Contributors:
 *    Vangelis Giannakosian (Telesto Technologies)
 *    Dimitris Kokolakis (Telesto Technologies)
 *    George Benos (Telesto Technologies)
 *    Germán Molina (HOPU)
 *
 */

const express = require('express');
const swaggerUI = require('swagger-ui-express');
const treasuryRouter = require('./routes/treasuryRouter');
const paymentRouter = require('./routes/paymentRouter');
const globalErrorHandler = require('./controllers/errorController');
const swaggerDocs = require('./swagger.config');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api/v1/treasury', treasuryRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//Express error handler
app.use(globalErrorHandler);

module.exports = app;