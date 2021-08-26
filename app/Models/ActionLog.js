'use strict'

const Model = use('Model')

class ActionLog extends Model {

    static get table () {
        return 'action_logs';
    }

    static get primaryKey () {
        return 'id';
    }

}

module.exports = ActionLog
