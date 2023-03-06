'use strict'

const Action = use('App/Models/Action');
const ActionLog = use('App/Models/ActionLog');
const ActionFail = use('App/Models/ActionFail');
const BaseController = use('App/Controllers/Http/BaseController');
const RequestService = use('App/Services/RequestService');
const ActionService = use('App/Services/ActionService');
const { validate } = use('Validator');

class ActionController extends BaseController {

    index({ view }) {
        let data = {
            title: 'Action'
        };
        return view.render('action.index', data);
    }

    async find({ params, request, response }) {
        let retVal = this.getSuccessStatus();
        let pageId = parseInt(request.input('pageId', 0));
        let pageSize = parseInt(request.input('pageSize', 30));
        if (params.id && params.id != '') {
            retVal.data = await Action.findOrFail(params.id);
        } else {
            let query = this._buildFilterData(Action.query(), request.all());
            let recordCounts = await this._buildFilterData(Action.query(), request.all()).count("* AS recordsCount");
            if (recordCounts[0]) {
                retVal.pagesCount = this.recordsCountToPagesCount(recordCounts[0].recordsCount, pageSize);
            }
            retVal.pageId = pageId;
            retVal.pageSize = pageSize;
            query.forPage(pageId + 1, pageSize).orderBy('id', 'desc');
            retVal.data = await query.fetch();
        }
    
        return response.json(retVal);
    }

    async create({ request, response }) {
        const rules = {
            end_point: 'required|string',
            event_id: 'required|number',
            method: 'required|string'
        };

        const validation = await validate(request.all(), rules);
        if (validation.fails()) {
            let retVal = this.getValidateMessage(validation.messages());
            return response.status(400).json(retVal);
        }

        let action = new Action;
        let retVal = await this._buildData(action, request);
        return response.json(retVal);
    }

    async update({ params, request, response }) {
        let action = await Action.findOrFail(params.id);
        let retVal = await this._buildData(action, request);
        return response.json(retVal);
    }

    async delete ({ params, request, response }) {
        let retVal = this.getDefaultStatus();
        let action = await Action.findOrFail(params.id);
        let status = await action.delete();
        
        if (status) {
            await ActionLog.query().where('action_id', '=', action.id).delete();
            retVal = this.getSuccessStatus();
            retVal.data = action;
        }
        
        return response.json(retVal);
    }

    async _buildData(action, request) {
        let result = this.getDefaultStatus();
        let input = request.only(['end_point', 'method', 'event_id', 'config']);        
        action.merge(input);
        let status = await action.save();

        if (status) {
            result = this.getSuccessStatus();
            result.data = await Action.find(action.id);
        }

        return result;
    }

    _buildFilterData(query, input) {
        if (input.terms && input.terms != '') {
            query.where('end_point', 'LIKE', '%' + input.terms + '%');
        }
        if (input.method && input.method != '') {
            query.where('method', '=', input.method);
        }
        if (input.event_id && input.event_id != '') {
            query.where('event_id', '=', input.event_id);
        }
        return query;
    }

    async log ({ params, request, response }) {
        let retVal = this.getSuccessStatus();
        let pageId = parseInt(request.input('pageId', 0));
        let pageSize = parseInt(request.input('pageSize', 30));
        
        let query = ActionLog.query().where('action_id', '=', params.id);
        let input = request.all();
        
        if (input.status_code && input.status_code != '') {
            query.where('status_code', '=', input.status_code);
        }

        if (input.terms && input.terms != '') {
            query.whereRaw('MATCH(request, response) AGAINST(? IN NATURAL LANGUAGE MODE)', [input.terms]);
        }

        retVal.data = await query.forPage(pageId + 1, pageSize).orderBy('id', 'desc').fetch();
        return response.json(retVal);
    }

    async resend ({ request, response }) {
        let retVal = this.getDefaultStatus();
        let input = request.input('request');
        let action = await Action.find(request.input('action_id'));
        if (action.id) {
            retVal = this.getSuccessStatus();
            RequestService(action.toJSON(), input, function (error, statusCode) {
                console.log("statusCode", statusCode);
            });
        }
        return response.json(retVal);
    }

    async retry({ request, response }) {
        let fails = await ActionFail.query()
                            .with('action')
                            .orderBy('id', 'DESC')
                            .limit(1000)
                            .fetch();
                            
        await ActionService.failAction(fails.toJSON()).catch(error => {
            console.log("Retry Action Manual", error);
        });

        let retVal = this.getSuccessStatus();
        return response.json(retVal);
    }
}

module.exports = ActionController
