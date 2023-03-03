'use strict'

const RequestService = use('App/Services/RequestService');
const ActionFail = use('App/Models/ActionFail');

class ActionService {

    async failAction(failLists) {
        failLists.forEach(element => {
            let inputJSON = '';
            if (element.request && element.request != '') {
                inputJSON = element.request;
            }
            if (element.action && element.action.id) {
                let action = element.action;
                if (!action.config || action.config == '' || inputJSON.indexOf(action.config) > -1) {
                    action.retry = 1;
                    RequestService(action, inputJSON, async (error, success) => {
                        if (error) {
                            console.log("RequestService", error);
                            await ActionFail.query().where('id', '=', element.id).update({quantity: element.quantity + 1});
                        } else {
                            await ActionFail.query().where('id', '=', element.id).delete();
                        }
                    });
                }
            }
        });
    }

}

module.exports = new ActionService