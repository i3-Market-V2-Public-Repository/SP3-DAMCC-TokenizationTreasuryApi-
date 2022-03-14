#!/bin/bash

SCRIPTPATH=$(cd -- "$(dirname "$0")" > /dev/null 2>&1 ; pwd -P ) || exit
echo "Removing previous contracts"
rm -rf "$SCRIPTPATH"/../contracts_tmp

echo "Cloning repository"
git clone git@gitlab.com:i3-market/code/wp3/t3.3/tokenization.git "$SCRIPTPATH"/../contracts_tmp
cd "$SCRIPTPATH"/../contracts_tmp/contracts || exit; truffle compile
cp "$SCRIPTPATH"/../contracts_tmp/build/contracts/I3MarketTreasury.json "$SCRIPTPATH"/../contracts/treasury/I3MarketTreasury.json
rm -rf "$SCRIPTPATH"/../contracts_tmp