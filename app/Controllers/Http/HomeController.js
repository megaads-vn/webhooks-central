'use strict'

const Env = use('Env');

class HomeController {

    index({ response, session, view }) {
        var sessionToken = session.get('token');
        if(sessionToken && sessionToken != '') {
            return response.route('events');
        }
        return view.render('welcome');
    }

    authenticate({ request, response, view, session }) {
        var sessionToken = session.get('token');
        if(sessionToken && sessionToken != '') {
            return response.route('events');
        }

        var body = request.post();
        if (body['token'] && body['token'] != '') {
            if (Env.getOrFail('APP_TOKEN') === body['token']) {
                session.put('token', body['token']);
                response.route('events');
            }
        }
        return view.render('welcome', {status: 'Invalid token...'});
    }

}

module.exports = HomeController
