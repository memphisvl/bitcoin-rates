const request = require('request');

class FloatratesConsumer {
    constructor() {
        this.endpoint = 'http://www.floatrates.com/daily/eur.json';
        this.feed = 'Floatrates';
        this.pid = process.pid;
        this.cache = {};
    }

    start() {
        this.fetchData();

        setInterval(() => {
            this.fetchData();
        }, 60000); //every 1 min
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
                console.log('FloatratesConsumer error fetching rate: ', err);
            }

            try {
                this.cache = {usd: +body.usd.rate, feed: this.feed}
            } catch (ex) {
                console.log('FloatratesConsumer format exception: ', err);
            } finally {
                cb(this.cache);
            }
        })
    }
}

var floatratesConsumer = new FloatratesConsumer();
floatratesConsumer.start();

process.on('disconnect', () => {
    process.kill(floatratesConsumer.pid);
})