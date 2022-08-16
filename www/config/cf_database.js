"use strict";

module.exports = {
    development: {
        _mongod_name: process.env.MONGO_DB      || 'booking',
        _mongod_user: process.env.MONGO_USER    || '',
        _mongodb_pass: process.env.MONGO_PWD    || '',
        _mongodb_host: process.env.MONGO_HOST   || 'localhost',
        _mongodb_port: process.env.MONGO_PORT   || '27017'
    },

    product: {
        _mongod_name: process.env.MONGO_DB      || 'booking-be',
        _mongod_user: process.env.MONGO_USER    || 'quocvy152',
        _mongodb_pass: process.env.MONGO_PWD    || 'anh0205vy1502',
        _mongodb_host: process.env.MONGO_HOST   || 'localhost',
        _mongodb_port: process.env.MONGO_PORT   || '27017'
    }
};
