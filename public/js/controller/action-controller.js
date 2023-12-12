system.controller('ActionController', function ($scope, $rootScope, $http, $timeout) {

    this.prototype = new BaseController($scope, $rootScope);
    
    const DEFAULT_FILTER_LOG = { mode: $scope.searchModes[0].code };
    $scope.pageId = 0; $scope.pageSize = 50; $scope.pagesCount = 0;
    $scope.filter = {}; 
    $scope.filterLog = DEFAULT_FILTER_LOG;
    $scope.items = []; $scope.itemLogs = []; 
    $scope.item = {}; $scope.log = {};
    $scope.isSaving = false;
    $scope.dialog; $scope.logDialog;
    $scope.validate = {};

    $scope.methods = [
        { code: 'GET' },
        { code: 'POST' },
        { code: 'PUT' },
        { code: 'PATCH' },
        { code: 'DELETE' }
    ];

    $scope.statuses = [
        { code: 200 },
        { code: 500 },
        { code: 404 },
        { code: 403 },
        { code: 400 }
    ];

    $scope.init = async function () {
        $scope.dialog = new bootstrap.Modal(document.getElementById("actionDialog"), {});
        $scope.logDialog = new bootstrap.Modal(document.getElementById("logDialog"), {});
        $scope.events = await $scope.fetchEvent();
        $scope.find();
    }

    $scope.fetchEvent = function () {
        return new Promise (function (resolve) {
            $http.get('/service/event', {params: { pageSize: -1 }}).then(function (response) {
                if (response.data.status == STATUS_SUCCESS) {
                    resolve(response.data.data);
                } else {
                    resolve([]);
                }
            });
        })
    }

    $scope.clone = function (item) {
        $scope.item = angular.copy(item);
        delete $scope.item.id;
        $scope.dialog.show();
    }

    $scope.openDialog = function (item) {
        if (item) {
            $scope.item = angular.copy(item);
        } else {
            $scope.item = {};
        }
        $scope.dialog.show();
        $timeout(function () {
            // document.getElementById('action-endpoint').focus();
        }, 500);
    }

    $scope.enterEvent = function (event, type) {
        if (event.keyCode === 13 || event.which === 13) {
            if (type && type == 'log') {
                $scope.findLog();
            } else {
                $scope.pageId = 0;
                $scope.find();
            }
        }
    }

    $scope.find = function () {
        $http.get('/service/action', { params: $scope.buildFilterData() }).then(function (response) {
            if (response.data.status == STATUS_SUCCESS) {
                $scope.items = response.data.data;
                $scope.pagesCount = parseInt(response.data.pagesCount);
            } else {
                alert('Error. ' + response.data.message);
            }
        })
    }

    $scope.buildFilterData = function () {
        var retVal = {
            pageId: $scope.pageId,
            pageSize: $scope.pageSize
        };
        var fillable = ['terms', 'end_point', 'method', 'event_id'];
        fillable.forEach(function (field) {
            if ($scope.filter[field] && $scope.filter[field] != '') {
                retVal[field] = $scope.filter[field];
            }
        });
        return retVal;
    }

    $scope.remove = function (item) {
        var check = confirm('Do you want remove action "' + item.end_point + '" ?');
        if (check) {
            $http.delete('service/action/' + item.id).then(function (response) {
                if (response.data.status == STATUS_SUCCESS) {
                    for (var k in $scope.items) {
                        if ($scope.items[k].id == item.id) {
                            $scope.items.splice(k, 1);
                            break;
                        }
                    }
                } else {
                    alert('Error. ' + response.data.message);
                }
            });
        }
    }

    $scope.save = function () {
        var data = $scope._buildData();
        if (data) {
            $scope.isSaving = true;
            if (data.id) {
                var request = $http.patch('/service/action/' + data.id, data);
            } else {
                var request = $http.post('/service/action', data);
            }
            request.then(function (response) {
                if (response.data.status == STATUS_SUCCESS) {
                    if (data.id) {
                        for (var k in $scope.items) {
                            if ($scope.items[k].id == data.id) {
                                $scope.items[k] = response.data.data;
                                break;
                            }
                        }
                    } else {
                        $scope.items.unshift(response.data.data);
                    }
                    $scope.dialog.hide();
                } else {
                    alert('Error. ' + response.data.message);
                }
                $timeout (function () {
                    $scope.isSaving = false;
                }, 500);
            })
        }
    }

    $scope._buildData = function () {
        $scope.validate = {};
        if (!$scope.item.event_id || $scope.item.event_id == '') {
            $scope.validate.event_id = 'Event required!';
        }

        if (!$scope.item.end_point || $scope.item.end_point == '') {
            $scope.validate.end_point = 'Endpoint required!';
        } else if (!$scope.isValidLink($scope.item.end_point)) {
            $scope.validate.end_point = 'Endpoint invalid!';
        }

        if (!$scope.item.method || $scope.item.method == '') {
            $scope.validate.method = 'Method required!';
        }

        if (Object.keys($scope.validate).length > 0) {
            return false;
        }

        var retVal = angular.copy($scope.item);
        return retVal;
    }

    $scope.openLog = function (item) {
        $scope.filterLog = DEFAULT_FILTER_LOG;
        $scope.itemLogs = [];
        $scope.log = angular.copy(item);
        $scope.findLog();
        $scope.logDialog.show();
    }

    $scope.findLog = function () {
        if ($scope.log.id && $scope.log.id != '') {
            $http.get('/service/action/log/' + $scope.log.id, { params: $scope.filterLog }).then(function (response) {
                if (response.data.status == STATUS_SUCCESS) {
                    $scope.itemLogs = response.data.data;
                } else {
                    alert('Error. ' + response.data.message);
                }
            });
        }
        
    }

    $scope.resend = function (item) {
        $http.post('/service/action/resend', item).then(function (response) {
            if (response.data.status == STATUS_SUCCESS) {
                item.is_sent = 1;
            } else {
                alert('Error. ' + response.data.message);
            }
        });
    }

    $scope.init();

});