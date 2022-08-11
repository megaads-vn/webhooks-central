'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {import('@adonisjs/framework/src/Route/Manager'} */
const Route = use('Route')

Route.get('/', 'HomeController.index').as('home');
Route.post('/authenticate', 'HomeController.authenticate').as('authenticate');
Route.route('/listener/:event', 'WebhooksController.listener', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).as('listener');
Route.get('/events', 'System/EventController.index').as('events').middleware(['token']);
Route.get('/actions', 'System/ActionController.index').as('actions').middleware(['token']);

Route.group(() => {
    Route.get('event/log/:id', 'System/EventController.log').as('logEvent');
    Route.get('event/:id?', 'System/EventController.find').as('findEvent');
    Route.post('event', 'System/EventController.create').as('createEvent');
    Route.patch('event/:id', 'System/EventController.update').as('updateEvent');
    Route.delete('event/:id', 'System/EventController.delete').as('deleteEvent');

    Route.get('action/log/:id', 'System/ActionController.log').as('logAction');
    Route.post('action/resend', 'System/ActionController.resend').as('resendAction');
    Route.route('action/retry', 'System/ActionController.retry', ['GET', 'POST', 'PUT']).as('retryAction');
    Route.get('action/:id?', 'System/ActionController.find').as('findAction');
    Route.post('action', 'System/ActionController.create').as('createAction');
    Route.patch('action/:id', 'System/ActionController.update').as('updateAction');
    Route.delete('action/:id', 'System/ActionController.delete').as('deleteAction');
}).prefix('service').middleware(['token']);