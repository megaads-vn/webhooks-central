'use strict'

const Model = use('Model')

class Event extends Model {

    static get table () {
        return 'events';
    }

    static get primaryKey () {
        return 'id';
    }

}

module.exports = Event
