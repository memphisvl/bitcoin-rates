const request = require('request');

class FixerConsumer {
    constructor() {
        this.endpoint = 'http://api.fixer.io/latest?symbols=USD';
        this.feed = 'Fixer';
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
                console.log('FixerConsumer error fetching rate: ', err);
            }

            try {
                this.cache = {usd: +body.rates.USD, feed: this.feed}
            } catch (ex) {
                console.log('FixerConsumer format exception: ', err);
            } finally {
                cb(this.cache);
            }
        })
    }
}

var fixerConsumer = new FixerConsumer();
fixerConsumer.start();

process.on('disconnect', () => {
    process.kill(fixerConsumer.pid);
})