"use strict";

const Schema 	= require('mongoose');
const BASE_COLL = require('../../../database/intalize/base-coll');

/**
 * COLLECTION USER CỦA HỆ THỐNG
 */
module.exports = BASE_COLL('characteristic', {
	value: {
		type: String,
		trim: true
	},
	icon: {
		type: String,
		trim: true
	},
	characteristicType: {
		type: Schema.Types.ObjectId,
		ref: 'characteristic_type'
	}
});
