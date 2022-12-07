"use strict";

/**
 * EXTERNAL PACKAGE
 */
const ObjectID                      = require('mongoose').Types.ObjectId;
const jwt                           = require('jsonwebtoken');
const { hash, hashSync, compare }   = require('bcryptjs');
const moment                        = require('moment');
const { sendMailChangeEmail } = require('../../../mailer/module/mail_user');

/**
 * INTERNAL PACKAGE
 */
const cfJWS                        	= require('../../../config/cf_jws');
const { checkEmail, loadPathImage } = require('../../../utils/utils');
const { validPhone } 				= require('../../../utils/number_utils');
const { 
	validEmail, 
	randomNumbers 
} = require('../../../utils/string_utils');

/**
 * BASE
 */
const BaseModel 					= require('../../../models/intalize/base_model');
const IMAGE_MODEL				    = require('../../image').MODEL;
const USER_MODEL				    = require('../../users/models/user').MODEL;
const CAR_CHARACTERISTIC_MODEL      = require('../../characteristic/models/car_characteristic').MODEL;

/**
 * COLLECTIONS, MODELS
 */
const BOOKING_COLL  				= require('../databases/booking-coll');
const BOOKING_RATING_COLL  			= require('../databases/booking_rating-coll');
const CAR_COLL                      = require('../../car/databases/car-coll');

class Model extends BaseModel {
    constructor() {
        super(BOOKING_RATING_COLL);
		this.STATUS_INACTIVE        = 2; // Không hoạt động
        this.STATUS_ACTIVE          = 1; // Hoạt động
    }

    /**
     * TẠO ĐÁNH GIÁ
     */
	insert({ carID, customerID, bookingID, rating, ratingText }) {
        return new Promise(async resolve => {
            try {
				if(!ObjectID.isValid(carID) || !ObjectID.isValid(bookingID) || !ObjectID.isValid(customerID))
					return resolve({ error: true, message: 'Tham số không hợp lệ. ID không hợp lệ' });

                // if([this.STATUS_ACTIVE, this.STATUS_INACTIVE].includes(+status)) 
				// 	return resolve({ error: true, message: 'Tham số không hợp lệ. Trạng thái không hợp lệ' });

                if(!rating)
					return resolve({ error: true, message: 'Vui lòng cho biết trải nghiệm về dịch vụ của bạn' });

                if(!ratingText)
					return resolve({ error: true, message: 'Vui lòng viết đánh giá trải nghiệm về dịch vụ của bạn' });

                rating = Number.isNaN(Number(rating)) ? 0 : Number(rating);

                /**
                 * Kiểm tra xem khách hàng có phải có phải người đặt xe của chuyến xe này không thì mới cho đánh giá
                 * Chuyến xe phải còn đang họat động mới cho đánh giá
                 */
                let infoBooking = await BOOKING_COLL.findOne({ 
                    _id: bookingID, 
                    user: customerID,
                    status: this.STATUS_ACTIVE
                });
                if(!infoBooking)
					return resolve({ error: true, message: 'Không thể đánh giá chuyến đi này. Bạn vui lòng đặt xe để có thể đánh giá' });

                let isExistRatingThisBooking = await BOOKING_RATING_COLL.findOne({
                    booking: bookingID,
                    customer: customerID
                });
                if(isExistRatingThisBooking)
					return resolve({ error: true, message: 'Bạn đã đánh giá chuyến đi này. Không thể đánh giá được nữa' });
       
                let dataInsert = {
                    booking: bookingID,
                    customer: customerID,
                    rating,
                    ratingText,
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
					return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình tạo đánh giá' });

				return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    getInfoBooking({ bookingID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(bookingID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ. ID chuyến đi không hợp lệ' });

                let infoBookingRating = await BOOKING_RATING_COLL
                                            .findOne({ booking: bookingID })
                                            .populate({
                                                path: 'booking customer'
                                            })
                if(!infoBookingRating) 
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy thông tin đánh giá chuyến đi' });

                return resolve({ error: false, data: infoBookingRating });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    getListBookingRatingOfCar({ carID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(carID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ. ID chuyến đi không hợp lệ' });

                let listBookingOfCar = await BOOKING_COLL.find({ car: carID });

                let listBookingRating = await BOOKING_RATING_COLL
                                            .find({ 
                                                booking: {
                                                    $in: listBookingOfCar.map(booking => booking._id)
                                                },
                                                status: this.STATUS_ACTIVE 
                                            })
                                            .populate({
                                                path: 'booking customer'
                                            })
                if(!listBookingRating) 
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy thông tin đánh giá chuyến đi' });

                return resolve({ error: false, data: listBookingRating });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}

exports.MODEL = new Model;

var CAR_MODEL                     = require('../../car/models/car').MODEL;