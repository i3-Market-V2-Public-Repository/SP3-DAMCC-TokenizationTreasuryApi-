const catchAsync = require('../utils/catchAsync');
const treasuryContract = require('../services/TreasuryContractService').getInstance()


exports.getTransactionReceipt = catchAsync(async (req, res, next) => {
    const hash = req.params.transactionHash
    const receipt = await treasuryContract.getTransactionReceipt(hash)
    if (receipt){
        return res.json({receipt})
    }
    return res.status(404).json()
})

exports.getMarketPlaceIndex = catchAsync(async (req, res, next) => {
    const address = req.params.address
    const index = await treasuryContract.getMarketPlaceIndex(address)
    return res.json({index})
})

exports.getAddressBalance = catchAsync(async (req, res, next) => {
    const address = req.params.address
    const balance = await treasuryContract.getBalanceForAddress(address)
    return res.json({balance})
})

exports.addMarketPlace = catchAsync(async (req, res, next) => {

    const {senderAddress, marketplaceAddress} = req.body

    if (!senderAddress || !marketplaceAddress) {
        return res.status(400).json({
            message: 'You must provide senderAddress and marketplaceAddress'
        })
    }

    const transactionHash = await treasuryContract.addMarketPlace(senderAddress, marketplaceAddress)
    return res.json({transactionHash})
})

exports.exchangeIn = catchAsync(async (req, res, next) => {
    const {senderAddress, userAddress, tokens} = req.body

    if (!senderAddress || !userAddress || !tokens) {
        return res.status(400).json({
            message: 'You must provide senderAddress, userAddress and tokens amount'
        })
    }

    const transactionHash = await treasuryContract.exchangeIn(senderAddress, userAddress, tokens)
    return res.json({transactionHash})
})

exports.exchangeOut = catchAsync(async (req, res, next) => {
    const {senderAddress, marketplaceAddress} = req.body

    if (!senderAddress || !marketplaceAddress) {
        return res.status(400).json({
            message: 'You must provide senderAddress and marketplaceAddress'
        })
    }

    const transactionHash = await treasuryContract.exchangeOut(senderAddress, marketplaceAddress)
    return res.json({transactionHash})
})

exports.payment = catchAsync(async (req, res, next) => {
    const {senderAddress, providerAddress, amount} = req.body

    if (!senderAddress || !providerAddress || !amount) {
        return res.status(400).json({
            message: 'You must provide senderAddress, providerAddress and amount'
        })
    }

    const transactionHash = await treasuryContract.payment(senderAddress, providerAddress, amount)
    return res.json({transactionHash})

})

exports.clearing = catchAsync(async (req, res, next) => {
    const {senderAddress} = req.body

    if (!senderAddress) {
        return res.status(400).json({
            message: 'You must provide senderAddress'
        })
    }

    const transactionHash = await treasuryContract.clearing(senderAddress)
    return res.json({transactionHash})

})

