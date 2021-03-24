/*!
 * RCM Client v1.0.0
 * Copyright(c) 2020-2021 REMOSI TECHNOLOGY OU.
 * MIT Licensed
 */

'use strict';

/**
 * Module exports.
 * @public
 */

module.exports = RCMClient;

/**
 * Module dependencies.
 */

const axios = require('axios');


/**
 * Create an RCMClient.
 * @api public
 */

function RCMClient(config) {
    this.server = (config.server != undefined) ? config.server : 'config.remosi.net';
    this.protocol = config.protocol ? config.protocol : 'https';
    this.port = config.port;
    this.refreshInterval = config.refreshInterval ? config.refreshInterval : 60 * 60 * 3;
    this.token = config.token;
    this.configName = config.configName;
}

/**
 * Create service URL
 *
 * @return {string} Service URL
 */

RCMClient.prototype.getServiceURL = function (configName) {
    let URL = '';
    if (this.port == undefined) {
        URL = `${this.protocol}://${this.server}/v1/config/${configName}`;
    } else {
        URL = `${this.protocol}://${this.server}:${this.port}/v1/config/${configName}`;
    }
    return URL;
}


/**
 * Create an instance of Axios
 *
 * @param {string} configName The configuration name
 * @return {Promise} A promise for result
 */

RCMClient.prototype.load = async function (configName) {
    if (configName == undefined) {
        return Promise.reject(Error("Invalid parameters!"))
    }
    let URL = this.getServiceURL(configName);
    try {
        let response = await axios({
            method: 'get',
            url: URL,
            headers: {
                Authorization: "Bearer " + this.token
            }
        });
        let parsedContent = this.parser(response.data);
        return Promise.resolve(
            {
                content: parsedContent.content,
                payload: { created: parsedContent.payload.CREATED, updated: parsedContent.payload.UPDATED }
            });
    } catch (e) {
        return Promise.reject(e);
    }
}


/**
 * Parse configuration data
 *
 * @param {string} data The return config data
 * @return {object} The parsed config data
 */

RCMClient.prototype.parser = function (data) {
    let lines = data.split("\n");
    let payload = {};
    let payloadFlag = true;
    let content = '';

    for (let i = 0; i < lines.length; i++) {
        let item = lines[i].split(': ');
        if ((item.length == 1) || (item == '')) {
            payloadFlag = false;
        }
        if (payloadFlag) {
            payload[item[0].trim()] = item[1].trim();
        } else {
            content += lines[i];
        }
    }
    if (payload.CODEC == 'BASE64') content = Buffer.from(content, 'base64').toString('utf-8');
    if (payload.FORMAT == 'JSON') content = JSON.parse(content);

    return { payload: payload, content: content }
}