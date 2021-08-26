'use strict'

const Model = use('Model')

class Action extends Model {

    static get table () {
        return 'actions';
    }

    static get primaryKey () {
        return 'id';
    }

}

module.exports = Action
