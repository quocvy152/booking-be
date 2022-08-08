"use strict";

let moment = require('moment-timezone');
let timeConf = require('../config/cf_time');

function setTimeZone(date) {
    return moment.tz(date, timeConf._default_tme_zone);
}
exports.getCurrentTime = function () {
    return setTimeZone(new Date()).format('Y-MM-DD H:m:sZ');
};

exports.parseFormat1 = function (oldTimeFormat) {
    return setTimeZone(oldTimeFormat).format('Y-MM-DD | H:m');
};

exports.parseFormat2 = function (oldTimeFormat) {
    return setTimeZone(oldTimeFormat).format('H:mm DD-MM-Y');
};

exports.parseFormat3 = function (oldTimeFormat) {
    return setTimeZone(oldTimeFormat).format('MM-DD-Y');
};

exports.parseTimeFormat4 = function (oldTimeFormat) {
    return setTimeZone(oldTimeFormat).format('HH:mm DD/MM/Y');
};

exports.parseTimeFormat5 = function (oldTimeFormat) {
    return setTimeZone(oldTimeFormat).format('DD/MM/Y');
};

exports.parseTimeFormatOption = function (oldTimeFormat, format) {
    return setTimeZone(oldTimeFormat).format(format);
};


/**
 * compare time
 * if time1 > time2: return 1
 * if time1 < time2: return 2
 * if time1 = time2: return 0
 * @param time1
 * @param time2
 * @returns {number}
 */
exports.compareTwoTime = function (time1, time2) {
    let a = (new Date(time1)).getTime();
    let b = (new Date(time2)).getTime();
    if (a > b) {
        return 1;
    } else if (b > a) {
        return 2;
    } else {
        return 0;
    }
};

exports.getTimeBetween = function (time1, time2) {
    let a = (new Date(time1)).getTime();
    let b = (new Date(time2)).getTime();
    return (a - b) / (1000);
};

exports.addMinuteToDate = function (dateAdded, minute) {
    return new Date((new Date(dateAdded)).getTime() + minute * 60000);
};

exports.subMinuteToDate = function (subAdded, minute) {
    return new Date((new Date(subAdded)).getTime() - minute * 60000);
};
// Hàm trừ ngày
exports.subDate = function (dates) {
    let d = new Date();
    d.setDate(d.getDate() - dates);
    return d;
};

// Hàm cộng ngày
exports.addDate = function (dates) {
    let d = new Date();
    d.setDate(d.getDate() + dates);
    return d;
};

exports.betweenTwoDateResultMinute = (today, endDate) => {
    // ref: https://www.codegrepper.com/code-examples/javascript/get+minutes+between+two+dates+in+javascript
    const minutes = parseInt(Math.abs(endDate.getTime() - today.getTime()) / (1000 * 60) % 60);
    return minutes;
}

exports.betweenTwoDateResultSeconds = (today, endDate) => {
    // ref: https://www.codegrepper.com/code-examples/javascript/get+minutes+between+two+dates+in+javascript
    const seconds = parseInt(Math.abs(endDate.getTime() - today.getTime()) / (1000) % 60); 
    return seconds;
}

exports.betweenTwoDateResult = (today, endDate) => {
    // ref: https://www.codegrepper.com/code-examples/javascript/get+minutes+between+two+dates+in+javascript
    const days = parseInt((endDate - today) / (1000 * 60 * 60 * 24));
    const hours = parseInt(Math.abs(endDate - today) / (1000 * 60 * 60) % 24);
    const minutes = parseInt(Math.abs(endDate.getTime() - today.getTime()) / (1000 * 60) % 60);
    const seconds = parseInt(Math.abs(endDate.getTime() - today.getTime()) / (1000) % 60); 
    return {
        days, hours, minutes, seconds
    };
}