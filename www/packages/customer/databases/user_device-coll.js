"use strict";
const Schema 	= require('mongoose');
const BASE_COLL = require('../../../database/intalize/base-coll');

/**
 * COLLECTION USER-DEVICE CỦA HỆ THỐNG
 */
module.exports = BASE_COLL('user_device', {
	customer: {
		type: Schema.Types.ObjectId,
		ref: 'customer'
	},
	deviceName      : { type: String },
	deviceID        : { type: String },
	registrationID  : { type: String },
});