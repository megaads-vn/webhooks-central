system.controller('EventController', function ($scope, $rootScope, $http, $timeout, $window) {
    
    this.prototype = new BaseController($scope, $rootScope);
    $scope.pageId = 0; $scope.pageSize = 50; $scope.pagesCount = 0;
    $scope.filter = {}; $scope.filterLog = {};
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

    $scope.init = function () {
        $scope.dialog = new bootstrap.Modal(document.getElementById("eventDialog"), {});
        $scope.logDialog = new bootstrap.Modal(document.getElementById("logDialog"), {});
        $scope.find();
    }

    $scope.openDialog = function (item) {
        if (item) {
            $scope.item = angular.copy(item);
        } else {
            $scope.item = {};
        }
        $scope.dialog.show();
        $timeout(function () {
            document.getElementById('event-name').focus();
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
        $http.get('/service/event', { params: $scope.buildFilterData() }).then(function (response) {
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
        var fillable = ['terms'];
        fillable.forEach(function (field) {
            if ($scope.filter[field] && $scope.filter[field] != '') {
                retVal[field] = $scope.filter[field];
            }
        });
        return retVal;
    }

    $scope.remove = function (item) {
        var check = confirm('Do you want remove event "' + item.name + '" ?');
        if (check) {
            $http.delete('service/event/' + item.id).then(function (response) {
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
                var request = $http.patch('/service/event/' + data.id, data);
            } else {
                var request = $http.post('/service/event', data);
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
        if (!$scope.item.name || $scope.item.name == '') {
            $scope.validate.name = 'Name required!';
        }

        if (Object.keys($scope.validate).length > 0) {
            return false;
        }

        var retVal = angular.copy($scope.item);
        return retVal;
    }

    $scope.openLog = function (item) {
        $scope.filterLog = {};
        $scope.itemLogs = [];
        $scope.log = angular.copy(item);
        $scope.findLog();
        $scope.logDialog.show();
    }

    $scope.findLog = function () {
        if ($scope.log.id && $scope.log.id != '') {
            $http.get('/service/event/log/' + $scope.log.id, { params: $scope.filterLog }).then(function (response) {
                if (response.data.status == STATUS_SUCCESS) {
                    $scope.itemLogs = response.data.data;
                } else {
                    alert('Error. ' + response.data.message);
                }
            });
        }
    }

    $scope.getCopyUrl = function (name, event) {
        if (name && name != '') {
            var currentURL = new URL($window.location.href);
            return currentURL.origin + '/listener/' + name;
        }
    }

    $scope.init();
});