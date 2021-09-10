const express = require('express')
const swaggerJSDoc = require('swagger-jsdoc');  
const swaggerUI = require('swagger-ui-express');  
const treasuryRouter = require('./routes/treasuryRouter')
const globalErrorHandler = require('./controllers/errorController');
const path = require('path')

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true}));


//Swagger Configuration  
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
        servers: [
            {
              url: 'http://localhost:3001',
              description: 'Development server',
            },
        ],
        
    },
    apis:[path.join(__dirname,'./routes/**.js')],
    
}  

const swaggerDocs = swaggerJSDoc(swaggerOptions);  
app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDocs)); 

app.use('/api/v1/treasury', treasuryRouter);

//Express error handler
app.use(globalErrorHandler);

module.exports = app;