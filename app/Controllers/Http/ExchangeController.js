'use strict'

const BaseController = use('App/Controllers/Http/BaseController');
const RequestService = require("request");
const Config = use('Config');

class ExchangeController extends BaseController {

    _fetchExchangeRate(params, input) {
        return new Promise((resolve, reject) => {
            let exchangeRateApi = Config.get('api.exchange_rates');
            RequestService.get({
                url: exchangeRateApi.host + '/exchangerates_data/' + params.type + '?' + new URLSearchParams(input).toString(),
                headers: {
                    apikey: exchangeRateApi.secrets[new Date().getDay()]
                }
            }, (error, response, body) => {
                if (error) {
                    console.error("Request Exchange API:", error); 
                    reject(error);
                }
                resolve(body);
            });
        });
    }

    async _setCache(cacheKey, params, input) {
        let exchangeResult = await this._fetchExchangeRate(params, input).catch((error) => { 
            return null;
        });
        if (exchangeResult) {
            global.cacheData[cacheKey] = {
                data: exchangeResult,
                params: params,
                input: input
            };
        }
        return exchangeResult;
    }

    async index({ params, request, response }) {
        let input = request.all();
        if (!input.base) {
            input.base = 'EUR';
        }
        let cacheKey = params.type + '-' + input.base;
        if (global.cacheData[cacheKey]) {
            return response.json(global.cacheData[cacheKey].data);
        }
        
        return response.json(await this._setCache(cacheKey, params, Object.assign({}, input)));
    }

    async refresh({ request, response }) {
        let retVal = this.getSuccessStatus();
        for (let cacheKey in global.cacheData) {
            let { params, input } = global.cacheData[cacheKey];
            let exchangeResult = await this._setCache(cacheKey, params, input);
            if (!exchangeResult) {
                delete global.cacheData[cacheKey];
            }
        }
        return response.json(retVal);
    }

}

module.exports = ExchangeController