const request = require('request');

class CryptonatorConsumer {
    constructor() {
        this.endpoint = 'https://api.cryptonator.com/api/full/btc-eur';
        this.feed = 'Cryptonator';
        this.pid = process.pid;
        this.cache = {};
    }

    start() {
        this.fetchData();

        setInterval(() => {
            this.fetchData();
        }, 30000); // every 30 sec.
    }

    fetchData() {
        this._fetchRate(rate => {
            this._sendMessage(rate);
        }) 
    }

    _sendMessage(message) {
        let uptime = process.uptime();
        process.send(message);
    }    

    _fetchRate(cb) {
        request({ url: this.endpoint, json: true }, (err, res, body) => {
            if (err || res.statusCode != 200) {
                console.log('CryptonatorConsumer error fetching rate: ', err);
            }

            try {
                this.cache = {eur: +body.ticker.price, feed: this.feed};
            } catch (ex) {
                console.log('CryptonatorConsumer format exception: ', err);
            } finally {
                cb(this.cache);
            }
        })
    }
}

var cryptonatorConsumer = new CryptonatorConsumer();
cryptonatorConsumer.start();

process.on('disconnect', () => {
    process.kill(cryptonatorConsumer.pid);
})