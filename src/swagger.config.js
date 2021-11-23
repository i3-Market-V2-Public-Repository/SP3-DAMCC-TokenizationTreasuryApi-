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

const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title:'i3Treasury API',
            version:'1.0.0',
            license: {
                name: 'Licensed Under MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
        },
    },
    apis:[path.join(__dirname,'./routes/**.js')],
}

module.exports = swaggerJSDoc(swaggerOptions);