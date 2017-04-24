# bitcoin-rates
Simple console ticker for Bitcoin and EUR/USD.
There are 2 sources for BTC>EUR rates and 2 sources for currency exchange.

**Bitcoin rate feeds**
* [Coindesk](http://api.coindesk.com/v1/bpi/currentprice/EUR.json)
* [Cryptonator](https://api.cryptonator.com/api/full/btc-eur)

**Currency rate feeds**
* [Fixer](http://api.fixer.io/latest?symbols=USD)
* [Floatrates](http://www.floatrates.com/daily/eur.json)

## Requirements
* Node.js 6.9.x+

## Setup
* npm install
* npm start
