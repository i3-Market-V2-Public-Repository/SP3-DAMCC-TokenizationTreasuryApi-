# Tokenization Treasury API
[![License: EUPL-1.2](https://img.shields.io/badge/license-EUPL--1.2-blue.svg)](LICENCE.md)

The tokenization module is responsible for the deployment of a transaction to Besu blockchain using the i3Treasury API and the i3market Wallet. To deploy a transaction to the blockchain there is the [deploy-transaction-endpoint](http://localhost:3001/api-docs/#/TokenizerController/post_api_v1_treasury_transactions_deploy_signed_transaction). This subsytem is part of the Backplane API which comprise all the public endpoints of the i3Market.

## Getting stated / Use

To use the tokenization subsystem and deploy a transaction to Besu you need to follow the next step:
1. Use the [/treasury/marketplaces](http://localhost:3001/api-docs/#/TokenizerController/post_api_v1_treasury_marketplaces) to register a marketplace. In the "senderAddress" and "marketplaceAddress" provide the same address of the marketplace you want to register.
2. Use the [/transactions/exchange-in](http://localhost:3001/api-docs/#/TokenizerController/post_api_v1_treasury_transactions_exchange_in). The request body should have a "senderAddress" which should be a registered markeplace, a "userAddress" and the tokens that you want to exchange.
3. To deploy the transaction to Besu you need to first sign it via i3Market Wallet. After sing and receive the Signature use the [/transactions/deploy-transaction-transaction](http://localhost:3001/api-docs/#/TokenizerController/post_api_v1_treasury_transactions_deploy_signed_transaction) to deploy it. If successful you can check the deployed transaction here [Ethereum Lite Explorer](http://95.211.3.244:8547/)

## How to build, install, or deploy it

### Requirements
NodeJS\
npm\
Git\
Docker

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
