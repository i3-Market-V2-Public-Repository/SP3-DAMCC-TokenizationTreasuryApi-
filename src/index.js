/**
* Copyright (c) 2020-2022 in alphabetical order:
* GFT, Telesto Technologies
*
* This program and the accompanying materials are made
* available under the terms of the MIT,Apache License 2.0,ISC
* which is available at https://github.com/panva/jose/blob/main/LICENSE.md
*
* License-Identifier: EUPL-2.0
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
