"use strict";

const crypto = require('crypto');

exports.md5 = function (value) {
    return crypto.createHash('md5').update(JSON.stringify(value)).digest("hex");
};

exports.sha1 = function (value) {
    return crypto.createHash('sha1').update(JSON.stringify(value)).digest('hex');
};

exports.randomString = function () {
    return crypto.randomBytes(64).toString('hex');
};

exports.randomStringFixLength = function (count) {

    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    for (let i = 0; i < count; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

exports.randomNumbers = function(n) {
    var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   
    if ( n > max ) {
        return generate(max) + generate(n - max);
    }
    max        = Math.pow(10, n+add);
    var min    = max/10; // Math.pow(10, n) basically
    var number = Math.floor( Math.random() * (max - min + 1) ) + min;
    return ("" + number).substring(add); 
}

exports.randomStringFixLengthCode = function (count) {
    let text = "";
    let possible = "abcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < count; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

exports.randomStringFixLengthOnlyAlphabet = function (count) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < count; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

exports.randomStringUpperCaseAndNumber = length => {
	let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


exports.getBytes = function (string) {
    string = (string == null) ? "" : string;
    return Buffer.byteLength(string, 'utf8')
};

exports.encode = function (text) {
    text = (text == null) ? "" : text;
    return new Buffer(text + '').toString('base64')
};

exports.decode = function (text) {
    text = (text == null) ? "" : text;
    return new Buffer(text + '', 'base64').toString('ascii');
};

exports.replaceAll = function (str, find, replace) {
    while (str.indexOf(find) > -1) {
        str = str.replace(find, replace);
    }
    return str;
};

exports.validURL = function (str) {
    var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(str);
};

exports.validUserName = function (userName) {
    var usernameRegex = /^[a-zA-Z0-9]+$/;
    var validUsername = userName.match(usernameRegex);
    return validUsername != null
};

exports.validEmail = function (email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

let removeUtf8 = function (str) {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    // str = str.replace(/\W+/g, ' ');
    str = str.replace(/\s/g, '-');
    str = str.replace(/[^a-zA-Z0-9]/g, '_');

    let max = 10;
    for (let index = max; index >= 0; index--) {
        let inc_ = "";
        for (let index2 = 0; index2 <= index; index2++) {
            inc_ += "_";
        }
        str = str.replace(inc_, '_');
    }
    return str;
};
exports.removeUtf8 = removeUtf8;

exports.listCharacter = function () {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
};

exports.randomStringOnlyNumber = function (count) {

    let text = "";
    let possible = "0123456789";
    for (let i = 0; i < count; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

exports.GENERATE_CODE_CHARACTERISTIC = function (name) {
    let nameAfterRemoveUTF8 = removeUtf8(name);

    let code = nameAfterRemoveUTF8.toUpperCase().split('_').join('');

    return code;
};