/**
* Copyright (c) 2020-2022 in alphabetical order:
* GFT, Telesto Technologies
*
* This program and the accompanying materials are made
* available under the terms of the MIT
* which is available at https://gitlab.com/i3-market/code/wp3/t3.3/nodejs-tokenization-treasury-api/-/blob/master/LICENCE.md
*
* License-Identifier: MIT
*
* Contributors:
*    Vangelis Giannakosian (Telesto Technologies)
*    Dimitris Kokolakis (Telesto Technologies)
*
*/

require('dotenv').config()
const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
