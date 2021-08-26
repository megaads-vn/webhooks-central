'use strict'

class Token {
    async handle({ response, session }, next) {
        var sessionToken = session.get('token');
        if (sessionToken && sessionToken != '') {
            await next();
        } else {
            response.route('home');
        }
    }
}

module.exports = Token
