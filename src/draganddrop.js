var app = angular.module('dragAndDrop', []);


/**
 * Controller for dragged item
 */
app.controller("DragAndDropItemController", ['$scope', '$element', '$document' , function ($scope, $element, $document) {

    $scope.init = function (value) {
        $scope.value = value;
        $scope.value.$element = $element;
    }

}]);

/**
 * Controller for all dragged items
 */
app.controller("DragAndDropController", ['$rootScope' , '$scope', 'dragAndDrop', '$document' , function ($rootScope , $scope, dragAndDrop, $document) {

    //mouse up : d&d ended, remove the associated data
    var mouseUp = function (evt) {
        console.log("mouse up DragAndDropController");
        $scope.$apply(function () {
            dragAndDrop.removeData("mouse");
        });
    }

    var touchEnd = function (evt) {
        $scope.$apply(function () {
            for (var ite = 0 ; ite < evt.changedTouches.length ; ite++){
                var currentTouch = evt.changedTouches[ite];
                if (dragAndDrop.hasData(currentTouch.identifier)) {
                    $rootScope.$emit("touchend" , currentTouch);
                    dragAndDrop.removeData(currentTouch.identifier)
                }
            }
        });
    }


    //dragged item follows mouse
    var mousemove = function (evt) {
        /**/
        if (dragAndDrop.hasData("mouse")) {

            dragAndDrop.getData("mouse").$element.css({
                top: evt.pageY + 5,
                left: evt.pageX + 5,
                visibility: "visible"
            });

        }
    }
    //dragged item follows mouse
    var touchmove = function (evt) {
        for (var ite = 0 ; ite < evt.targetTouches.length ; ite++){
            var currentTouch = evt.targetTouches[ite];
            if (dragAndDrop.hasData(currentTouch.identifier)) {
                dragAndDrop.getData(currentTouch.identifier).$element.css({
                    top: currentTouch.pageY + 5,
                    left: currentTouch.pageX + 5,
                    visibility: "visible"
                });
                                evt.stopPropagation();
                                evt.preventDefault();
            }
        }
    }

    $document.bind('mousemove', mousemove);
    $document.bind('touchmove', touchmove);

    //Mouse up on document to remove d&d which bubbled to document
    $document.bind('mouseup', mouseUp);
    //Touch end on document to emit Touch to drop directives
    $document.bind('touchend', touchEnd);

    $scope.$on("$destroy", function () {
        $document.unbind('mouseup', mouseUp);
        $document.unbind('touchend', touchEnd);
        $document.unbind('mousemove', mousemove);
        $document.unbind('touchmove', touchmove);
    });

    $scope.items = dragAndDrop.datas;
}]);


/**
 * Drag&Drop service, holds dragged item data
 */
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
        if (this.datas[id]) {
            delete this.datas[id];
        }
    }

    Service.prototype.hasData = function (id) {
        return this.datas[id] != null;
    }

    return new Service();

});


app.directive("drop", ['$rootScope', "dragAndDrop", "$document", function ($rootScope, dragAndDrop, $document) {

    return {
        restrict: 'A',
        link: function (scope, $element, attrs) {

            function doDrop(identifier, target){
                if (attrs.dropCallback) {
                    var result = scope.$eval(attrs.dropCallback);
                    if (angular.isFunction(result)) {
                        result(dragAndDrop.getData(identifier).data);
                    }
                }
                dragAndDrop.getData(identifier).callback();
                dragAndDrop.removeData(identifier);
            }

            var mouseUp = function (evt) {
                if (!dragAndDrop.hasData("mouse")) {
                    return;
                }
                evt.stopPropagation();
                evt.preventDefault();
                scope.$apply(function () {
                    doDrop("mouse");
                });
            }

            var touchend = function (s,currentTouch) {
                var touchEndElement = $document[0].elementFromPoint(currentTouch.pageX, currentTouch.pageY);
                if ($element[0].compareDocumentPosition(touchEndElement) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
                    doDrop(currentTouch.identifier);
                }
            }


            $rootScope.$on("touchend" , touchend);


            //A mouseup occurs on the target element
            $element.bind('mouseup', mouseUp);

            scope.$on("$destroy", function () {
                $element.unbind('mouseup', mouseUp);
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

            var mouseDown = function (evt) {
                evt.preventDefault();
                scope.$apply(function () {
                    if (attrs.dragData) {
                        dragAndDrop.setData("mouse", scope.$eval(attrs.dragData), success, dragInclude, element[0].offsetWidth, element[0].offsetHeight);
                    }
                });
            }
            var touchstart = function (evt) {
                evt.preventDefault();
                scope.$apply(function () {
                    for (var ite = 0 ; ite < evt.targetTouches.length ; ite++){
                        var currentTouch = evt.targetTouches[ite];
                        if (attrs.dragData) {
                            dragAndDrop.setData(currentTouch.identifier, scope.$eval(attrs.dragData), success, dragInclude, element[0].offsetWidth, element[0].offsetHeight);
                        }
                    }
                });
            }


            element.bind('mousedown', mouseDown);
            element.bind('touchstart', touchstart);

            scope.$on("$destroy", function () {
                element.unbind('mousedown', mouseDown);
                element.unbind('touchstart', touchstart);
            });

        }
    }
}]);
