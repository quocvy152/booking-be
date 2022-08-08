"use strict";
const Schema        = require('mongoose').Schema;
const BASE_COLL     = require('../../../database/intalize/base-coll');

/**
 * COLLECTION IMAGE CỦA HỆ THỐNG
 */
module.exports = BASE_COLL('image', {
	name: {
		type: String,
	},
	// Chỉ lưu ldk-software.nandio/root/00b251a6-9d3c-462b-8b75-0ae2c5f05462.jpg
	path: {
		type: String,
	},
	size: {
		type: String,
	},
	userCreate: {
		type: Schema.Types.ObjectId,
		ref: 'user'
	},
	
	//Sắp xếp
    order: {
        type: Number,
		default: 1
    },
	
	//Loại CTA
	//1: Phân khúc
	//2: Thương hiệu
	typeCTA: {
        type: Number,
    },

	//Loại CTA
	valueCTA: {
        type: String,
    },
});
