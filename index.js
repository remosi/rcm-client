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
const YAML = require('yaml');


/**
 * Create an RCMClient.
 * @api public
 */

function RCMClient(config) {
    this.server = (config.server != undefined) ? config.server : 'config.remosi.net';
    this.protocol = config.protocol ? config.protocol : 'https';
    this.port = config.port;
    this.token = config.token;
    this.decode = config.decode ? config.decode : false;
    this.configName = config.configName;
    this.events = { update: (info) => { } }
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
                payload: {
                    created: parsedContent.payload.CREATED,
                    updated: parsedContent.payload.UPDATED,
                    action: parsedContent.payload.UACTION
                }
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
            content += lines[i] + "\n";
        }
    }
    if (payload.CODEC == 'BASE64') content = Buffer.from(content, 'base64').toString('utf-8');
    if (this.decode) {
        if (payload.FORMAT == 'JSON') content = JSON.parse(content);
        if (payload.FORMAT == 'YAML') content = YAML.parse(content);
    }
    return { payload: payload, content: content }
}

/**
 * Set event functions
 *
 * @param {string} eventName Name of event to assign callback
 * @param {function} cb callback function
 */

RCMClient.prototype.on = function (eventName, cb) {
    this.events[eventName] = cb;
}


/**
 * Watch configuration file
 *
 * @param {string} configName Name of configuration to watch
 * @param {number} watchInterval The watch interval in milliseconds
 */

RCMClient.prototype.watch = async function (configName, watchInterval) {

    watchInterval = watchInterval ? watchInterval : 60 * 1000; // check every one minute by default

    let initialConfig = await this.load(configName);
    let lastUpdate = initialConfig.payload.updated;

    setInterval(() => {
        this.load(configName).then(periodicConfig => {
            if (periodicConfig.payload.updated != lastUpdate) {
                this.events.update({ configName: configName, action: periodicConfig.payload.action, content: periodicConfig.content });
                lastUpdate = periodicConfig.payload.updated;
            }
        }).catch(e => {
            console.log(e);
        });
    }, watchInterval);
}