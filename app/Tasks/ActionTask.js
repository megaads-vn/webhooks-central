'use strict'

const Config = use('Config');
const ActionService = use('App/Services/ActionService');
const moment = require('moment');

class ActionTask {

    async cron() {
        setInterval(async () => {
            console.log("Retry Action Fail Execute", new Date());
            let failTime = moment().subtract(1, 'hours').format('YYYY-DD-MM HH:mm:ss');
            let fails = await ActionFail.query()
                                        .with('action')
                                        .where('quantity', '<=', Config.get('webhook.try'))
                                        .where('updated_at', '<', failTime)
                                        .orderBy('id', 'ASC')
                                        .limit(1000)
                                        .fetch();
                                        
            await ActionService.failAction(fails.toJSON());       
        }, Config.get('webhook.retryAfter'));
    }

}

module.exports = new ActionTask