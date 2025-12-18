'use strict'

const Model = use('Model');
const zlib = require('zlib');

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

    setRequest (value) {
        if (!value) return null;

        const compressed = zlib.gzipSync(Buffer.from(value, 'utf-8'));
        return compressed.toString('base64');
    }

    getRequest (value) {
        if (!value) return null;

        let buffer;
        if (typeof value === 'string') {
            buffer = Buffer.from(value, 'base64');
        } else {
            buffer = value;
        }
        const decompressed = zlib.gunzipSync(buffer);
        return decompressed.toString('utf-8');
    }

}

module.exports = ActionFail
