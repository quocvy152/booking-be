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
const { IMAGE_MODEL }				= require('../../image');

/**
 * COLLECTIONS, MODELS
 */
const CUSTOMER_COLL  				= require('../databases/customer-coll');
// const USER_SEGMENT_COLL  			= require('../../product/databases/user_segment-coll');
const OTP_2_MODEL       			= require('../models/otp').MODEL;
// const RANKING_MODEL       			= require('../../ranking/models/ranking').MODEL;
// const RANKING_COLL       			= require('../../ranking/databases/ranking-coll');
const USER_DEVICE_MODEL	            = require('../../customer/models/user_device').MODEL;

class Model extends BaseModel {
    constructor() {
        super(CUSTOMER_COLL);
		this.STATUS_INACTIVE = 0;
        this.STATUS_ACTIVE   = 1;

        this.METHOD_OTP_VIA_MAIL = 'email';
        this.METHOD_OTP_VIA_SMS  = 'phone';
    }

	checkCodeExists(code){
		return new Promise(resolve => {
			(async function recursiveCheckCode(code){
				let checkExists = await CUSTOMER_COLL.findOne({ code });
				if(checkExists){
					code = randomNumbers(10);
					recursiveCheckCode(code);
				} else{
					resolve(code);
				}
			})(code)
		})
	}
    /**
     * !type: Thì đăng ký
     * type = 2 Cập nhật password khi đăng nhập lần đầu tiên
     */
	insert({ type, fullname, email, phone, password, googleUID, facebookUID, appleUID, picture, id, birthday, token, gender, address, intervention }) {
        return new Promise(async resolve => {
            try {
				if(!fullname || !email)
					return resolve({ error: true, message: 'params_invalid' });

				if(!validEmail(email))
					return resolve({ error: true, message: "email_invalid" });
					
				let emailValid 	= email.toLowerCase().trim();
				let checkExists = await CUSTOMER_COLL.findOne({ email: emailValid, type: 0 });
				let checkPhone 	= await CUSTOMER_COLL.findOne({ phone });

				if(!type && checkExists)
					return resolve({ error: true, message: "email_existed" });

                if(!type && checkPhone && !appleUID)
                    return resolve({ error: true, message: "phone_existed" });

                if(type){
                    let checkEmail = await CUSTOMER_COLL.findOne({ email: emailValid, phone: { $nin: [phone] }});
                    if(checkEmail){
                        return resolve({ error: true, message: "email_existed" });
                    }

                    if(!checkPhone){
                        return resolve({ error: true, message: "phone_not_exist" });
                    }
                }
                
                let code = await this.checkCodeExists(randomNumbers(8));
                let dataInsert = {
                    fullname,
                    email: emailValid,
                    phone
                }

                if(!type && code){
                    dataInsert.code = code;
                }

                if(password && password.length){
                    if(password.length < 6)
					return resolve({ error: true, message: "password_needs_at_least_6_characters" });

                    let hashPassword = await hash(password, 8);
                    if (!hashPassword)
                        return resolve({ error: true, message: 'cannot_hash_password' });
                    dataInsert.password = hashPassword;
                }
                if (picture) {
                    let dataAfterInsert = await IMAGE_MODEL.insert({
                        path: picture,
                        name: picture,
                    });
                    dataInsert.avatar    = dataAfterInsert.data._id;
                }
                id         && (dataInsert.id         = id);
                birthday   && (dataInsert.birthday   = birthday);
                token      && (dataInsert.token      = token);

				if(!googleUID && !facebookUID && !appleUID){
					dataInsert.type = 0;
				}
				if(googleUID){
					dataInsert.type = 1;
					dataInsert.googleUID = googleUID;
				}
				if(facebookUID){
					dataInsert.type = 2;
					dataInsert.facebookUID = facebookUID;
				}
				if(appleUID){
					dataInsert.type = 3;
					dataInsert.appleUID = appleUID;
				}

                if(gender){
					dataInsert.gender = gender;
				}

                if(address){
					dataInsert.address = address;
				}

                if(intervention){
					dataInsert.intervention = true;
                }

                let infoAfterInsert;
                // Type = 2 Đăng nhập lần đầu tiên cập nhật thông tin lại
                if(type){
                    infoAfterInsert = await CUSTOMER_COLL.findOneAndUpdate({ phone }, dataInsert, { new: true });
                    if(!infoAfterInsert)
                        return resolve({ error: true, message: 'create_customer_failed' });
                }else{
                    infoAfterInsert = await this.insertData(dataInsert);
                    if(!infoAfterInsert)
                        return resolve({ error: true, message: 'create_customer_failed' });
                }
				// Create QR Code for customer
				// const qrCode = await QRCODE_MODEL.createQRCodeCustomer({ 
				// 	code: infoAfterInsert._id,
				// });

				// if(!qrCode.error){
				// 	await CUSTOMER_COLL.updateOne({ _id: infoAfterInsert._id }, {
				// 		$set: { qrCode: qrCode.data._id  }
				// 	})
				// }

				return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    update({ customerID, fullname, phone, birthday, email, password, oldPassword, point, pointRanking, status, avatar, gender }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(customerID))
                    return resolve({ error: true, message: "params_invalid" });

				if(phone && !validPhone(phone))
					return resolve({ error: true, message: "phone_number_invalid" });


				if(email && !checkEmail(email))
					return resolve({ error: true, message: "email_invalid" });
				
                let checkExists = await CUSTOMER_COLL.findById(customerID);
                if(!checkExists)
                    return resolve({ error: true, message: "customer_is_not_exists" });

                let checkPhoneExist = await CUSTOMER_COLL.findOne({ phone, _id: { $ne: checkExists._id }});
                if(checkPhoneExist)
                    return resolve({ error: true, message: "phone_existed" });

				if(oldPassword){
					let isMatchPassword = await compare(oldPassword, checkExists.password);
					if (!isMatchPassword) 
						return resolve({ error: true, message: 'old_password_wrong' });
				}

                let dataUpdateCustomer = {};
                fullname 		&& (dataUpdateCustomer.fullname    	 = fullname);
                phone 	 		&& (dataUpdateCustomer.phone    	 = phone);
                email 	 		&& (dataUpdateCustomer.email    	 = email);
                birthday 	    && (dataUpdateCustomer.birthday    	 = birthday);
                password 		&& (dataUpdateCustomer.password    	 = hashSync(password, 8));
				pointRanking    && (dataUpdateCustomer.pointRanking  = pointRanking);

				if(!isNaN(point)){
					dataUpdateCustomer.point = point;
				}

				if([0,1].includes(+status)){
					dataUpdateCustomer.status = status;
				}

				if([0,1,2].includes(+gender)){
					dataUpdateCustomer.gender = gender;
				}

				let infoImageAfterInsert = null;
				if(avatar){
					infoImageAfterInsert = await IMAGE_MODEL.insert({ 
						name: avatar.name,
						size: avatar.size,
						path: avatar.path,
					});
					dataUpdateCustomer.avatar = (infoImageAfterInsert && infoImageAfterInsert.data._id) || null;
				}
				console.log({
                    dataUpdateCustomer
                });
                await this.updateWhereClause({ _id: customerID }, dataUpdateCustomer);
                password && delete dataUpdateCustomer.password;
                return resolve({ error: false, data: dataUpdateCustomer });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
    // Trường hợp khi khách hàng cập nhật email mới
    checkUpdateEmailOrder({ customerID, newEmail }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(customerID))
                    return resolve({ error: true, message: "params_invalid" });

				if(newEmail && !checkEmail(newEmail))
					return resolve({ error: true, message: "email_invalid" });
				
                let checkExists = await CUSTOMER_COLL.findById(customerID);
                if(!checkExists)
                    return resolve({ error: true, message: "customer_is_not_exists" });

                let checkNewEmailExist = await CUSTOMER_COLL.findOne({ email: newEmail });
                if(checkNewEmailExist)
					return resolve({ error: true, message: "new_email_existed" });
                
                let codeChangeEmail = randomNumbers(6);

                // Tiến hành gửi email
                sendMailChangeEmail(newEmail, codeChangeEmail);

                // Cập nhật vào collection customer-coll
                await CUSTOMER_COLL.findByIdAndUpdate(customerID, { codeChangeEmail }, { new:true });
                return resolve({ error: false, data: "send_email_success" });
             
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    // Trường hợp khi khách hàng cập nhật email mới
    checkCodeChangeEmail({ customerID, code }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(customerID))
                    return resolve({ error: true, message: "params_invalid" });
                let checkExists = await CUSTOMER_COLL.findOne({ codeChangeEmail: code, _id: customerID });

                if(!checkExists)
                    return resolve({ error: true, message: "code_invalid" });
                return resolve({ error: false, data: "code_valid" });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getList(){
        return new Promise(async resolve => {
            try {
                let listCustomers = await CUSTOMER_COLL
					.find({})
					.populate({
						path: 'avatar qrCode',
						populate: 'image'
					})
                    .limit(1000)
					.sort({ modifyAt: -1 })
					.lean();

                if(!listCustomers)
                    return resolve({ error: true, message: "cannot_get_list_customers" });

                return resolve({ error: false, data: listCustomers });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    getListPagination({ limit = 10, page = 1, keyword }) {
        return new Promise(async resolve => {
            try {
                let dataFind = {};
                if(keyword){
                    let key = keyword.split(" ");
                    key = '.*' + key.join(".*") + '.*';
                    dataFind.$or = [
                        { fullname: new RegExp(key, 'i') },
                    ]
                }
                let skip = (page - 1) * limit;

                let listCustomers = await CUSTOMER_COLL
					.find({ ...dataFind })
                    .limit(limit * 1)
                    .skip(skip)
					.populate({
						path: 'avatar qrCode',
						populate: 'image'
					})
					.sort({ modifyAt: -1 })
					.lean();
           
                let count = await CUSTOMER_COLL.count({ ...dataFind });
                
                let arrCustomer = [];
                
                listCustomers && listCustomers.length && listCustomers.forEach((item, index) => { 
                    let indexChange    = skip + index + 1;
                    let nameCustomer   = item.fullname ? item.fullname : '';
                    let emailCustomer  = item.email    ? item.email    : '';
                    let phoneCustomer  = item.phone    ? item.phone    : '';
                    let genderCustomer = item.gender == 1   ? 'Nam'    : (item.gender == 0 ? 'Nữ' : 'Khác');
                    let pointCustomer  = item.point    ? item.point    : 0;
                    let pointRankingCustomer  = item.pointRanking    ? item.pointRanking    : 0;
                    let avatarCustomer = item.avatar && item.avatar.path  ? `<img class="img-fluid img-thumbnail rounded" style="width: 100px;" src="${loadPathImage(item.avatar.path)}">` : '';
                    let createAt       = moment(item.createAt).format('L');
                    let status         = item.status == 1 ? `<span class="badge badge-pill badge-success">Hoạt Động</span>` : `<span class="badge badge-danger">Không Hoạt Động</span>`;
                    let action         = `
                        <div class="btn-group mb-2">
                            <button type="button" class="btn btn-secondary btn-sm waves-effect waves-light">
                                Thao Tác
                            </button>
                            <button type="button" class="btn btn-secondary btn-sm waves-effect waves-light dropdown-toggle-split dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span class="sr-only">...</span>
                            </button>
                            <div class="dropdown-menu" x-placement="right-start" style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(143px, 0px, 0px);">
                                <a class="dropdown-item" href="/customer/info-customer?customerID=${item._id}">
                                    <i class="fa fa-eye"></i>
                                    Chi tiết
                                </a>
                                <a class="dropdown-item btnUpdatePoint" href="javascript:void(0)" _customerID="${item._id}">
                                    <i class="fa fa-edit"></i>
                                    Cập nhật điểm
                                </a>
                            </div>
                        </div>
                    `;
                    arrCustomer = [
                        ...arrCustomer,
                        {
                            indexChange,
                            nameCustomer,
                            emailCustomer,
                            phoneCustomer,
                            genderCustomer,
                            pointCustomer,
                            pointRankingCustomer,
                            avatarCustomer,
                            createAt,
                            status,
                            action
                        }
                    ]
                });
             

                if(!listCustomers)
                    return resolve({ error: true, message: "cannot_get_list_customers" });

                return resolve({ error: false, data: arrCustomer, recordsTotal: count, recordsFiltered: count });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getListWithPaging({ page = 1, limit = 30 }){
        return new Promise(async resolve => {
            try {
				limit = +limit;
				page  = +page;

                let listCustomers = await CUSTOMER_COLL
					.find({})
					.populate({
						path: 'avatar qrCode',
						populate: 'image'
					})
					.sort({ modifyAt: -1 })
					.limit(limit)
					.skip((page - 1) * limit)
					.lean();

                if(!listCustomers)
                    return resolve({ error: true, message: "cannot_get_list_customers" });

				let totalCustomer = await CUSTOMER_COLL.countDocuments({});

                return resolve({ 
					error: false, 
					data: {
						listCustomers,
						currentPage: page,
						perPage: limit,
						total: totalCustomer
					}
				});
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getListSortSegment({ gender, pointFrom, pointTo, segmentID, phone }) {
        return new Promise(async resolve => {
            try {
                console.log({
                    gender, pointFrom, pointTo, segmentID, phone
                });
				const SORT_VALUE_VALID = [ 0, 1, 2 ];
				let dataSort = {};

                if (phone) {
                    let key = phone.split(" ");
                    key = '.*' + key.join(".*") + '.*';
                    dataSort.$or = [
                        { phone: new RegExp(key, 'i') },
                    ]
                }
				if ((gender || gender == 0) && gender.length) {
                    if (Number.isNaN(Number(gender)) || !SORT_VALUE_VALID.includes(Number(gender))) {
                        return resolve({ error: true, message: "Giới tính không hợp lệ" });
                    }
                    
                    dataSort = {
						...dataSort,
						gender
					}
				}

				if ((pointFrom || pointFrom == 0) && pointFrom.length) {
                    if (Number.isNaN(Number(pointFrom))) {
                        return resolve({ error: true, message: "Từ số Point không hợp lệ" });
                    }

					dataSort.point = {
						...dataSort.point,
						$gte: Number(pointFrom)
					}
				}

				if ((pointTo || pointTo == 0) && pointTo.length) {
                    if (Number.isNaN(Number(pointTo))) {
                        return resolve({ error: true, message: "Từ số Point không hợp lệ" });
                    }
					dataSort.point = {
						...dataSort.point,
						$lte: Number(pointTo)
					}
				}
                let listCustomers = await CUSTOMER_COLL
					.find({...dataSort }, { fullname: 1, email: 1, phone: 1, point: 1, pointRanking: 1, gender: 1, createAt: 1, status: 1 })
					.populate({
						path: 'avatar qrCode',
						populate: 'image'
					})
                    .limit(100)
					.sort({ modifyAt: -1 })
					.lean();
               
				// /**
				//  * TÌM  CUSTOMER VỚI SEGMENT ID
				//  */
				// let listCustomerExist = await USER_SEGMENT_COLL.find({ segment: segmentID });
               
                // if (listCustomerExist && listCustomerExist.length) {
                //     let listCustomerExistID = listCustomerExist.map(item => item.user.toString());
                //     listCustomers = listCustomers.filter( customer => !listCustomerExistID.includes(customer._id.toString()) );
                // }
				// /**
				//  * KIỂM TRA XEM LIST CUSTOMER NÀO ĐÃ TỒN TẠI
				//  */
				// // let listCustomerAfterFilterExistSegment = listCustomers.filter( customer => !listCustomerIDExist.includes(customer._id.toString()) );
                // if(!listCustomers)
                //     return resolve({ error: true, message: "cannot_get_list_customers" });

                return resolve({ 
					error: false, 
					data: {
						listCustomers: listCustomers,
					}
				});
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getInfo({ customerID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(customerID))
                    return resolve({ error: true, message: "param_invalid" });

				let infoCustomer = await CUSTOMER_COLL
					.findById(customerID)
					.populate({
						path: 'avatar qrCode',
						select: "path",
						populate: {
							path: "image",
							select: "path"
						},
					})
					.lean();

                if(!infoCustomer) 
                    return resolve({ error: true, message: "cannot_get_info_customer" });
                
                // let infoRankingCurrent = await RANKING_MODEL.getInfoByPoint({ point: infoCustomer.pointRanking });
                // if(!infoRankingCurrent.error){
                //     let { name, color, logo, maxPoint  } = infoRankingCurrent.data;

                //     infoCustomer.nameRankingCurrent = name;          
                //     infoCustomer.colorRankingCurrent = color;          
                //     infoCustomer.logoRankingCurrent = logo;          
                //     infoCustomer.maxPointRankingCurrent = maxPoint;       

                //     let infoRankingNext = await RANKING_COLL.findOne({
                //         minPoint: {
                //             $lte: maxPoint+1
                //         },
                //         maxPoint: {
                //             $gte: maxPoint+1
                //         }
                //     })  
                //     infoCustomer.nameRankingNext = infoRankingNext? infoRankingNext.name : "";
                // }
				delete infoCustomer.password;
				delete infoCustomer.modifyAt;
				delete infoCustomer.createAt;
				delete infoCustomer.__v;
                return resolve({ error: false, data: infoCustomer });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    getInfoByPhone({ phone }) {
        return new Promise(async resolve => {
            try {
				let infoCustomer = await CUSTOMER_COLL.findOne({ phone }).lean();
                if(!infoCustomer) 
                    return resolve({ error: true, message: "cannot_get_info_customer" });
                if(infoCustomer.password)
                    return resolve({ error: true, message: "user_have_password" });

                return resolve({ error: false, data: infoCustomer });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    delete({ customerID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(customerID))
                    return resolve({ error: true, message: "param_invalid" });

				let infoAfterDelete = await CUSTOMER_COLL.findByIdAndRemove(customerID);

                if(!infoAfterDelete) 
                    return resolve({ error: true, message: "cannot_delete_user" });

                return resolve({ error: false, data: infoAfterDelete });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    updatePasswordAfterForget({ phone, password }) {
        return new Promise(async resolve => {
            try {
                if(!phone || !password)
                    return resolve({ error: true, message: "param_invalids" });

                let hashPassword = await hash(password, 8);
				if (!hashPassword)
					return resolve({ error: true, message: 'cannot_hash_password' });
                let isCustomer = await CUSTOMER_COLL.findOne({ phone });
                if(!isCustomer)
                    return resolve({ error: true, message: 'phone_not_exist' });
                    
				let infoAfterUpdate = await CUSTOMER_COLL.findOneAndUpdate({ phone }, {
                    password: hashPassword
                }, { new: true });

                if(!infoAfterUpdate) 
                    return resolve({ error: true, message: "cannot_update" });

                return resolve({ error: false, data: infoAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
    /**
     * Cập nhật điểm khách hàng
     * isSync: nếu isSync == true thì gọi api đồng bộ bên kia
     */
    updatePoint({ customerID, point, pointRanking, intervention }) {
        return new Promise(async resolve => {
            try {
                if(!customerID || isNaN(point) || isNaN(pointRanking))
                    return resolve({ error: true, message: "param_invalids" });
                let dataUpdate = {
                    point, pointRanking
                };

                if(intervention){
                    dataUpdate.intervention = true;
                }
				let infoAfterUpdate = await CUSTOMER_COLL.findByIdAndUpdate(customerID, dataUpdate, { new: true });
                
                if(!infoAfterUpdate) 
                    return resolve({ error: true, message: "cannot_delete_user" });

                return resolve({ error: false, data: infoAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	// ----------------------- 📟 AUTH LOGIN 📟 ------------------------

	login({ phone, password, deviceID, deviceName, registrationID }) {
        return new Promise(async resolve => {
            try {
                let checkExists = await CUSTOMER_COLL.findOne({ phone })
									.populate({
										path: "avatar",
										select: "path"
									});
                if (!checkExists) 
                    return resolve({ error: true, message: 'phone_not_exist' });

                let isMatchPassword = await compare(password, checkExists.password);
                if (!isMatchPassword) 
                    return resolve({ error: true, message: 'password_is_wrong' });

                if (checkExists.status == 0) 
                    return resolve({ error: true, message: 'customer_blocked' });
                    
                // let infoRankingCurrent = await RANKING_MODEL.getInfoByPoint({ point: checkExists.pointRanking });
                // // console.log({ infoRankingCurrent });
				// delete checkExists._doc.password;
                // if(!infoRankingCurrent.error){
                //     let { name, color, logo, maxPoint  } = infoRankingCurrent.data;
                //     checkExists._doc.nameRankingCurrent = name;          
                //     checkExists._doc.colorRankingCurrent = color;          
                //     checkExists._doc.logoRankingCurrent = logo;          
                //     checkExists._doc.maxPointRankingCurrent = maxPoint;       
                //     let infoRankingNext = await RANKING_COLL.findOne({
                //         minPoint: {
                //             $lte: maxPoint+1
                //         },
                //         maxPoint: {
                //             $gte: maxPoint+1
                //         }
                //     })  
                //     checkExists._doc.nameRankingNext = infoRankingNext? infoRankingNext.name : "";
                // }
                
                let infoUser = {
                    _id: checkExists._id,
                    fullname: checkExists.fullname,
					phone: checkExists.phone,
					email: checkExists.email,
                    status: checkExists.status,
                    type: checkExists.type,
					point: checkExists.point,
					pointRanking: checkExists.pointRanking,
                }
                let token = jwt.sign(infoUser, cfJWS.secret);

                // Update customer cho deviceID
                const infoAfterUpdateUserDevice = await USER_DEVICE_MODEL.updateCustomerForUserDevice({ 
                    deviceID, customerID: checkExists._id, deviceName, registrationID
                });
                
                return resolve({
                    error: false,
                    data: { user: checkExists, token }
                });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	authLogin({ facebookUID, googleUID, appleUID, deviceID, deviceName, registrationID  }){
		return new Promise(async resolve => {
			try {
				let condition = {};
				googleUID 	&& (condition = { googleUID, type: 1 });
				facebookUID && (condition = { facebookUID, type: 2 });
				appleUID 	&& (condition = { appleUID, type: 3 });

				if(condition && Object.keys(condition).length === 0 && condition.constructor === Object)
					return resolve({ error: true, message: 'you_need_at_least_one_oauth' });

				let checkExists = await CUSTOMER_COLL.findOne(condition)
                    .populate({
                        path: "avatar",
                        select: "path"
                    });
                if (!checkExists) 
                    return resolve({ error: true, message: 'customer_not_exist' });

				if (checkExists.status == 0) 
                    return resolve({ error: true, message: 'customer_blocked' });
                // Update customer cho deviceID
                const infoAfterUpdateUserDevice = await USER_DEVICE_MODEL.updateCustomerForUserDevice({ 
                    deviceID, customerID: checkExists._id, deviceName, registrationID
                });

                // let infoRankingCurrent = await RANKING_MODEL.getInfoByPoint({ point: checkExists.pointRanking });
                // // console.log({ infoRankingCurrent });
                // delete checkExists._doc.password;
                // if(!infoRankingCurrent.error){
                //     let { name, color, logo, maxPoint  } = infoRankingCurrent.data;
                //     checkExists._doc.nameRankingCurrent = name;          
                //     checkExists._doc.colorRankingCurrent = color;          
                //     checkExists._doc.logoRankingCurrent = logo;          
                //     checkExists._doc.maxPointRankingCurrent = maxPoint;       
                //     let infoRankingNext = await RANKING_COLL.findOne({
                //         minPoint: {
                //             $lte: maxPoint+1
                //         },
                //         maxPoint: {
                //             $gte: maxPoint+1
                //         }
                //     })  
                //     checkExists._doc.nameRankingNext = infoRankingNext? infoRankingNext.name : "";
                // }

                let infoUser = {
                    _id: checkExists._id,
                    fullname: checkExists.fullname,
                    status: checkExists.status,
                    type: checkExists.type,
					point: checkExists.point,
					pointRanking: checkExists.pointRanking,
                }
                let token = jwt.sign(infoUser, cfJWS.secret);


				return resolve({
					error: false,
					data: { user: checkExists, token }
				})
			} catch (error) {
				return resolve({ error: true, message: error.message });
			}
		})
	}

	insertPhoneOTP({ phone }) {
        return new Promise(async resolve => {
            try {
                /**
                 * NẾU có mail: gửi OTP qua mail
                 * NẾU ko mail: gửi OTP qua SĐT
                 */
                if (!validPhone(phone))
                    return resolve({ error: true, message: 'SĐT không hợp lệ' });

                // if (email && !validEmail(email))
                //     return resolve({ error: true, message: 'Mail không hợp lệ' });

                let isExistPhone = await CUSTOMER_COLL.findOne({ phone, status: this.STATUS_ACTIVE });
                if (isExistPhone)
                    return resolve({ error: true, message: 'SĐT đã đăng ký trước đó' });
              
                console.log({ phone });
                
                // let isExistEmailInCitizenVerify = await CITIZEN_VERIFY_COLL.findOne({ email, status: this.STATUS_ACTIVE });
                // if (isExistEmailInCitizenVerify)
                    // return resolve({ error: true, message: 'Mail đã đăng ký trước đó' });
                
                /**
                 * kiểm tra otp trước đó đã cách 2 phút chưa?
                 */

                let infoOTPAfterInsert = await OTP_2_MODEL.insertV2({ phone, type: OTP_2_MODEL.TYPE_REGISTER });
                if(infoOTPAfterInsert.error)
                    return resolve(infoOTPAfterInsert)
                // if (email) {
                //     objForInsert = {
                //         ...objForInsert, 
                //         email: email.toLowerCase()
                //     }
                //     //* Gửi MAIL
                //     let infoSendOtpViaMail = await OTP_2_MODEL.sendOTPV2({ email, phone });
                //     if(infoSendOtpViaMail.error)
                //         return resolve(infoSendOtpViaMail)
                // } else {
                //     //* Gửi OTP
                //     // let infoSendOtpViaSMS = await OTP_MODEL.sendOTP({ phone });
                //     // if(infoSendOtpViaSMS.error)
                //     //     return resolve(infoSendOtpViaSMS)

                //     let infoSendOtpViaSMS = await OTP_MODEL.sendOTP_VNPT({ phone });
                //     if(infoSendOtpViaSMS.error)
                //         return resolve(infoSendOtpViaSMS)
                //     console.log({ infoSendOtpViaSMS })
                // }
               
                // let infoAfterUpdate = await CITIZEN_VERIFY_COLL.findByIdAndUpdate(citizenVerifyID, {
                //     ...objForInsert
                // }, { new: true });
				
                // if (!infoOTPAfterInsert)
                //     return resolve({ error: true, message: 'cannot_update_info' });

                //TODO: Thêm function gửi OTP 
                console.log({ infoOTPAfterInsert })
                return resolve({ error: false, data: infoOTPAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

	verifyPhoneRegisterOTP({ phone, code }) { // xác nhận mail
        return new Promise(async resolve => {
            try {
                /**
                 *  vì flow hiện tại của gửi OTP khác
                 *  - SMS: otp đang lưu bên authy
                 *  - Mail: otp lưu trên hệ thống (selfhost) 
                 * --> cách kiểm tra khác nhau
                 */
                let infoAfterCheck = await OTP_2_MODEL.verifyOTP({ phone, code, type: OTP_2_MODEL.TYPE_REGISTER })
              
				if (infoAfterCheck.error)
                    return resolve(infoAfterCheck);
                
				return resolve({ error: false, data: infoAfterCheck })

            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

	sendOTPForgot({ phone }) {
        return new Promise(async resolve => {
            try {
                /**
                 * NẾU có mail: gửi OTP qua mail
                 * NẾU ko mail: gửi OTP qua SĐT
                 */
                if (!validPhone(phone))
                    return resolve({ error: true, message: 'SĐT không hợp lệ' });

                // if (email && !validEmail(email))
                //     return resolve({ error: true, message: 'Mail không hợp lệ' });

                let isExistPhone = await CUSTOMER_COLL.findOne({ phone, status: this.STATUS_ACTIVE });
                if (!isExistPhone)
                    return resolve({ error: true, message: 'SĐT chưa được đăng ký' });
              
                console.log({ phone });
                let infoOTPAfterInsert = await OTP_2_MODEL.insertV2({ phone, type: OTP_2_MODEL.TYPE_FORGET_PASS });
                if(infoOTPAfterInsert.error)
                    return resolve(infoOTPAfterInsert)
                
				//TODO: Thêm function gửi OTP
                console.log({ infoOTPAfterInsert })
                return resolve({ error: false, data: infoOTPAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

	verifyPhoneForgotOTP({ phone, code }) { // xác nhận mail
        return new Promise(async resolve => {
            try {
                /**
                 *  vì flow hiện tại của gửi OTP khác
                 *  - SMS: otp đang lưu bên authy
                 *  - Mail: otp lưu trên hệ thống (selfhost) 
                 * --> cách kiểm tra khác nhau
                 */
                let infoAfterCheck = await OTP_2_MODEL.verifyOTP({ phone, code, type: OTP_2_MODEL.TYPE_FORGET_PASS })
                if (infoAfterCheck.error)
                    return resolve(infoAfterCheck);
                
				return resolve({ error: false, data: infoAfterCheck })

            } catch (error) {
                return resolve({ error: true, message: error.message })
            }
        })
    }

    updatePassword({ customerID, password, oldPassword }) {
        return new Promise(async resolve => {
            try {
                if(!customerID || !password || !oldPassword)
                    return resolve({ error: true, message: "param_invalids" });

                const checkExists = await CUSTOMER_COLL.findById(customerID);
                if(!checkExists)
                    return resolve({ error: true, message: "account_is_not_exists" });
                
                if (password && !oldPassword ){
                    return resolve({ error: true, message: "oldPassword_invalid" });
                }
                
                if (!password && oldPassword ){
                    return resolve({ error: true, message: "password_invalid" });
                }

                if( oldPassword ){
                    const isMatchPass = await compare(oldPassword, checkExists.password);
                    if (!isMatchPass) 
                        return resolve({ error: true, message: 'old_password_wrong' });
                }

                let hashPassword = await hash(password, 8);
                if (!hashPassword)
                    return resolve({ error: true, message: 'cannot_hash_password' });

				let infoAfterUpdate = await CUSTOMER_COLL.findByIdAndUpdate(customerID, {
                    password: hashPassword
                }, { new: true });
                
                if(!infoAfterUpdate) 
                    return resolve({ error: true, message: "cannot_delete_user" });

                return resolve({ error: false, data: infoAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

}

exports.MODEL = new Model;
