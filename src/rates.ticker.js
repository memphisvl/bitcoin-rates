const   fork    = require('child_process').fork,
        path    = require('path'),
        numCPUs = require('os').cpus().length,
        colors  = require('colors/safe');

module.exports = class RatesTicker {
    
    constructor() {
        this.btcFeeds = [
            './consumers/coindesk.consumer.js',
            './consumers/cryptonator.consumer.js'
        ];

        this.currencyFeeds = [
            './consumers/fixer.consumer.js',
            './consumers/floatrates.consumer.js'
        ];        
        
        this.currencyRates = [];
        this.btcRates = [];

        this.workers = [];
    }

    start() {
        process.stdout.write('\x1Bc');
        console.log(colors.green('Starting up...'));
        
        this._getBitcoinRates();
        this._getCurrencyRate();        
        this.printRates(3); // Print rates every 3 seconds
    }

    shutdown(signal) {
        return (err) => {        
            console.log(colors.red(`\nShutting down due to: ${signal}`));
            if (err) {
                console.log(colors.red('Got error:', err));
            }

            this.workers.forEach(worker => {
                console.log('Shutting down worker: '+ worker.pid);
                worker.disconnect();
            });
            process.exit(err ? 1 : 0);
        }
    }

    // Will print BTC and currency rates every given period in seconds
    printRates(updateInSec) {
        setInterval(() => {
            process.stdout.write('\x1Bc');
            console.log(colors.green('[ Bitcoin / Eur feeds ]'));
            this.btcRates.forEach(btc => {
                console.log(`EUR/BTC ${btc.feed}: ${btc.eur}`);
            });

            console.log(colors.cyan('\n[ EUR / USD exch rates ]'));
            this.currencyRates.forEach(currency => {
                console.log(`EUR/BTC ${currency.feed}: ${currency.usd}`);
            });

        }, updateInSec * 1000)
    }

    _getBitcoinRates() {
        this.btcFeeds.forEach(feed => {
            let child = fork(path.join(__dirname, feed));
            child.on('message', (rate) => {                

                if (this.btcRates.length < this.btcFeeds.length) {
                    this.btcRates.push(rate);
                } else {
                    let itemIndex = this.btcRates.findIndex((item => item.feed == rate.feed));
                    this.btcRates[itemIndex] = rate;
                }
            });
            this.workers.push(child);
        })
    }

    _getCurrencyRate() {
        this.currencyFeeds.forEach(feed => {
            let child = fork(path.join(__dirname, feed));
            child.on('message', (rate) => {                

                if (this.currencyRates.length < this.currencyFeeds.length) {
                    this.currencyRates.push(rate);
                } else {
                    let itemIndex = this.currencyRates.findIndex((item => item.feed == rate.feed));
                    this.currencyRates[itemIndex] = rate;
                }
            });
            this.workers.push(child);
        })        
    }
}