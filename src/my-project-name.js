var app = angular.module('admin', []);


function DragAndDropItemController($scope, $rootScope, dragAndDrop) {
    $scope.init = function (data) {
        $scope.data = data;
    }
}

function DragAndDropController($scope, $rootScope, dragAndDrop, $document) {
    $scope.items = dragAndDrop.datas;

    $scope.left = 0;
    $scope.top = 0;

    $document.bind('mousemove', function (event) {
        $scope.$apply(function () {
            $scope.top = event.pageY + 5;
            $scope.left = event.pageX + 5;
        });
    });
}


function SampleController($scope, $http) {
    $scope.items = [
        {title: "a"},
        {title: "b"},
        {title: "c"}
    ];

    $scope.items2 = [];

    $scope.dragged = null;

    $scope.dropped = null;

    $scope.myFilter = function (search) {
        return function (site) {

            if (search && search.zeroEntry != null) {
                if (search.zeroEntry) {
                    return !site.histogram.maxEntry;
                } else {
                    return true;
                }
            } else {
                return true;
            }

        }
    }

    $scope.endDrag = function (data) {
        $scope.items.splice(data, 1);
    }

    $scope.endDrop = function (data) {
        $scope.items2.push(angular.copy(data));
    }

}


app.factory('dragAndDrop', function () {

    var Service = function () {
        this.counter = 0;
        this.datas = {};
    }

    Service.prototype.allocateId = function () {
        return "dd" + this.counter++;
    }

    Service.prototype.setData = function (id, data, success, controller, width, height) {
        this.datas[id] = {data: data, ctrl: controller, width: width, height: height, callback: success};
    }

    Service.prototype.getData = function (id) {
        return this.datas[id];
    }

    Service.prototype.removeData = function (id) {
        delete this.datas[id];
    }

    Service.prototype.hasData = function (id) {
        return this.datas[id] != null;
    }

    return new Service();

});


app.directive("drop", ['$rootScope', "dragAndDrop", function ($rootScope, dragAndDrop) {


    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            element.bind('mouseup', function (evt) {
                if (!dragAndDrop.hasData("mouse")){
                    return;
                }
                evt.stopPropagation();
                evt.preventDefault();
                scope.$apply(function () {
                    if (attrs.dropCallback) {
                        var result = scope.$eval(attrs.dropCallback);
                        if (angular.isFunction(result)) {
                            result(dragAndDrop.getData("mouse").data);
                        }
                    }
                    dragAndDrop.getData("mouse").callback();
                    dragAndDrop.removeData("mouse");
                });
            });


        }
    }
}]);


app.directive("drag", ["$rootScope", "dragAndDrop", "$document", function ($rootScope, dragAndDrop, $document) {

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var success = function () {
                if (attrs.dropCallback) {
                    var dropCallback = scope.$eval(attrs.dropCallback);
                    if (angular.isFunction(dropCallback)) {
                        dropCallback(dragAndDrop.getData(id));
                    }
                }
            };

            $document.bind('mouseup', function (evt) {
                scope.$apply(function () {
                    dragAndDrop.removeData("mouse");
                });
            });

            element.bind('mousedown', function (evt) {
                evt.preventDefault();
                scope.$apply(function () {
                    if (attrs.dragData) {
                        dragAndDrop.setData("mouse", scope.$eval(attrs.dragData), success,DragAndDropItemController, element[0].offsetWidth, element[0].offsetHeight);
                    }
                });
            });

        }
    }
}]);
