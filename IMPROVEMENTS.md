### Improve the token flow managment in the Tokenizer: 

Create a Database with one table:
| TRANSFERID   | OPERATION   | STATUS   | USER   | DATE   |
|---|---|---|---|---|


## EXCHANGE IN

1. Data Consumer ask exchange in from a Marketplace; 
2. Marketplace should accept the request and receive the fiat money;
3. Marketplace should perform an exchange\_in operation through the Tokenzier api:
	- the Tokenizer call the smart contract exchange\_in passing the requested tokens;
	- the Tokenizer save in the database the operations

| TRANSFERID   | OPERATION   | STATUS   | USER   | DATE   |
|---|---|---|---|---|
| 1111 | exchangeIn | open | dataConsumerAddress | date  |

4. Tokenizer should wait for the blockchain successful EVENT and update the operation as closed;

| TRANSFERID   | OPERATION   | STATUS   | USER   | DATE   |
|---|---|---|---|---|
| 1111 | exchangeIn | closed| dataConsumerAddress | date  |

5. A TokenTransfer object is saved in the smart contract with the information about the transfer and with TRANSFERID as key; 


## EXCHANGE OUT

>  FUTURE IMPROVMENTS:
>  1. Data provider request through his wallet an exchange out to an I3M Marketplace;
> 2. the Marketplace Tokenizer once received the exchange out EVENT from the blockchain saves the exchange out request in its database;
1. Data provider ask exchange out to a Marketplace of the network and call the exchange out method of the Tokenizer, the Tokenizer save the operation in the local database; 

| TRANSFERID   | OPERATION   | STATUS   | USER   | DATE   |
|---|---|---|---|---|
| 1111 | exchangeOut | open| dataProviderAdr | date  |

3. A TokenTransfer object is saved in the smart contract with the information about the token transfer and with TRANSFERID as key;

4. In the moment that the tokenizer receives the successful EVENT frothe blockchain, he knows that the transfer is succeded and thMarketplace has received the data provider tokens, so accordingly it updates the operation in the database:

| TRANSFERID   | OPERATION   | STATUS   | USER   | DATE   |
|---|---|---|---|---|
| 1111 | exchangeOut | inprogress| dataProviderAdr | date  |

5. the Marketplace now can pay back the token he created and then ask the clearing for all the tokens that are not its own; ----

6. Marketplace should get the list of the inprogress exchange out operations from the database, and pay back the data providers;

7. As soon a data provider has been paid with the fiat money, the Marketplace should call the Tokenizer api that adds the transferCode of the fiat money tranfer in the TokenTransfer object and set the exchange out operation in the database as closed;

| TRANSFERID   | OPERATION   | STATUS   | USER   | DATE   |
|---|---|---|---|---|
| 1111 | exchangeOut | closed | dataProviderAdr | date  |

## CLEARING


1. A Marketplace clear all the token in its balance that belong to other marketplaces calling the clearing api on the Tokenizer;

2. The tokenizer call the clearing method on the smartcontract and transfer all the tokens to the relative marketplaces, the Tokenizer save for each operation an entry in the database

*Marketplace1 DB:*
| TRANSFERID   | OPERATION   | STATUS   | USER   | DATE   |
|---|---|---|---|---|
| 1111 | clearingOut | open | marketplace2Adr | date  |
| 2222 | clearingOut | open | marketplace3Adr | date  |
| 3333 | clearingOut | open | marketplace4Adr | date  |

3. As the Tokenizer of another marketplace receive the EVENT of a requested exchange out, the operation "clearingIn" is saved in the database

*Marketplace2 DB:*
| TRANSFERID   | OPERATION   | STATUS   | USER   | DATE   |
|---|---|---|---|---|
| 1122 | clearingIn | open | marketplace1Adr | date  |

4. When a Marketplace owner of the tokens pay with fiat money the tokens received, he has to call its Tokenizer api (setPaid) which save the transferCode in the relative TokenTransfer object and update the clearingIn operation in the database as closed.

*Marketplace2 DB:*
| TRANSFERID   | OPERATION   | STATUS   | USER   | DATE   |
|---|---|---|---|---|
| 1122 | clearingIn | closed| marketplace1Adr | date  |

5. The tokenizer of the marketplace that requested the clearing, should listen for the clearingIn EVENT and once received successfully can update the operation in the database to closed;

*Marketplace1 DB:*
| TRANSFERID   | OPERATION   | STATUS   | USER   | DATE   |
|---|---|---|---|---|
| 1111 | clearingOut | closed| marketplace2Adr | date  |
| 2222 | clearingOut | open | marketplace3Adr | date  |
| 3333 | clearingOut | open | marketplace4Adr | date  |

6. The Marketplace must now have received the money from the marketplace to which the clearing was requested and can check the transfer status of the fiat money with the TransferCode field in the TokenTransfer object;


## TODO: 
	 - Add api in Tokenizer service to get operation by TRANSFERID 
	 - Add api in Tokenizer service to get list of operations by type, status, date and user
	 - Add blockain events management in the Tokenizer
	 - Add database and operation flow management
