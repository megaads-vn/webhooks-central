'use strict'

const Model = use('Model')

class ActionFail extends Model {

    static get table () {
        return 'action_fails';
    }

    static get primaryKey () {
        return 'id';
    }

    action () {
        return this.hasOne('App/Models/Action', 'action_id', 'id');
    }

}

module.exports = ActionFail
