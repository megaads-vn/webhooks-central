'use strict'

const BaseController = use('App/Controllers/Http/BaseController');

class WebhooksController extends BaseController {

    listener({ params, response }) {
        return response.json(params);
    }
}

module.exports = WebhooksController