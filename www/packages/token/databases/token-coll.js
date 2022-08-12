"use strict";
const Schema 	= require('mongoose');
const BASE_COLL = require('../../../database/intalize/base-coll');

/**
 * COLLECTION TOKEN CỦA HỆ THỐNG
 */
module.exports = BASE_COLL('token', {
	userID: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	token: { 
		type: String 
	},
	expireAt: {
		type: Date
	}
});