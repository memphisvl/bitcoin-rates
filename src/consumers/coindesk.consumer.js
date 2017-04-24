const request = require('request');

class CoindeskConsumer {
    constructor() {
        this.endpoint = 'http://api.coindesk.com/v1/bpi/currentprice/EUR.json';
        this.feed = 'Coindesk';
        this.pid = process.pid;
        this.cache = {};
    }

    start() {
        this.fetchData();

        setInterval(() => {
            this.fetchData();             
        }, 60000); // every 1 min  
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
                console.log('CoindeskConsumer error fetching rate: ', err);
            }

            try {
                this.cache = {eur: +body.bpi.EUR.rate_float, feed: this.feed};
            } catch (ex) {
                console.log('CoindeskConsumer format exception: ', err);
            } finally {
                cb(this.cache);
            }
        })
    }
}

var coindeskConsumer = new CoindeskConsumer();
coindeskConsumer.start();

process.on('disconnect', () => {
    process.kill(coindeskConsumer.pid);
})