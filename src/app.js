const RatesTicker = require('./rates.ticker');
    
let ratesTicker = new RatesTicker();
ratesTicker.start();

// Setup handlers for graceful shutdown
process
  .on('SIGTERM', ratesTicker.shutdown('SIGTERM'))
  .on('SIGINT', ratesTicker.shutdown('SIGINT'))
  .on('uncaughtException', ratesTicker.shutdown('uncaughtException'));