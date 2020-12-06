const mongoose = require('mongoose');
const util = require('util');
const debug = require('debug')('express-mongoose-es6-rest-api:index');

const config = require('./config');

// connect to mongo db
const mongoUri = 'mongodb://' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.dbname +
    (config.mongooseDebug ? '' : '?ssl=true&replicaSet=globaldb');
mongoose.connect(mongoUri, {
        auth: config.mongo.user ? {
            user: config.mongo.user,
            password: config.mongo.password
        } : undefined,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: false
    })
    .then(() => console.log('Connection to DB successful'))
    .catch((err) => console.error(err));

// print mongoose logs in dev env
if (config.mongooseDebug) {
    mongoose.set('debug', (collectionName, method, query, doc) => {
        debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
    });
}
