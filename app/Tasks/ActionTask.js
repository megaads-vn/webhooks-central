'use strict'

const Config = use('Config');
const ActionService = use('App/Services/ActionService');
const moment = require('moment');
const ActionFail = use('App/Models/ActionFail');

class ActionTask {

    async cron() {
        setInterval(async () => {
            console.log("Retry Action Fail Execute", new Date());
            let fails = await ActionFail.query()
                                        .with('action')
                                        .where('quantity', '<=', Config.get('webhook.try'))
                                        .orderBy('id', 'ASC')
                                        .limit(1000)
                                        .fetch();
                                        
            await ActionService.failAction(fails.toJSON()).catch(error => {
                console.log("ActionTask", error);
            });       
            
        }, Config.get('webhook.retryAfter'));
    }

}

module.exports = new ActionTask