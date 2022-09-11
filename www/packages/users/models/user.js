'use strict';

/**
 * EXTERNAL PACKAGES
 */
const ObjectID                      = require('mongoose').Types.ObjectId;
const jwt                           = require('jsonwebtoken');
const { hash, hashSync, compare }   = require('bcryptjs');

/**
 * INTERNAL PACKAGES
 */
const cfJWS                         = require('../../../config/cf_jws');
const { resetPassAccount }          = require('../../../mailer/module/mail_user');
const { BOOKING_URL }               = require('../../../config/cf_constants');
const { randomStringFixLength }     = require('../../../utils/string_utils');

/**
 * BASES
 */
const BaseModel 					= require('../../../models/intalize/base_model');

/**
 * COLLECTIONS
 */
const USER_COLL  					= require('../databases/user-coll');

/**
 * MODELS
 */
const IMAGE_MODEL                = require('../../image/models/image').MODEL;
const TOKEN_MODEL                = require('../../token/models/token').MODEL;
class Model extends BaseModel {
    constructor() {
        super(USER_COLL);
        this.ADMIN_ROLE = 0;
        this.USER_ROLE  = 1;
        this.STATUS_ACTIVE = 1;
        this.STATUS_INACTIVE = 0;
        this.STATUS_DELETED = 2;
    }

	insert({ username, email, password, confirmPass, role, status = 1, firstName, lastName, address, phone, avatar,
        citizenIdentificationNo, citizenIdentificationFront, citizenIdentificationBack,
        drivingLicenseNo, drivingLicenseFront, drivingLicenseBack }) {
        return new Promise(async resolve => {
            try {
                console.log({
                    username, 
                    email, 
                    password,
                    phone,
                    role
                })

                if(!username || !email || !phone || !password || !role)
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let emailValid 	  = email.toLowerCase().trim();
                let usernameValid = username.toLowerCase().trim();
                let phoneValid    = phone.toLowerCase().trim();

                let checkExists = await USER_COLL.findOne({
                    $or: [
                        { username: usernameValid },
                        { email: emailValid },
                        { phone: phoneValid },
                    ]
                });
                if(checkExists)
                    return resolve({ error: true, message: 'Tên người dùng hoặc email hoặc số điện thoại đã tồn tại' });

				if(![this.ADMIN_ROLE, this.USER_ROLE].includes(+role))
					return resolve({ error: true, message: 'Quyền không hợp lệ' });

				if(![this.STATUS_ACTIVE, this.STATUS_INACTIVE].includes(+status))
					return resolve({ error: true, message: 'Trạng thái không hợp lệ' });

                let dataInsert = {
                    username: usernameValid, 
                    email: emailValid,
                    phone: phoneValid,
					status,
					role
                }

                if(confirmPass !== password)
					return resolve({ error: true, message: 'Mật khẩu xác nhận không hợp lệ' });

                let hashPassword = await hash(password, 8);
				if (!hashPassword)
					return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình hash mật khẩu' });

				dataInsert.password = hashPassword;
				dataInsert.firstName = firstName;
				dataInsert.lastName = lastName;
				dataInsert.address = address;

                if(avatar) {
                    let { size, name, path } = avatar;
                    let resultInsertImage = await IMAGE_MODEL.insert({ size, name, path });
                    if(resultInsertImage.error)
					    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình thêm ảnh đại diện' });
                    
				    dataInsert.avatar = resultInsertImage.data._id;
                }

                if(citizenIdentificationFront) {
                    let { size, name, path } = citizenIdentificationFront;
                    let resultInsertImage = await IMAGE_MODEL.insert({ size, name, path });
                    if(resultInsertImage.error)
					    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình thêm ảnh căn cước công dân mặt trước' });
                    
				    dataInsert.citizenIdentificationFront = resultInsertImage.data._id;
                }

                if(citizenIdentificationBack) {
                    let { size, name, path } = citizenIdentificationBack;
                    let resultInsertImage = await IMAGE_MODEL.insert({ size, name, path });
                    if(resultInsertImage.error)
					    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình thêm ảnh căn cước công dân mặt sau' });
                    
				    dataInsert.citizenIdentificationBack = resultInsertImage.data._id;
                }

                if(drivingLicenseFront) {
                    let { size, name, path } = drivingLicenseFront;
                    let resultInsertImage = await IMAGE_MODEL.insert({ size, name, path });
                    if(resultInsertImage.error)
					    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình thêm ảnh bằng lái xe mặt trước' });
                    
				    dataInsert.drivingLicenseFront = resultInsertImage.data._id;
                }

                if(drivingLicenseBack) {
                    let { size, name, path } = drivingLicenseBack;
                    let resultInsertImage = await IMAGE_MODEL.insert({ size, name, path });
                    if(resultInsertImage.error)
					    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình thêm ảnh bằng lái xe mặt trước' });
                    
				    dataInsert.drivingLicenseBack = resultInsertImage.data._id;
                }

                if(citizenIdentificationNo)
                    dataInsert.citizenIdentificationNo = citizenIdentificationNo;

                if(drivingLicenseNo)
                    dataInsert.drivingLicenseNo = drivingLicenseNo;

                let infoAfterInsert = await this.insertData(dataInsert);
                if(!infoAfterInsert)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình tạo người dùng' });

                return resolve({ error: false, data: infoAfterInsert });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    getInfo({ userID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let infoUser = await USER_COLL.findById(userID, { password: 0 }).populate({ path: 'avatar citizenIdentificationFront citizenIdentificationBack drivingLicenseFront drivingLicenseBack', select: 'path size' });
                if(!infoUser)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy thông tin người dùng' });

                return resolve({ error: false, data: infoUser });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	update({ userID, username, email, currentPass, newPass, confirmPass, status, role, firstName, lastName, address, phone, avatar,
        citizenIdentificationNo, citizenIdentificationFront, citizenIdentificationBack,
        drivingLicenseNo, drivingLicenseFront, drivingLicenseBack 
    }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let infoUser = await USER_COLL.findById(userID);
                if(!infoUser)
                    return resolve({ error: true, message: 'Mã ID người dùng không hợp lệ' });

                let emailValid 	  = email.toLowerCase().trim();
                let usernameValid = username.toLowerCase().trim();
                let phoneValid    = phone.toLowerCase().trim();

                let checkExists = await USER_COLL.findOne({
                    _id: { $ne: userID },
                    $or: [
                        { username: usernameValid },
                        { email: emailValid },
                        { phone: phoneValid },
                    ]
                });
                if(checkExists)
                    return resolve({ error: true, message: 'Tên người dùng hoặc email hoặc số điện thoại đã tồn tại' });

				if(role && ![this.ADMIN_ROLE, this.USER_ROLE].includes(+role))
					return resolve({ error: true, message: 'Quyền không hợp lệ' });

				if(status && ![this.STATUS_ACTIVE, this.STATUS_INACTIVE].includes(+status))
					return resolve({ error: true, message: 'Trạng thái không hợp lệ' });

                let dataUpdate = {};

                username && (dataUpdate.username = username);
                email    && (dataUpdate.email = email);
                phone    && (dataUpdate.phone = phone);
                role     && (dataUpdate.role = +role);
                status   && (dataUpdate.status = +status);

                // Bước kiểm tra và đổi mật khẩu
                if(confirmPass && currentPass && newPass) {
                    let isCorrectPass = await compare(currentPass, infoUser.password);
                    if(!isCorrectPass)
					    return resolve({ error: true, message: 'Mật khẩu không chính xác. Vui lòng thử lại' });
                    
                    if(confirmPass !== newPass)
					    return resolve({ error: true, message: 'Mật khẩu xác nhận không chính xác. Vui lòng thử lại' });

                    let hashPassword = await hash(newPass, 8);
                    if (!hashPassword)
                        return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình hash mật khẩu' });

                    dataUpdate.password = hashPassword;
                } else if(confirmPass || currentPass || newPass)
					return resolve({ error: true, message: 'Vui lòng nhập đẩy đủ các thông tin về mật khẩu để tiến hành thay đổi mật khẩu' });

				firstName && (dataUpdate.firstName = firstName);
				lastName  && (dataUpdate.lastName = lastName);
				address   && (dataUpdate.address = address);

                if(avatar) {
                    let dataImage = {
                        name: avatar.filename,
                        path: avatar.urlImgServer,
                        size: avatar.size
                    }
                    let resultInsertImage = await IMAGE_MODEL.insert(dataImage);
                    if(resultInsertImage.error)
					    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình thêm ảnh đại diện' });
                    
				    dataUpdate.avatar = resultInsertImage.data._id;
                }

                // căn cước công dân mặt trước
                if(citizenIdentificationFront) {
                    let { size, name, path } = citizenIdentificationFront;
                    let resultInsertImage = await IMAGE_MODEL.insert({ size, name, path });
                    if(resultInsertImage.error)
					    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình thêm ảnh căn cước công dân mặt trước' });
                    
				    dataInsert.citizenIdentificationFront = resultInsertImage.data._id;
                } else return resolve({ error: true, message: 'Vui lòng chọn ảnh căn cước công dân mặt trước' });

                // căn cước công dân mặt sau
                if(citizenIdentificationBack) {
                    let { size, name, path } = citizenIdentificationBack;
                    let resultInsertImage = await IMAGE_MODEL.insert({ size, name, path });
                    if(resultInsertImage.error)
					    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình thêm ảnh căn cước công dân mặt sau' });
                    
				    dataInsert.citizenIdentificationBack = resultInsertImage.data._id;
                } else return resolve({ error: true, message: 'Vui lòng chọn ảnh căn cước công dân mặt sau' });

                // bằng lái xe mặt trước
                if(drivingLicenseFront) {
                    let { size, name, path } = drivingLicenseFront;
                    let resultInsertImage = await IMAGE_MODEL.insert({ size, name, path });
                    if(resultInsertImage.error)
					    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình thêm ảnh bằng lái xe mặt trước' });
                    
				    dataInsert.drivingLicenseFront = resultInsertImage.data._id;
                } else return resolve({ error: true, message: 'Vui lòng chọn ảnh bằng lái xe mặt trước' });

                if(drivingLicenseBack) {
                    let { size, name, path } = drivingLicenseBack;
                    let resultInsertImage = await IMAGE_MODEL.insert({ size, name, path });
                    if(resultInsertImage.error)
					    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình thêm ảnh bằng lái xe mặt trước' });
                    
				    dataInsert.drivingLicenseBack = resultInsertImage.data._id;
                } else return resolve({ error: true, message: 'Vui lòng chọn ảnh bằng lái xe mặt sau' });

                if(citizenIdentificationNo)
                    dataInsert.citizenIdentificationNo = citizenIdentificationNo;
                else return resolve({ error: true, message: 'Vui lòng nhập số căn cước công dân' });

                if(drivingLicenseNo)
                    dataInsert.drivingLicenseNo = drivingLicenseNo;
                else return resolve({ error: true, message: 'Vui lòng nhập số bằng lái xe' });

                let infoAfterUpdate = await USER_COLL.findByIdAndUpdate(userID, dataUpdate, { new: true }).populate({ path: 'avatar', select: 'path size' });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình cập nhật người dùng' });

                return resolve({ error: false, data: infoAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    updatePersonalUser({ userID, password, oldPassword, status, role }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: 'params_invalid' });

                let checkExists = await USER_COLL.findById(userID);
                if(!checkExists)
                    return resolve({ error: true, message: 'user_is_not_exists' });

				if(oldPassword){
					let isMatchPass = await compare(oldPassword, checkExists.password);
					if (!isMatchPass) 
						return resolve({ error: true, message: 'old_password_wrong' });
				}

                let dataUpdateUser = {};
                password && (dataUpdateUser.password    = hashSync(password, 8));

                if([0,1,2].includes(+role)){
                    dataUpdateUser.role = role;
                }

				if([0,1].includes(+status)){
					dataUpdateUser.status = status;
				}

                await this.updateWhereClause({ _id: userID }, dataUpdateUser);
                password && delete dataUpdateUser.password;

                return resolve({ error: false, data: dataUpdateUser });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    remove({ userID }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let dataUpdate = {
                    status: this.STATUS_DELETED
                };

				let infoAfterDelete = await USER_COLL.findByIdAndUpdate(userID, dataUpdate, { new: true });
                if(!infoAfterDelete) 
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình xóa người dùng' });

                return resolve({ error: false, data: infoAfterDelete });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

	getList({ name }){
        return new Promise(async resolve => {
            try {
                let condition = {
                    role: this.USER_ROLE
                };

                if(name != 'undefined' && name) {
                    let key = name.split(" ");
                    key = '.*' + key.join(".*") + '.*';
                    condition.$or = [
                        { firstName: new RegExp(key, 'i') },
                        { lastName: new RegExp(key, 'i') }
                    ]
                }

                let listUser = await USER_COLL
                                            .find(condition)
                                            .populate({
                                                path: 'avatar',
                                                select: 'name size path'
                                            })
                                            .lean();
                if(!listUser)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình lấy danh sách người dùng' });

                return resolve({ error: false, data: listUser });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    login({ username, email, password }) {
        return new Promise(async resolve => {
            try {
                let checkExists = await USER_COLL.findOne({ 
                    $or: [
                        { username: username && username.toLowerCase().trim() },
                        { email: email && email.toLowerCase().trim() }
                    ]
                });
                if (!checkExists) 
                    return resolve({ error: true, message: 'Username hoặc Email không tồn tại' });

                if(checkExists.status == this.STATUS_INACTIVE)
                    return resolve({ error: true, message: 'Tài khoản của bạn đã bị khóa. Vui lòng thử tài khoản khác' });

                let isMatchPass = await compare(password, checkExists.password);
                if (!isMatchPass) 
                    return resolve({ error: true, message: 'Mật khẩu không chính xác' });

                if (checkExists.status == this.STATUS_INACTIVE) 
                    return resolve({ error: true, message: 'Người dùng đang bị khóa. Vui lòng liên hệ quản trị viên' });

                let infoUser = {
                    _id: checkExists._id,
                    username: checkExists.username,
                    firstName: checkExists.firstName,
                    lastName: checkExists.lastName,
                    email: checkExists.email,
                    phone: checkExists.phone,
                    address: checkExists.address,
                    status: checkExists.status,
                    role: checkExists.role,
                }

                let isExistToken = await TOKEN_MODEL.getInfo({ userID: checkExists._id });
                let token;
                if(isExistToken.error) {
                    token = jwt.sign(infoUser, cfJWS.secret);

                    let resultInsertToken = await TOKEN_MODEL.insert({ userID: checkExists._id, token });
                    if(resultInsertToken.error) 
                        return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình cấp TOKEN' });
                } else token = isExistToken.data.token;

                return resolve({
                    error: false,
                    data: { user: infoUser, token }
                });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    resetPassword({ account }) {
        return new Promise(async resolve => {
            try {
                if(!account)
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let infoUser = await USER_COLL.findOne({
                    $or: [
                        { email: account },
                        { username: account }
                    ]
                });
                if(!infoUser)
                    return resolve({ error: true, message: 'Tên tài khoản hoặc email không hợp lệ' });

                let newPassword = randomStringFixLength(6);
                let newPasswordHash = await hash(newPassword, 8);
                let infoUserAfterUpdate = await USER_COLL.findOneAndUpdate({
                    $or: [
                        { username: account },
                        { email: account }
                    ]
                }, { password: newPasswordHash })

                let BOOKING_SERVER = BOOKING_URL.BOOKING_SERVER;
                resetPassAccount(infoUser.email, infoUser.username, BOOKING_SERVER, 1, newPassword);

                return resolve({
                    error: false,
                    data: infoUserAfterUpdate
                });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    changePassword({ userID, oldPassword, newPassword, confirmPassword }) {
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let infoUser = await USER_COLL.findById(userID);
                if(!infoUser)
                    return resolve({ error: true, message: 'Mã ID người dùng không hợp lệ' });

                let dataUpdate = {};

                // Bước kiểm tra và đổi mật khẩu
                if(confirmPassword && oldPassword && newPassword) {
                    let isCorrectPass = await compare(oldPassword, infoUser.password);
                    if(!isCorrectPass)
					    return resolve({ error: true, message: 'Mật khẩu không chính xác. Vui lòng thử lại' });
                    
                    if(confirmPassword !== newPassword)
					    return resolve({ error: true, message: 'Mật khẩu xác nhận không chính xác. Vui lòng thử lại' });

                    let hashPassword = await hash(newPassword, 8);
                    if (!hashPassword)
                        return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình hash mật khẩu' });

                    dataUpdate.password = hashPassword;
                } else if(confirmPassword || oldPassword || newPassword)
					return resolve({ error: true, message: 'Vui lòng nhập đẩy đủ các thông tin về mật khẩu để tiến hành thay đổi mật khẩu' });

                let infoAfterUpdate = await USER_COLL.findByIdAndUpdate(userID, dataUpdate, { new: true });
                if(!infoAfterUpdate)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình cập nhật người dùng' });

                return resolve({
                    error: false,
                    data: infoAfterUpdate,
                    message: 'Thay đổi mật khẩu tài khoản của bạn thành công'
                });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    updateStatus({ userID }){
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let infoUser = await USER_COLL.findById(userID);
                if(!infoUser)
                    return resolve({ error: true, message: 'Xảy ra lỗi. Không tìm thấy người dùng' });

                let infoUserAfterUpdate = await USER_COLL.findByIdAndUpdate(userID, { status: !infoUser.status }, { new: true })
                if(!infoUserAfterUpdate)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình cập nhật người dùng' });

                return resolve({ error: false, data: infoUserAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    isUserBlocking({ userID }){
        return new Promise(async resolve => {
            try {
                if(!ObjectID.isValid(userID))
                    return resolve({ error: true, message: 'Tham số không hợp lệ' });

                let infoUser = await USER_COLL.findById(userID);
                if(!infoUser)
                    return resolve({ error: true, message: 'Xảy ra lỗi. Không tìm thấy người dùng' });

                if(infoUser.status == this.STATUS_INACTIVE)
                    return resolve({ error: true, message: 'Xin lỗi tài khoản của bạn đã bị khóa. Không thể thực hiện thao tác này.' });

                return resolve({ error: false, message: 'USER_OK' });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }

    updateValidateInfo({ 
        userID,
        citizenIdentificationNo,
        drivingLicenseNo,
        citizenIdentificationFront,
        citizenIdentificationBack,
        drivingLicenseFront,
        drivingLicenseBack 
    }){
        return new Promise(async resolve => {
            try {
                let arrDataPreparePromiseAll = [];

                if(citizenIdentificationFront) {
                    arrDataPreparePromiseAll[arrDataPreparePromiseAll.length++] = IMAGE_MODEL.insert({
                        name: citizenIdentificationFront.name,
                        size: citizenIdentificationFront.size,
                        path: citizenIdentificationFront.path
                    });
                }

                if(citizenIdentificationBack) {
                    arrDataPreparePromiseAll[arrDataPreparePromiseAll.length++] = IMAGE_MODEL.insert({
                        name: citizenIdentificationBack.name,
                        size: citizenIdentificationBack.size,
                        path: citizenIdentificationBack.path
                    });
                }

                if(drivingLicenseFront) {
                    arrDataPreparePromiseAll[arrDataPreparePromiseAll.length++] = IMAGE_MODEL.insert({
                        name: drivingLicenseFront.name,
                        size: drivingLicenseFront.size,
                        path: drivingLicenseFront.path
                    });
                }

                if(drivingLicenseBack) {
                    arrDataPreparePromiseAll[arrDataPreparePromiseAll.length++] = IMAGE_MODEL.insert({
                        name: drivingLicenseBack.name,
                        size: drivingLicenseBack.size,
                        path: drivingLicenseBack.path
                    });
                }

                let resultPromiseAll = await Promise.all(arrDataPreparePromiseAll);

                let resultCitizenIdentificationFront = resultPromiseAll[0];
                let resultCitizenIdentificationBack = resultPromiseAll[1];
                let resultDrivingLicenseFront = resultPromiseAll[2];
                let resultDrivingLicenseBack = resultPromiseAll[3];

                console.log({ 
                    resultPromiseAll,
                    resultCitizenIdentificationFront,
                    resultCitizenIdentificationBack,
                    resultDrivingLicenseFront,
                    resultDrivingLicenseBack
                })

                let dataUpdate = {};

                if(!citizenIdentificationNo)
                    return resolve({ error: true, message: 'Vui lòng nhập số Căn cước công dân' });

                if(!drivingLicenseNo)
                    return resolve({ error: true, message: 'Vui lòng nhập số Giấy phép lái xe' });

                dataUpdate.citizenIdentificationNo = citizenIdentificationNo;
                dataUpdate.drivingLicenseNo = drivingLicenseNo;
                resultCitizenIdentificationFront && (dataUpdate.citizenIdentificationFront = resultCitizenIdentificationFront.data._id);
                resultCitizenIdentificationBack && (dataUpdate.citizenIdentificationBack = resultCitizenIdentificationBack.data._id);
                resultDrivingLicenseFront && (dataUpdate.drivingLicenseFront = resultDrivingLicenseFront.data._id);
                resultDrivingLicenseBack && (dataUpdate.drivingLicenseBack = resultDrivingLicenseBack.data._id);
                console.log({
                    resultCitizenIdentificationFront: resultCitizenIdentificationFront.data 
                })

                let infoUserAfterUpdate = await USER_COLL.findByIdAndUpdate(userID, dataUpdate, { new: true });
                if(!infoUserAfterUpdate)
                    return resolve({ error: true, message: 'Xảy ra lỗi trong quá trình xác thực thông tin cá nhân' });
                
                return resolve({ error: false, data: infoUserAfterUpdate });
            } catch (error) {
                return resolve({ error: true, message: error.message });
            }
        })
    }
}

exports.MODEL = new Model;
