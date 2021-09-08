require('dotenv').config()
const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

// async function start(){
//     // const result = treasuryService.addMarketPlace('0x12dafe7dc4296F43229105F0e112e85B67D8D248', '0x12dafe7dc4296F43229105F0e112e85B67D8D248')
//     //     .then(console.log)
//     //     .catch(console.log)
//     // // console.log('start',result)
//
//
//     // await treasuryService.exchangeIn('0x12dafe7dc4296F43229105F0e112e85B67D8D248','0x846Ef94dA0733abB78859CFB3F6c1b98e44F57EA',500)
//     const res = await treasuryService.getBalanceForAddress('0x902fec69604df6a367e9d5118b33a09d28e96435a4d802bbfad83b5460a27e5f')
//     console.log(res)
// }
//
// start()
//
// // web3.eth.net.isListening()
// //     .then(async (status) => {
// //         console.log("Connection status: ", status)
//
//
//
// // addMarketPlace('0x2302508862648Fcf5d0C683db106242E9E9634DD', '0x6133413B1efB63100E22b3cE50481037Fa75bB52')
// //
// // exchangeIn('0x2302508862648Fcf5d0C683db106242E9E9634DD', '0x846Ef94dA0733abB78859CFB3F6c1b98e44F57EA', 2000000)
//
// // const contract = await getContract();
// //
// // contract.events.TokenTransferred({}, function (error, event) {
// //     console.log('transered',event);
// //    })
// //     .on('data', function (event) {
// //         console.log('event_data', event); // same results as the optional callback above
// //     })
// //     .on('changed', function (event) {
// //         console.log('changed', event)
// //     })
// //     .on('error', console.error);
//
// // app.listen(process.env.PORT || 3000, () => {
// //     console.log(`Example app listening`)
// // })
// // });