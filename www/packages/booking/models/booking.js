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
const CAR_COLL  			        = require('../../car/databases/car-coll');

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

                let resultCheckUserBlocking = USER_MODEL.isUserBlocking({ userID });
                if(resultCheckUserBlocking.error)
					return resolve(resultCheckUserBlocking);

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
                if(diffDays < 1)
					return resolve({ error: true, message: 'Ngày thuê và ngày kết thúc phải chênh nhau tối thiểu là 1 ngày' });

                if(endDate < startDate)
					return resolve({ error: true, message: 'Ngày kết thúc phải lớn hơn ngày thuê' });
                
                if(startDate < new Date())
					return resolve({ error: true, message: 'Ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại' });

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

	getListAdmin({ status }){
        return new Promise(async resolve => {
            try {
                if(status && ![this.STATUS_ACTIVE, this.STATUS_PAID].includes(+status))
                    return resolve({ error: true, message: 'Tham số không hợp lệ sssssss' });

                let condition = {};

                if(status)
                    condition.status = +status;

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
                dataUpdateToPayed.timeGiveCarBack = endDate;
                
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

    acceptPaying({ bookingID, carID, rating }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(bookingID) || !ObjectID.isValid(carID))
                    return resolve({ error: true, message: "Tham số không hợp lệ. " });

                rating = Number.isNaN(Number(rating)) ? 0 : Number(rating);
                
                let dataUpdateToCancel = { status: this.STATUS_PAID };

				let infoAfterPayed = await BOOKING_COLL.findByIdAndUpdate(bookingID, dataUpdateToCancel, {
                    new: true
                });
                if(!infoAfterPayed) 
                    return resolve({ error: true, message: "Xảy ra lỗi trong quá trình chấp nhận thanh toán chuyến xe" });

                /**
                 * Bước cập nhật số đánh giá vào xe
                 */
                let resultGetInfoCarBooking = await CAR_MODEL.getInfo({ carID: carID });
                if(resultGetInfoCarBooking.error)
                    return resolve({ error: true, message: resultGetInfoCarBooking.message });

                let { totalRating, rating: ratingCar } = resultGetInfoCarBooking.data;
                !totalRating && (totalRating = 0);
                !ratingCar   && (ratingCar = 0);

                let numberAvarage = (totalRating == 0 && ratingCar == 0) ? 1 : 2;

                let dataUpdateRating = {
                    totalRating: totalRating + 1,
                    rating: Math.ceil((ratingCar + rating) / numberAvarage)
                }

                let infoCarAfterUpdate = await CAR_COLL.findByIdAndUpdate({
                    _id: carID
                }, dataUpdateRating, { new: true });
                if(!infoCarAfterUpdate)
					return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình cập nhật' });

                let infoRatingBookingAfterUpdate = await BOOKING_RATING_COLL.findOneAndUpdate({ booking: bookingID }, {
                    status: this.STATUS_ACTIVE
                });
                if(!infoRatingBookingAfterUpdate)
					return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình cập nhật đánh giá chuyến đi' });

                return resolve({ error: false, data: infoAfterPayed });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    // Lấy ra danh sách các chuyến mà mình đang đặt lịch
    getListMyBooking({ user, type, name, isActive }){
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

                if(+type == this.STATUS_ACTIVE) {
                    condition.endTime = {
                        $gte: new Date()
                    };
                }

                if(+type == this.STATUS_WAIT_CONFIRM) {
                    switch(isActive) {
                        case 'active': {
                            condition.startTime = {
                                $gte: new Date()
                            };
                            break;
                        }
                        case 'inactive': {
                            condition.startTime = {
                                $lt: new Date()
                            };
                            break;
                        }
                        default: {
                        }
                    }
                }

                if(+type == this.STATUS_WAIT_GIVE_BACK) {
                    switch(isActive) {
                        case 'active': {
                            condition.endTime = {
                                $gte: new Date()
                            };
                            break;
                        }
                        case 'inactive': {
                            condition.endTime = {
                                $lt: new Date()
                            };
                            break;
                        }
                        default: {
                        }
                    }
                }

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

                if(name != 'undefined' && name) {
                    let listBookingResFilter = listBookingRes.filter(item => item.booking.car.name.toLowerCase().includes(name.toLowerCase()));
                    return resolve({ error: false, data: listBookingResFilter });
                }

                return resolve({ error: false, data: listBookingRes });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    // Lấy ra danh sách các chuyến của một chiếc xe đang hoạt động
    getListBookingOfCar({ carID, type }){
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(carID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let condition = {
                    status: this.STATUS_ACTIVE,
                    car: carID,
                };

                if(!type || type === undefined || type === 'undefined') {
                    condition.startTime = { $gte: new Date() },
                    condition.endTime   = { $gte: new Date() }
                }

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

                return resolve({ error: false, data: listBooking });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    // Lấy ra danh sách các chuyến xe khách hàng khác đang có nhu cầu thuê của mình
    getListCustomerBookingMyCar({ user, type, name, isActive }){
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(user))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                if(![
                    this.STATUS_WAIT_CONFIRM,
                    this.STATUS_WAIT_GIVE_BACK,
                    this.STATUS_ACTIVE
                ].includes(+type)) return resolve({ error: true, message: 'Trạng thái lấy danh sách các chuyến đang đợi đặt lịch không hợp lệ' });

                let listCarOfUser = await CAR_MODEL.getListMyCar({ userID: user });
                if(listCarOfUser.error) return resolve(listCarOfUser);

                let listIDSFromCarOfUser = listCarOfUser.data.map(car => car.infoCar._id);

                let condition = {
                    car: { $in: listIDSFromCarOfUser },
                    status: +type
                }

                if(isActive == 'active') {
                    condition.startTime = { $gte: new Date() }
                } else if(isActive == 'inactive') {
                    condition.startTime = { $lt: new Date() }
                }

                let listCustomerBookingMyCar = await BOOKING_COLL
                                            .find(condition)
                                            .populate({
                                                path: 'car',
                                                populate: {
                                                    path: 'brandID userID avatar gallery',
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

                if(name != 'undefined' && name) {
                    let listCustomerBookingMyCarResFilter = listCustomerBookingMyCarRes.filter(item => item.booking.car.name.toLowerCase().includes(name.toLowerCase()));
                    return resolve({ error: false, data: listCustomerBookingMyCarResFilter });
                }

                return resolve({ error: false, data: listCustomerBookingMyCarRes });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    // Lấy ra danh sách các chuyến xe khách hàng đang yêu cầu trả xe của mình
    getListCustomerReturnMyCar({ user, type, name, isActive }){
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(user))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                if(![
                    this.STATUS_WAIT_GIVE_BACK,
                    this.STATUS_ACTIVE
                ].includes(+type)) return resolve({ error: true, message: 'Trạng thái lấy danh sách các chuyến đang đợi đặt lịch không hợp lệ' });

                let listCarOfUser = await CAR_MODEL.getListMyCar({ userID: user });
                if(listCarOfUser.error) return resolve(listCarOfUser);

                let listIDSFromCarOfUser = listCarOfUser.data.map(car => car.infoCar._id);

                let condition = {
                    car: { $in: listIDSFromCarOfUser },
                }

                if(isActive == 'active') {
                    condition.endTime = { $gte: new Date() };
                    condition.status = this.STATUS_WAIT_GIVE_BACK;
                } else if(isActive == 'inactive') {
                    condition.endTime = { $lt: new Date() };
                    condition.$or = [
                        { status: this.STATUS_WAIT_GIVE_BACK },
                        { status: this.STATUS_ACTIVE },
                    ]
                } else {
                    condition.$or = [
                        { status: this.STATUS_WAIT_GIVE_BACK },
                        { status: this.STATUS_ACTIVE, endTime: { $lt: new Date() } },
                    ]
                }

                let listCustomerBookingMyCar = await BOOKING_COLL
                                            .find(condition)
                                            .populate({
                                                path: 'car',
                                                populate: {
                                                    path: 'brandID userID avatar gallery',
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

                if(name != 'undefined' && name) {
                    let listCustomerBookingMyCarResFilter = listCustomerBookingMyCarRes.filter(item => item.booking.car.name.toLowerCase().includes(name.toLowerCase()));
                    return resolve({ error: false, data: listCustomerBookingMyCarResFilter });
                }

                return resolve({ error: false, data: listCustomerBookingMyCarRes });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    // Lấy ra danh sách các chuyến xe đã và đang hoạt động của một chiếc xe
    getListBookingDoneOfCar({ carID }){
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(carID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ. Mã xe không hợp lệ' });

                let condition = {
                    car: carID,
                    $or: [{ $or: [ { status: this.STATUS_ACTIVE }, { status: this.STATUS_WAIT_GIVE_BACK } ], endTime: { $lte: new Date() } }, { status: this.STATUS_PAID }]
                }

                let listBookingDone = await BOOKING_COLL.find(condition);
                if(!listBookingDone)
                    return resolve({ 
                        error: true, 
                        message: 'Trạng thái lấy danh sách các chuyến đang đợi đặt lịch không hợp lệ' 
                    });

                return resolve({ error: false, data: listBookingDone });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    // Lấy ra danh sách các chuyến xe đã và đang hoạt động của một chiếc xe
    getListBooking({ carID, type }){
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(carID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ. Mã xe không hợp lệ' });

                let condition = {
                    car: carID,
                };

                if(type == 'active') {
                    condition.endTime   = { $gte: new Date() };
                    condition.status    = this.STATUS_ACTIVE
                }  else {
                    condition.$or = [
                        {
                            status: this.STATUS_ACTIVE,
                            startTime: { $lte: new Date() },
                            endTime: { $lte: new Date() }
                        }, { 
                            status: this.STATUS_PAID
                        }, {
                            status: this.STATUS_WAIT_GIVE_BACK,
                            endTime: { $lt: new Date() }
                        }
                    ]
                }

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

                return resolve({ error: false, data: listBooking });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    // Lấy ra danh sách các chuyến xe đã hoàn thành của một chủ xe
    getTurnoverAndTotalBooking(){
        return new Promise(async resolve => {
            try {
                let condition = {
                    $or: [
                        { 
                            status: this.STATUS_PAID
                        },
                        {
                            status: this.STATUS_ACTIVE,
                            endTime: { $lte: new Date() }
                        }
                    ]
                };

                let listBooking = await BOOKING_COLL.find(condition);
                if(!listBooking)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy danh sách chuyến xe' });

                let turnover = listBooking.reduce((prev, curr) => prev + (curr.realMoney ? curr.realMoney : curr.totalPrice), 0);

                return resolve({ error: false, data: { turnover, totalBooking: listBooking.length } });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}

exports.MODEL = new Model;

var CAR_MODEL                     = require('../../car/models/car').MODEL;