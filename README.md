# Tokenization Treasury API
[![License: EUPL-1.2](https://img.shields.io/badge/license-EUPL--1.2-blue.svg)](LICENCE.md)

The tokenization module is responsible for the deployment of a transaction to Besu blockchain using the i3Treasury API and the i3market Wallet. To deploy a transaction to the blockchain there is the [deploy-transaction-endpoint](http://localhost:3001/api-docs/#/TokenizerController/post_api_v1_treasury_transactions_deploy_signed_transaction). This subsytem is part of the Backplane API which comprise all the public endpoints of the i3Market.

## Getting stated / Use
The main purpose of the tokenization service is to allow i3Market actors (i.e Marketplace, Data Provider, Data Consumer) to call the I3Market trasury contract methods and interact with the token flow. In the use case presented below, we impersonate a Marketplace that wants to register on the I3M platform and wants to send some tokens to a data consumer.
1. The first step is to add the new marketplace using the endpoint [/treasury/marketplaces](http://localhost:3001/api-docs/#/TokenizerController/post_api_v1_treasury_marketplaces). In the "senderAddress" and "marketplaceAddress" provide the same address of the marketplace you want to register. After a successful transaction the payload of the response will be a transaction object like:
```
{
  "transactionObject": {
    "chainId": "1",
    "nonce": 0,
    "gasLimit": 12500000,
    "gasPrice": 78893,
    "to": "SOME CONTRACT ADDRESS",
    "from": "THE MARKETPLACE ADDRESS",
    "data": "0x71771330000000000000000000000000b7e8a4f72b4b1bb6c0f83f8cb841bdbf4e0c7a94"
  }
}
```
2. The next step is to deploy the obtained transaction. To do that you firstly need to sign the transaction using the i3-market Wallet. Once you get the signed raw transaction you can call the deployment endpoint of the tokenization service [/transactions/deploy-transaction-transaction](http://localhost:3001/api-docs/#/TokenizerController/post_api_v1_treasury_transactions_deploy_signed_transaction). The response of the request should be a long transaction object with information about the transaction. Completed successfully the operation the **new marketplace is added**.
3. Now the Marketplace can exchange tokens for fiat money with a Data Consumer. More specifically, it has to call the exchange-in method once it get the fiat money from the user. 
In the [/transactions/exchange-in](http://localhost:3001/api-docs/#/TokenizerController/post_api_v1_treasury_transactions_exchange_in) API request body you need to specify the ```senderAddress``` which should be the registered markeplace, a ```dataConsumer``` and the ```tokens``` that you want to exchange. The successful response is again a transaction object.
4. To deploy this transaction to Besu and complete the exchange you must follow again **step 2**.
5. If you want to check if the transaction was completed you can also check the balance of the address you have used. The [/balances/{address}](http://localhost:3001/api-docs/#/TokenizerController/get_api_v1_treasury_balances__address_) endpoint should return the new balance after the exchange.

## How to build, install, or deploy it

### Requirements
NodeJS\
npm\
Git\
Docker

### Webhook
Simply put, a webhook is an API endpoint that an outside service calls when an event occurs. The webhook in the tokenization service is used for listening transaction events and return the payload.\
In the ```.env.example``` file there is an example of how to configure the WEBHOOK variable in order to use it in your ```.env file```.
To use a webhook create a nodeJS app and create an endpoint like ```/api/webhook```.\
**Example code**:
```
app.post('/api/webhook',function(req,res){
    console.log(req.body)
    res.send('hi')
})
```

### Run with npm
Clone the project\
Configure the .env file\
```npm install```\
```npm start```
### Run with docker
```bash
$ docker build -t i3-treasury .
$ docker run --name treasury -p 3001:3001 -e ETH_HOST='{EthereumChainWebsocketHost}' -e CONTRACT_ADDRESS='{CONTRACT_ADDRESS}' -e WEBHOOK='{WEBHOOK}' -e PORT=3001 i3-treasury
```


The OAS documentation can be accessed [here](http://localhost:3001/api-docs/)

## Credits

Luca Marangoni Luca.Marangoni@gft.com\
Vangelis Giannakosian vangelis@telesto.gr\
Dimitris Kokolakis dkokolakis@telesto.gr

## Contributing

Pull requests are always appreciated.
