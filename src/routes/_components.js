/**
 * @swagger
 *   components:
 *     schemas:
 *       TransactionObject:
 *         type: object
 *         required:
 *           - chainId
 *           - nonce
 *           - gasLimit
 *           - gasPrice
 *           - to
 *           - from
 *           - data
 *         properties:
 *           chainId:
 *             type: Number
 *             description: id of the chain where the transaction will be send.
 *             example: 1
 *           nonce:
 *             type: Number
 *             description: nonce of the transaction
 *             example: 1
 *           gasLimit:
 *             type: Number
 *             description: maximum gas to spend on the transaction.
 *             example: 6721975
 *           gasPrice:
 *             type: Number
 *             description: price in gwei willing to pay for the gas.
 *             example: 120
 *           to:
 *             type: string
 *             description: receiver of the transaction.
 *             example: '0x5780262041318FD9fc8E345F665bEc7684E15C75'
 *           from:
 *             type: string
 *             description: sender of the transaction.
 *             example: '0xb3a0ED21c54196E4B446D79b7925766aa86BC196'
 *           data:
 *             type: string
 *             description: the transaction parameter values.
 *             example: '0x909770870000000000000000000000000000000000000000000000000000000000000060000000000000000000000000f3d15f97bf1b55b486486de2d819649bc92fff6b000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000002438646265373434372d333637362d353262632d623439312d30393638653735626134663400000000000000000000000000000000000000000000000000000000'
 *       Operation:
 *         type: object
 *         required:
 *           - transferId
 *           - type
 *           - status
 *           - user
 *           - date
 *         properties:
 *           transferId:
 *             type: string
 *             format: uuid
 *             description: auto-generated id of the transfer.
 *           type:
 *             type: string
 *             enum: [exchange_in, exchange_out, clearing]
 *           status:
 *             type: string
 *             enum: [open, closed, in_progress]
 *           user:
 *             type: string
 *             example: '0xb794f5ea0ba39494ce839613fffba74279579268'
 *             description: user address.
 *           date:
 *             type: string
 *             format: date-time
 *       Pay:
 *         type: object
 *         required:
 *           - senderAddress
 *           - transferId
 *           - transferCode
 *         properties:
 *           senderAddress:
 *             type: string
 *             example: '0xb794f5ea0ba39494ce839613fffba74279579268'
 *             description: sender address.
 *           transferId:
 *             type: string
 *             format: uuid
 *             description: auto-generated id of the transfer.
 *           transferCode:
 *             type: string
 *             example: 'ES2703926222'
 *             description: bank transfer id
 *       FeePay:
 *         type: object
 *         required:
 *           - senderAddress
 *           - MarketplaceAddress
 *           - feeAmount
 *         properties:
 *           senderAddress:
 *             type: string
 *             example: '0xb794f5ea0ba39494ce839613fffba74279579268'
 *             description: sender address.
 *           MarketplaceAddress:
 *             type: string
 *             example: '0x111122220ba39494ce839613fffba74279571234'
 *             description: Data provider marketplace Address.
 *           feeAmount:
 *             type: Number
 *             example: 42
 *             description: Amount of fee tokens.
 *       Error:
 *         type: object
 *         required:
 *           - status
 *           - message
 *         properties:
 *           status:
 *             type: string
 *             example: error
 *           message:
 *             type: string
 *             example: Invalid address
 */