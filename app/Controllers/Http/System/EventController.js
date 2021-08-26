'use strict'

const Event = use('App/Models/Event');
const EventLog = use('App/Models/EventLog');
const BaseController = use('App/Controllers/Http/BaseController');
const { validate } = use('Validator');

class EventController extends BaseController {

    index({ view }) {
        let data = {
            title: 'Event'
        };
        return view.render('event.index', data);
    }

    async find({ params, request, response }) {
        let retVal = this.getSuccessStatus();
        let pageId = parseInt(request.input('pageId', 0));
        let pageSize = parseInt(request.input('pageSize', 30));
        if (params.id && params.id != '') {
            retVal.data = await Event.findOrFail(params.id);
        } else {
            let query = this._buildFilterData(Event.query(), request.all());
            if (pageSize > 0) {
                let recordCounts = await this._buildFilterData(Event.query(), request.all()).count("* AS recordsCount");
                if (recordCounts[0]) {
                    retVal.pagesCount = this.recordsCountToPagesCount(recordCounts[0].recordsCount, pageSize);
                }
                retVal.pageId = pageId;
                retVal.pageSize = pageSize;
                query.forPage(pageId + 1, pageSize).orderBy('id', 'desc');
            }
            retVal.data = await query.fetch();
        }
    
        return response.json(retVal);
    }

    async create({ request, response }) {
        const rules = {
            name: 'required',
            description: 'string'
        };

        const validation = await validate(request.all(), rules);
        if (validation.fails()) {
            let retVal = this.getValidateMessage(validation.messages());
            return response.status(400).json(retVal);
        }

        let event = new Event;
        let retVal = await this._buildData(event, request);
        return response.json(retVal);
    }

    async update({ params, request, response }) {
        let event = await Event.findOrFail(params.id);
        let retVal = await this._buildData(event, request);
        return response.json(retVal);
    }

    async delete ({ params, request, response }) {
        let retVal = this.getDefaultStatus();
        let event = await Event.findOrFail(params.id);
        let status = await event.delete();
        
        if (status) {
            await EventLog.query().where('action_id', '=', action.id).delete();
            retVal = this.getSuccessStatus();
            retVal.data = event;
        }
        
        return response.json(retVal);
    }

    async _buildData(event, request) {
        let result = this.getDefaultStatus();
        let input = request.only(['name', 'description']);

        if (input.name && input.name != '') {
            input.name = input.name.toLowerCase();
            let exists = await Event.findBy('name', input.name);
            if (exists && exists.id) {
                result.messages = 'Event name exists! Please check again...';
                return result;
            }
        }
        
        event.merge(input);
        let status = await event.save();

        if (status) {
            result = this.getSuccessStatus();
            result.data = await Event.find(event.id);
        }

        return result;
    }

    _buildFilterData(query, input) {
        if (input.terms && input.terms != '') {
            query.where(function (query) {
                query.where('name', 'LIKE', `%${input.terms}%`);
                query.orWhere('description', 'LIKE', `%${input.terms}%`);
            });
        }
        return query;
    }

    async log ({ params, request, response }) {
        let retVal = this.getSuccessStatus();
        let pageId = parseInt(request.input('pageId', 0));
        let pageSize = parseInt(request.input('pageSize', 30));
        
        let query = EventLog.query().where('event_id', '=', params.id);
        let input = request.all();
    
        if (input.terms && input.terms != '') {
            query.where(function (query) {
                query.where('ip', 'LIKE', `%${input.terms}%`);
                query.orWhere('user_agent', 'LIKE', `%${input.terms}%`);
                query.orWhere('data', 'LIKE', `%${input.terms}%`);
            });
        }
        if (input.method && input.method != '') {
            query.where('method', '=', input.method);
        }

        retVal.data = await query.forPage(pageId + 1, pageSize).orderBy('id', 'desc').fetch();
        return response.json(retVal);
    }
}

module.exports = EventController
