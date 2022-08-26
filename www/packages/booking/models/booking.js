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
const CAR_CHARACTERISTIC_MODEL      = require('../../characteristic/models/car_characteristic').MODEL;

/**
 * COLLECTIONS, MODELS
 */
const BOOKING_COLL  				= require('../databases/booking-coll');

class Model extends BaseModel {
    constructor() {
        super(BOOKING_COLL);
		this.STATUS_INACTIVE        = 0; // Không hoạt động
        this.STATUS_ACTIVE          = 1; // Hoạt động
        this.STATUS_CANCELED        = 2; // Đã hủy
        this.STATUS_WAIT_CONFIRM    = 3; // Đợi duyệt
        this.STATUS_WAIT_GIVE_BACK  = 4; // Đợi trả xe
        this.STATUS_PAID            = 5; // Đã thanh toán
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
                    endTime:   { $gte: new Date(startTime) },
                    $and: [
                        {status: { $ne: this.STATUS_INACTIVE }},
                        {status: { $ne: this.STATUS_CANCELED }}
                    ] 
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

    isCarHaveBooking({ carID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(carID))
                    return resolve({ error: true, message: "Tham số không hợp lệ" });

				let listBooking = await BOOKING_COLL
					.findOne({ car: carID })
					.lean();

                let dataResponse = {};

                if(!listBooking || !listBooking.length) {
                    dataResponse = {
                        error: false,
                        message: 'OK. Xe chưa được đăng ký chuyến nào'
                    }
                } else {
                    dataResponse = {
                        error: true,
                        message: 'Xe đã được đăng ký các chuyến xe. Không thể xóa xe'
                    }
                }
                
                return resolve(dataResponse);
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

    cancelBooking({ bookingID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(bookingID))
                    return resolve({ error: true, message: "Tham số không hợp lệ" });

                let dataUpdateToCancel = { status: this.STATUS_CANCELED };

				let infoAfterCancel = await BOOKING_COLL.findByIdAndUpdate(bookingID, dataUpdateToCancel, {
                    new: true
                });
                if(!infoAfterCancel) 
                    return resolve({ error: true, message: "Xảy ra lỗi trong quá trình hủy chuyến xe" });

                return resolve({ error: false, data: infoAfterCancel });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    payBooking({ bookingID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(bookingID))
                    return resolve({ error: true, message: "Tham số không hợp lệ" });

                let dataUpdateToPayed = { status: this.STATUS_WAIT_GIVE_BACK };

                let infoBooking = await BOOKING_COLL.findById(bookingID);
                if(!infoBooking)
                    return resolve({ error: true, message: "Thông tin chuyến đi không hợp lệ" });

                // Tính ra tổng số tiền thuê xe
                const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                const startDate = new Date(infoBooking.startTime);
                const endDate = new Date();
                
                const diffDays = Math.abs((endDate - startDate) / oneDay);
                if(diffDays < 0) dataUpdateToPayed.realMoney = 0;
                else dataUpdateToPayed.realMoney = Math.round(diffDays * infoBooking.price);

				let infoAfterCancel = await BOOKING_COLL.findByIdAndUpdate(bookingID, dataUpdateToPayed, {
                    new: true
                });
                if(!infoAfterCancel) 
                    return resolve({ error: true, message: "Xảy ra lỗi trong quá trình hủy chuyến xe" });

                return resolve({ error: false, data: infoAfterCancel });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    acceptBooking({ bookingID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(bookingID))
                    return resolve({ error: true, message: "Tham số không hợp lệ" });

                let dataUpdateToCancel = { status: this.STATUS_ACTIVE };

				let infoAfterCancel = await BOOKING_COLL.findByIdAndUpdate(bookingID, dataUpdateToCancel, {
                    new: true
                });
                if(!infoAfterCancel) 
                    return resolve({ error: true, message: "Xảy ra lỗi trong quá trình hủy chuyến xe" });

                return resolve({ error: false, data: infoAfterCancel });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    // Lấy ra danh sách các chuyến mà mình đang đặt lịch
    getListMyBooking({ user, type }){
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(user))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                if(![
                    this.STATUS_ACTIVE,
                    this.STATUS_PAID,
                    this.STATUS_WAIT_CONFIRM,
                    this.STATUS_WAIT_GIVE_BACK
                ].includes(+type)) return resolve({ error: true, message: 'Trạng thái lấy danh sách các chuyến đang đặt lịch không hợp lệ' })

                let condition = {
                    user,
                    status: +type
                };

                let listBooking = await BOOKING_COLL
                    .find(condition)
                    .populate({
                        path: 'car',
                        populate: {
                            path: 'brandID userID avatar',
                            select: 'name firstName lastName phone size path avatar',
                            populate: {
                                path: 'avatar'
                            }
                        }
                    })
                    .populate({
                        path: 'user',
                        select: 'firstName lastName phone avatar',
                        populate: {
                            path: 'avatar',
                            select: 'size path'
                        }
                    })
					.sort({ createAt: -1 })
                if(!listBooking)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy danh sách chuyến xe' });

                let listBookingRes = [];
                for await (let item of listBooking) {
                    let listCharacteristicOfCar = await CAR_CHARACTERISTIC_MODEL.getListByCar({ carID: item.car._id });
                    listBookingRes[listBookingRes.length++] = {
                        booking: item,
                        details: listCharacteristicOfCar && listCharacteristicOfCar.data
                    }
                }

                return resolve({ error: false, data: listBookingRes });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

     // Lấy ra danh sách các chuyến xe khách hàng khác đang có nhu cầu thuê của mình
    getListCustomerBookingMyCar({ user, type }){
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(user))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                if(![
                    this.STATUS_WAIT_CONFIRM,
                    this.STATUS_WAIT_GIVE_BACK
                ].includes(+type)) return resolve({ error: true, message: 'Trạng thái lấy danh sách các chuyến đang đợi đặt lịch không hợp lệ' });

                let listCarOfUser = await CAR_MODEL.getListMyCar({ userID: user });
                if(listCarOfUser.error) return resolve(listCarOfUser);

                let listIDSFromCarOfUser = listCarOfUser.data.map(car => car.infoCar._id);

                let condition = {
                    car: { $in: listIDSFromCarOfUser },
                    status: +type
                }

                let listCustomerBookingMyCar = await BOOKING_COLL
                                            .find(condition)
                                            .populate({
                                                path: 'car',
                                                populate: {
                                                    path: 'brandID userID avatar',
                                                    select: 'name firstName lastName phone size path avatar',
                                                    populate: {
                                                        path: 'avatar'
                                                    }
                                                }
                                            })
                                            .populate({
                                                path: 'user',
                                                select: 'firstName lastName phone avatar',
                                                populate: {
                                                    path: 'avatar',
                                                    select: 'size path'
                                                }
                                            })
                                            .sort({ createAt: -1 })
                if(!listCustomerBookingMyCar)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy danh sách chuyến xe' });

                let listCustomerBookingMyCarRes = [];
                for await (let item of listCustomerBookingMyCar) {
                    let listCharacteristicOfCar = await CAR_CHARACTERISTIC_MODEL.getListByCar({ carID: item.car._id });
                    listCustomerBookingMyCarRes[listCustomerBookingMyCarRes.length++] = {
                        booking: item,
                        details: listCharacteristicOfCar && listCharacteristicOfCar.data
                    }
                }

                return resolve({ error: false, data: listCustomerBookingMyCarRes });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}

exports.MODEL = new Model;

var CAR_MODEL                     = require('../../car/models/car').MODEL;