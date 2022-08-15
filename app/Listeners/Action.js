'use strict'

const ActionModel = use('App/Models/Action');
const RequestService = use('App/Services/RequestService');
const ActionFail = use('App/Models/ActionFail');

const Action = exports = module.exports = {}

Action.enforcement = async (event) => {
    let actions = await ActionModel.query().where('event_id', '=', event.id).whereNotNull('end_point').fetch();
    let inputJSON = '';
    if (Object.keys(event.data).length > 0) {
        inputJSON = JSON.stringify(event.data);
    }
    actions.toJSON().forEach(element => {
        if (!element.config || element.config == '' || inputJSON.indexOf(element.config) > -1) {
            RequestService(element, inputJSON, async (error, success) => {
                if (error) {
                    let failAction = new ActionFail;
                    failAction.merge(error.data);
                    await failAction.save();
                }
            });
        }
    });
}
