'use strict'

const request = require("request");
const ActionLog = use('App/Models/ActionLog');

function RequestService(action, input, callback) {
    let params = {
        uri: action.end_point,
        method: action.method,
        timeout: 5 * 60 * 1000
    };

    if (action.method != 'GET' && input != '') {
        params.body = JSON.parse(input);
        params.json = true;
    }
    console.log("request", params);
    request(params, async (error, response, body) => {
        let logAction = new ActionLog;
        let fillable = {
            action_id: action.id,
        };
        if (input != '') {
            fillable.request = input;
        }
        
        if (response && response.statusCode) {
            fillable.status_code = response.statusCode || 500;
        } 
        
        if (error) {
            fillable.response = JSON.stringify(error);
        } else if (body) {
            try {
                let parseBody = JSON.parse(body);
                fillable.response = JSON.stringify(parseBody);
            } catch (er) {
                fillable.response = JSON.stringify(body);
            }
        }

        logAction.merge(fillable);
        await logAction.save();

        if (callback) {
            if (!response) {
                let errorCallback = {
                    action_id: action.id,
                    request: input,
                    quantity: 0
                };
                callback(errorCallback, null);
            } else {
                callback(null, response.statusCode);
            }
        }
    });
}

module.exports = RequestService