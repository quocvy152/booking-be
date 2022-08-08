"use strict";
let request = require('request');
/**
 * EXTERNAL PACKAGES
 */
const ObjectID                      = require('mongoose').Types.ObjectId;

/**
 * INTERNAL PACKAGES
 */
 const { checkObjectIDs }           = require('../../../utils/utils');
 const { randomStringOnlyNumber }   = require('../../../utils/string_utils');
 const { addMinuteToDate, betweenTwoDateResultMinute, betweenTwoDateResultSeconds }          
                                    = require('../../../utils/time_utils');

/**
 * BASES
 */
const BaseModel 					= require('../../../models/intalize/base_model');

const { sendOTP: sendOTPViamail }                           = require('../../../mailer/module/mail_user')
/**
 * COLLECTIONS
 */
const OTP_COLL  				    = require('../databases/otp-coll');

class Model extends BaseModel {
    constructor() {
        super(OTP_COLL);
        this.TYPE_REGISTER      = 1;
        this.TYPE_LOGIN         = 2;
        this.TYPE_FORGET_PASS   = 3;

        this.STATUS_WAITING_VERIFY  = 0;
        this.STATUS_VERIFIED        = 1;
        this.STATUS_CANCEL_VERIFY   = 2;
    }

    /**
     * @param {*} objectZalo  
     * @returns 
     * ! bỏ sendOTP (ko dùng zalo nữa)
     */
	insert({ phone, type, userZaloID }) { // khi người dùng nhập OTP
        return new Promise(async resolve => {
            try {

                let listOTPLatestOFUser = await OTP_COLL.find({ userZaloID, status: this.STATUS_WAITING_VERIFY }).sort({ createAt: -1 }).limit(1);
                // console.log({ listOTPLatestOFUser }) //TODO ĐANG SAI, KHI USER CHƯA GỦI LẦN NÀO
                if (listOTPLatestOFUser && listOTPLatestOFUser.length > 0) { // đang có otp đang ở chế độ chờ verify
                    let itemLatest = listOTPLatestOFUser[0]
                    // kiểm tra đã hết 2 phút -> cho phép gửi tiếp
                    const MINUTE_FOR_COMPARE = 2; //chu kỳ là 2 phút gửi 1 lần
                    let currentTime = Date.now();
                    let minuteHasSub = betweenTwoDateResultMinute(itemLatest.createAt, new Date(currentTime));
                    // if (minuteHasSub < MINUTE_FOR_COMPARE) {
                    //     return resolve({ error: true, message: 'waiting_2_minutes_for_resend', minute_waited: minuteHasSub })
                    // }
                }

                // cập nhật tât cả dữ liệu cũ là 2- đã hết hạn
                let infoAllRecordAfterUpdate = await OTP_COLL.updateMany({
                    userZaloID
                }, {
                    $set: {
                        status: this.STATUS_CANCEL_VERIFY
                    }
                });
                console.log({ infoAllRecordAfterUpdate })

                const AMOUNT_CHARATOR = 6;
                let codeGenerate = randomStringOnlyNumber(AMOUNT_CHARATOR);
                console.log({ codeGenerate })

                const TIME_FOR_BORN_CODE = 5; // 5 phút chỉ 1 code được tạo ra (CHỜ quá trình người dân có thể đăng ký thông tin bên zalo)
                let now = Date.now();
                let expiredTime = addMinuteToDate(now, TIME_FOR_BORN_CODE);
                // console.log({
                //     now, expiredTime
                // })
                let objectForInsert = {
                    phone, type, code: codeGenerate, expiredTime, userZaloID
                }

                let infoAfterInsert = await this.insertData(objectForInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: 'cannot_insert' });

                return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    insertV2({ phone, type }) {      // khi người dùng nhập OTP
        return new Promise(async resolve => {
            try {
                let listOTPLatestOFUser = await OTP_COLL.find({ phone, status: this.STATUS_WAITING_VERIFY }).sort({ createAt: -1 }).limit(1);
            
                if (listOTPLatestOFUser && listOTPLatestOFUser.length > 0) { // đang có otp đang ở chế độ chờ verify
                    let itemLatest = listOTPLatestOFUser[0]
                    // kiểm tra đã hết 2 phút -> cho phép gửi tiếp
                    const MINUTE_FOR_COMPARE = 2; //chu kỳ là 2 phút gửi 1 lần
                    let currentTime = Date.now();
                    let minuteHasSub = betweenTwoDateResultMinute(itemLatest.createAt, new Date(currentTime));
                    let secondsHasSub = betweenTwoDateResultSeconds(itemLatest.createAt, new Date(currentTime));
                    if (minuteHasSub < MINUTE_FOR_COMPARE) {
                        return resolve({ error: true, message: `OTP được gửi ${MINUTE_FOR_COMPARE} phút/1 lần, vui lòng chờ ${ 2*60 - secondsHasSub} giây còn lại`, minute_waited: minuteHasSub })
                    }
                }

                // cập nhật tât cả dữ liệu cũ là 2- đã hết hạn
                let infoAllRecordAfterUpdate = await OTP_COLL.updateMany({
                    phone
                }, {
                    $set: {
                        status: this.STATUS_CANCEL_VERIFY
                    }
                });
                console.log({ infoAllRecordAfterUpdate })

                const AMOUNT_CHARATOR = 6;
                //TODO: Mở ra khi đã có gửi OTP

                // let codeGenerate = randomStringOnlyNumber(AMOUNT_CHARATOR);
                let codeGenerate = 123456;
                console.log({ codeGenerate })

                const TIME_FOR_BORN_CODE = 5; // 5 phút chỉ 1 code được tạo ra (CHỜ quá trình người dân có thể đăng ký thông tin bên zalo)
                let now = Date.now();
                let expiredTime = addMinuteToDate(now, TIME_FOR_BORN_CODE);
                // console.log({
                //     now, expiredTime
                // })
                let objectForInsert = {
                    phone, type, code: codeGenerate, expiredTime, phone
                }

                let infoAfterInsert = await this.insertData(objectForInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: 'cannot_insert' });

                return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    /**
     * khi người dùng quan tâm (webhook) hoặc từ gửi phone kiểm tra có thì gọi gửi OTP
     * ! bỏ sendOTP (ko dùng zalo nữa)
     */
    sendOTP({ userZaloID }) {
        return new Promise(async resolve => {
            try {
                 /**
                 * 1/kiểm tra user đã đăng ký trên web chưa, hiệu lực OTP còn hay không
                 * 2/ TODO Sơn/SON xử lý kiểm tra 2 phút chỉ gửi 1 lần (sau 2 phút mới tiếp tục cho gửi)
                 */
                let listOTPLatestOFUser = await OTP_COLL.find({ userZaloID }).sort({ createAt: -1 }).limit(1);
                console.log({ listOTPLatestOFUser })
                if (!listOTPLatestOFUser || listOTPLatestOFUser.length == 0) 
                    return resolve({ error: true, message: 'cannot_get_otp_record' });

                let itemLatest = listOTPLatestOFUser[0]
                    
                // SEND OTP(mở đầu)
                let messageWelcome  = `Mã Xác Nhận OTP Đăng Ký của Bạn là:`
                let infoSendWelcome = await this._callApiSendMessage({ userZaloID, message: messageWelcome });

                // SEND OTP(CODE)
                let { code } = itemLatest;
                let messageCodeOTP  = code;
                let infoSendOTP     = await this._callApiSendMessage({ userZaloID, message: messageCodeOTP })
                
                return resolve({ error: false, data: {
                    infoSendWelcome, infoSendOTP
                } })
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    sendOTPV2({ email, phone }) {
        return new Promise(async resolve => {
            try {
                 /**
                 * 1/kiểm tra user đã đăng ký trên web chưa, hiệu lực OTP còn hay không
                 * 2/ TODO Sơn/SON xử lý kiểm tra 2 phút chỉ gửi 1 lần (sau 2 phút mới tiếp tục cho gửi)
                 */
                let listOTPLatestOFUser = await OTP_COLL.find({ phone }).sort({ createAt: -1 }).limit(1);
                console.log({ listOTPLatestOFUser })
                if (!listOTPLatestOFUser || listOTPLatestOFUser.length == 0) 
                    return resolve({ error: true, message: 'cannot_get_otp_record' });
                let itemLatest = listOTPLatestOFUser[0]
                let { code } = itemLatest;
                sendOTPViamail(email, code)
                    
                return resolve({ error: false, message: 'send_success' })
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    verifyOTP({ phone, code, type }) {
        return new Promise(async resolve => {
            try {
                let isExistItemWaitingForVerify = await OTP_COLL.findOne({ phone, status: this.STATUS_WAITING_VERIFY, type });
                console.log({ isExistItemWaitingForVerify, phone, status: this.STATUS_WAITING_VERIFY, type })
                if (!isExistItemWaitingForVerify)
                    return resolve({ error: true, message: 'Mã sai hoặc đã được sử dụng, vui lòng chọn mã khác' }); //trường hợp này là chưa gửi OTP

                if (isExistItemWaitingForVerify.code != code)
                    return resolve({ error: true, message: 'Mã xác nhận không chính xác' });
                
                let infoAfterUpdateOTPUsed = await OTP_COLL.findByIdAndUpdate(isExistItemWaitingForVerify._id, {
                    status: this.STATUS_VERIFIED,
                    modifyAt: Date.now()
                }, {
                    new: true
                })
                return resolve({ error: false, message: 'Xác thực thành công', data: {
                    infoAfterUpdateOTPUsed
                } });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    // getLastRecordByPhoneWithType({ userZaloID }) {
    //     return new Promise(async resolve => {
    //         try {
    //             if (!checkObjectIDs(userZaloID)) {
    //                 return resolve({ error: true, message: 'id_invalid' });
    //             }
    //             let listRecords = await USER_ZALO_COLL.findById(userZaloID).lean();
    //             if(!listRecords)
    //                 return resolve({ error: true, message: "not_found_list" });

    //             return resolve({ error: false, data: listRecords });
    //         } catch (error) {
    //             return resolve({ error: true, message: error.message });
    //         }
    //     })
    // }


    _callApiSendMessage({ userZaloID, message }) {
        return new Promise(async resolve => {
            try {
                var request = require('request');
                var options = {
                    'method': 'POST',
                    'url': 'https://openapi.zalo.me/v2.0/oa/message',
                    'headers': {
                        'access_token': process.env.ACCESS_TOKEN_ZALO || '40S25IGKw2GJ1maJ9X_f8nG73nGd28DpTd0q2pXfdZzr6ILi9qgR1rDRSM427ye-PGmqLIvuaI91Rnfn7t-bEt0c5MqCIwCxR1qcVruAcoqfT6LA733GBMXBMd8FA-95OsD282Lrysz5OM8A5nUSIKK3AmeA591VHrym9omAcnTCRZXL83-R15Tg76C5Vw4BDJOWR6POkrq96Y0rR6gGP0yR5J5JRgLJEoak1L9SbrmY90KCKa-oEH0_Cb5nMBaLHnrVKoLAwJmN01TEPN7z528ITYPqOzLtUKa48TC09mZZ80',
                        'Content-Type': 'text/plain'
                    },
                    body: `{\n  "recipient":{\n    "user_id":"${userZaloID}"\n  },\n  "message":{\n    "text": "${message}"\n  }\n}`
                };
                request(options, function (error, response) {
                    if (error) {
                        //TODO cập nhật trạng thái khi đã gửi tin nhắn - THẤT BẠI
                        return resolve({ error: true, message: error.message });
                        // throw new Error(error);
                    }
                    let dataAfterParseSendMessage = JSON.parse(response.body); //insert DB
                    //TODO cập nhật trạng thái khi đã gửi tin nhắn - THÀNH CÔNG
                    // console.log({ dataAfterParseSendMessage })
                    return resolve(dataAfterParseSendMessage)
                });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}

exports.MODEL = new Model;
