var app = angular.module('dragAndDrop', []);


app.controller("DragAndDropItemController" , ['$scope', '$element','$document' , function($scope, $element, $document){

    $scope.init = function (data) {
        $scope.data = data;
    }

    var mousemove =function (event) {
        $element.css({
            top : event.pageY + 5,
            left : event.pageX + 5,
            visibility:"visible"
        });
    }

    $document.bind('mousemove', mousemove);

    $scope.$on("$destroy", function() {
        $document.unbind('mousemove', mousemove);
    });
}]);

app.controller("DragAndDropController" , ['$scope', 'dragAndDrop', '$document' , function($scope, dragAndDrop, $document){

    $scope.items = dragAndDrop.datas;
}]);




app.factory('dragAndDrop', function () {

    var Service = function () {
        this.counter = 0;
        this.datas = {};
    }

    Service.prototype.allocateId = function () {
        return "dd" + this.counter++;
    }

    Service.prototype.setData = function (id, data, success, include, width, height) {
        this.datas[id] = {data: data, include: include, width: width, height: height, callback: success};
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

            var mouseUp =  function (evt) {
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
            }

            element.bind('mouseup' , mouseUp);

            scope.$on("$destroy", function() {
                element.unbind('mouseup' , mouseUp);
            });
        }
    }
}]);


app.directive("drag", ["$rootScope", "dragAndDrop", "$document", "$controller", function ($rootScope, dragAndDrop, $document, $controller) {

    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var dragInclude = scope.$eval(attrs.dragInclude);

            var success = function () {
                if (attrs.dropCallback) {
                    var dropCallback = scope.$eval(attrs.dropCallback);
                    if (angular.isFunction(dropCallback)) {
                        dropCallback(dragAndDrop.getData(id));
                    }
                }
            };

            var mouseUp = function (evt) {
                scope.$apply(function () {
                    dragAndDrop.removeData("mouse");
                });
            }

            var mouseDown = function (evt) {
                evt.preventDefault();
                scope.$apply(function () {
                    if (attrs.dragData) {
                        dragAndDrop.setData("mouse", scope.$eval(attrs.dragData), success,dragInclude, element[0].offsetWidth, element[0].offsetHeight);
                    }
                });
            }

            $document.bind('mouseup', mouseUp);
            element.bind('mousedown', mouseDown);

            scope.$on("$destroy", function() {
                $document.unbind('mouseup', mouseUp);
                element.unbind('mousedown', mouseDown);
            });

        }
    }
}]);
