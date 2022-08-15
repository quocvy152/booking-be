"use strict";

const hostProduct = require('./cf_mode').host_product;

/**
 * [HOST-PORT PRODUCT]
 */
exports.host_product = '0.0.0.0';
exports.port_product = process.env.PORT || '5001';

/**
 * [HOST-PORT DEVELOPMENT]
 */
exports.host_dev = '0.0.0.0';
exports.port_dev = '5001';

/**
 * [HOST ROUTER]
 */
exports.host = (!hostProduct) ? this.host_dev : this.host_product;
exports.port = (!hostProduct) ? this.port_dev : this.port_product;
exports.domain = (!hostProduct) ? 'http://' + this.host_dev + ':' + this.port_dev + '/' : '';
