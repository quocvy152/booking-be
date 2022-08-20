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
const CAR_MODEL                     = require('../../car/models/car').MODEL;

/**
 * COLLECTIONS, MODELS
 */
const BOOKING_COLL  				= require('../databases/booking-coll');

class Model extends BaseModel {
    constructor() {
        super(BOOKING_COLL);
		this.STATUS_INACTIVE        = 0;
        this.STATUS_ACTIVE          = 1;
        this.STATUS_CANCELED        = 2;
        this.STATUS_WAIT_CONFIRM    = 3;
        this.STATUS_WAIT_GIVE_BACK  = 4;
        this.STATUS_PAID            = 5;
    }

    /**
     * TẠO BRAND
     */
	insert({ userID, carID, startTime, endTime, pickUpPlace, dropOffPlace, price, status = this.STATUS_WAIT_CONFIRM }) {
        return new Promise(async resolve => {
            try {
				if(!ObjectID.isValid(userID) || !ObjectID.isValid(carID))
					return resolve({ error: true, message: 'Tham số không hợp lệ' });

                if(!startTime)
					return resolve({ error: true, message: 'Vui lòng nhập thời gian bắt đầu thuê xe' });
                
                if(!endTime)
					return resolve({ error: true, message: 'Vui lòng nhập thời gian kết thúc thuê xe' });
            
                if(!pickUpPlace)
					return resolve({ error: true, message: 'Vui lòng nhập địa điểm thuê xe' });

                if(!dropOffPlace)
					return resolve({ error: true, message: 'Vui lòng nhập địa điểm trả xe' });
                
                if(!price)
					return resolve({ error: true, message: 'Vui lòng nhập đơn giá thuê xe' });

                // Kiểm tra xem người dùng có đang tự thuê xe chính họ hay không
                let resultCheckIsOwnerCar = await CAR_MODEL.checkIsOwnerOfCar({ userID, carID });
                if(resultCheckIsOwnerCar.error)
					return resolve(resultCheckIsOwnerCar);

                let conditionCheckHadBooking = {
                    car: carID,
                    startTime: { $lte: new Date(startTime) },
                    endTime:   { $gte: new Date(startTime) }
                }
                let isHadBookingInThisTime = await BOOKING_COLL.findOne(conditionCheckHadBooking);
                if(isHadBookingInThisTime)
					return resolve({ error: true, message: 'Xảy ra lỗi. Xe đã được thuê trong khoảng thời gian này' });

                // Tính ra tổng số tiền thuê xe
                const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                const startDate = new Date(startTime);
                const endDate = new Date(endTime);
                
                const diffDays = Math.abs((endDate - startDate) / oneDay);
                const totalPrice = Math.round(diffDays * price);

                let dataInsert = {
                    user: userID,
                    car: carID,
                    status: +status,
                    price,
                    totalPrice,
                    pickUpPlace,
                    dropOffPlace,
                    startTime,
                    endTime
                }

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
					return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình tạo chuyến xe' });

				return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getList(){
        return new Promise(async resolve => {
            try {
                let listBooking = await BOOKING_COLL
                    .find()
					.sort({ createAt: -1 })
					.lean();
                if(!listBooking)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy danh sách chuyến xe' });

                return resolve({ error: false, data: listBooking });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getInfo({ bookingID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(bookingID))
                    return resolve({ error: true, message: "Tham số không hợp lệ" });

				let infoBooking = await BOOKING_COLL
					.findById(bookingID)
					.lean();

                if(!infoBooking) 
                    return resolve({ error: true, message: "Xảy ra lỗi lấy thông tin chi tiết chuyến xe" });
                
                return resolve({ error: false, data: infoBooking });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    remove({ brandID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(brandID))
                    return resolve({ error: true, message: "Tham số không hợp lệ" });

                let dataUpdateToRemove = { status: this.STATUS_REMOVED };

				let infoAfterDelete = await BOOKING_COLL.findByIdAndUpdate(brandID, dataUpdateToRemove, {
                    new: true
                });
                if(!infoAfterDelete) 
                    return resolve({ error: true, message: "Xảy ra lỗi trong quá trình xóa chuyến xe" });

                return resolve({ error: false, data: infoAfterDelete });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}

exports.MODEL = new Model;