const { hooks } = require('@adonisjs/ignitor');

hooks.after.providersBooted(() => {
    const ActionTask = use('App/Tasks/ActionTask');
    ActionTask.cron();
});