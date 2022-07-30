'use strict'

const Config = use('Config');
const ActionFail = use('App/Models/ActionFail');
const RequestService = use('App/Services/RequestService');

class ActionTask {

    async cron() {
        setInterval(async () => {
            let fails = await ActionFail.query().with('action').where('quantity', '<=', Config.get('webhook.try')).limit(30).fetch();
            fails.toJSON().forEach(element => {
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
                                await ActionFail.query().where('id', '=', element.id).update({quantity: element.quantity + 1});
                            } else {
                                await ActionFail.query().where('id', '=', element.id).delete();
                            }
                        });
                    }
                }
            });
        }, Config.get('webhook.retryAfter'));
    }

}

module.exports = new ActionTask