'use strict'

const Event = use('App/Models/Event');
const EventLog = use('App/Models/EventLog');
const BaseController = use('App/Controllers/Http/BaseController');
const EventSystem = use('Event');

class WebhooksController extends BaseController {

    async listener({ params, request, response }) {
        if (params.event && params.event != '') {
            let event = await Event.query().where('name', '=', params.event).firstOrFail();
            let eventLog = new EventLog;
            let input = request.all();

            let fillable = {
                event_id: event.id,
                ip: request.ip(),
                method: request.method().toUpperCase(),
                user_agent: request.header('User-Agent', 'Unkown')
            };

            if (Object.keys(input).length > 0) {
                fillable.request = JSON.stringify(input);
            }

            eventLog.merge(fillable); 
            await eventLog.save();

            EventSystem.fire('event::request', { id: event.id, data: input });

            let retVal = this.getSuccessStatus();
            return response.json(retVal);
        }
    }

}

module.exports = WebhooksController