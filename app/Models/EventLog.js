'use strict'

const Model = use('Model')

class EventLog extends Model {

    static get table () {
        return 'event_logs';
    }

    static get primaryKey () {
        return 'id';
    }

}

module.exports = EventLog
