"use strict";

const express = require('express');

module.exports = function (app) {
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
};
