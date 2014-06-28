'use strict';

(function (app) {

    var $DESTROY = "$destroy"

    var MOUSEDOWN = "mousedown";
    var MOUSEUP = "mouseup";

    var MOUSEENTER = "mouseenter";
    var MOUSELEAVE = "mouseleave";
    var MOUSEMOVE = "mousemove";

    var TOUCHSTART = "touchstart";
    var TOUCHEND = "touchend";
    var TOUCHMOVE = "touchmove";
    
    var MOUSE_ID = "mouse";

    var TOUCHEND_ANGULAR_EVENT = "touchend";


    /**
     * Controller for dragged item
     */
    app.controller("DragAndDropItemController", ['$scope', '$element', '$document' , function ($scope, $element) {

        $scope.init = function (value) {
            $scope.value = value;
            $scope.value.$element = $element;
        }
    }]);

    /**
     * Controller for all dragged items
     */
    app.controller("DragAndDropController", ['$rootScope' , '$scope', 'dragAndDrop', '$document' , function ($rootScope, $scope, dragAndDrop, $document) {

        //Mouse up : d&d ended, remove the associated data
        //Need to remove a mouseUp not handled which bubbled to document
        var mouseUp = function (evt) {
            if (dragAndDrop.hasData(MOUSE_ID)) {
                $scope.$apply(function () {
                    dragAndDrop.removeData(MOUSE_ID);
                });
            }
        };

        //Dragged item follow the mouse
        var mouseMove = function (evt) {
            if (dragAndDrop.hasData(MOUSE_ID)) {
                dragAndDrop.getData(MOUSE_ID).$element.css({
                    top: evt.pageY + 5,
                    left: evt.pageX + 5,
                    visibility: "visible"
                });

            }
        };

        //Touched items follow the fingers
        var touchMove = function (evt) {
            for (var ite = 0; ite < evt.targetTouches.length; ite++) {
                var currentTouch = evt.targetTouches[ite];
                if (dragAndDrop.hasData(currentTouch.identifier)) {
                    dragAndDrop.getData(currentTouch.identifier).$element.css({
                        top: currentTouch.pageY + 5,
                        left: currentTouch.pageX + 5,
                        visibility: "visible"
                    });
                    evt.preventDefault();
                }
            }
        };


        //Centralized touchend event, dispatch Touch to all drop directives
        //Must implement centralized touch end because the event only occurs on the element that initiate the touch start (not the final element)
        var touchEnd = function (evt) {
            $scope.$apply(function () {
                for (var ite = 0; ite < evt.changedTouches.length; ite++) {
                    var currentTouch = evt.changedTouches[ite];
                    if (dragAndDrop.hasData(currentTouch.identifier)) {
                        $rootScope.$emit(TOUCHEND_ANGULAR_EVENT, currentTouch);
                        //once emited, remove data
                        dragAndDrop.removeData(currentTouch.identifier)
                    }
                }
            });
        };

        $document.bind(MOUSEMOVE, mouseMove);
        $document.bind(TOUCHMOVE, touchMove);
        $document.bind(MOUSEUP, mouseUp);
        $document.bind(TOUCHEND, touchEnd);

        $scope.$on($DESTROY, function () {
            $document.unbind(MOUSEMOVE, mouseMove);
            $document.unbind(TOUCHMOVE, touchMove);
            $document.unbind(MOUSEUP, mouseUp);
            $document.unbind(TOUCHEND, touchEnd);
        });

        $scope.hasItems = function() {
            return $scope.items.length > 0;
        };

        $scope.items = dragAndDrop.datas;
    }]);


    /**
     * Drag&Drop service, holds dragged item data
     */
    app.factory('dragAndDrop', function () {

        var Service = function () {
            this.counter = 0;
            this.datas = {};
        };


        Service.prototype.setData = function (id, data, success, include, width, height) {
            this.datas[id] = {data: data, include: include, width: width, height: height, callback: success};
        };

        Service.prototype.getData = function (id) {
            return this.datas[id];
        };

        Service.prototype.removeData = function (id) {
            if (this.datas[id]) {
                delete this.datas[id];
            }
        };

        Service.prototype.hasData = function (id) {
            return this.datas[id] != null;
        };

        return new Service();

    });


    app.directive("drag", ["$rootScope", "dragAndDrop", "$controller", function ($rootScope, dragAndDrop) {

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
                        if (attrs.dragModel) {
                            dragAndDrop.setData(MOUSE_ID, scope.$eval(attrs.dragModel), success, dragInclude, element[0].offsetWidth, element[0].offsetHeight);
                        }
                    });
                };

                var touchStart = function (evt) {
                    evt.preventDefault();
                    scope.$apply(function () {
                        for (var ite = 0; ite < evt.targetTouches.length; ite++) {
                            var currentTouch = evt.targetTouches[ite];
                            if (attrs.dragModel) {
                                dragAndDrop.setData(currentTouch.identifier, scope.$eval(attrs.dragModel), success, dragInclude, element[0].offsetWidth, element[0].offsetHeight);
                            }
                        }
                    });
                };


                element.bind(MOUSEDOWN, mouseDown);
                element.bind(TOUCHSTART, touchStart);

                scope.$on($DESTROY, function () {
                    element.unbind(MOUSEDOWN, mouseDown);
                    element.unbind(TOUCHSTART, touchStart);
                });

            }
        }
    }]);


    app.directive("drop", ['$rootScope', "dragAndDrop", "$document", function ($rootScope, dragAndDrop, $document) {

        return {
            restrict: 'A',
            link: function (scope, $element, attrs) {

                function doDrop(identifier, target) {
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
                    if (!dragAndDrop.hasData(MOUSE_ID)) {
                        return;
                    }
                    evt.preventDefault();
                    scope.$apply(function () {
                        doDrop(MOUSE_ID);
                    });
                };

                var touchEnd = function (s, currentTouch) {
                    var touchEndElement = $document[0].elementFromPoint(currentTouch.pageX, currentTouch.pageY);
                    if ($element[0].compareDocumentPosition(touchEndElement) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
                        doDrop(currentTouch.identifier);
                    }
                };


                var doCallBack = function (cb) {
                    return function (evt) {
                        if (dragAndDrop.hasData(MOUSE_ID)) {
                            scope.$apply(function () {
                                var result = scope.$eval(cb);
                                if (angular.isFunction(result)) {
                                    result(evt, dragAndDrop.getData(MOUSE_ID));
                                }
                            });
                        }
                    }
                };


                $rootScope.$on(TOUCHEND_ANGULAR_EVENT, touchEnd);


                //A mouseup occurs on the target element
                $element.bind(MOUSEUP, mouseUp);
                scope.$on($DESTROY, function () {
                    $element.unbind(MOUSEUP, mouseUp);
                });


                //Mouse enter/leave/move an element
                if (attrs.dropMouseEnter) {
                    var mouseEnter = doCallBack(attrs.dropMouseEnter);
                    $element.bind(MOUSEENTER, mouseEnter);
                    scope.$on($DESTROY, function () {
                        $element.unbind(MOUSEENTER, mouseEnter);
                    });
                }

                if (attrs.dropMouseLeave) {
                    var mouseLeave = doCallBack(attrs.dropMouseLeave);
                    $element.bind(MOUSELEAVE, mouseLeave);
                    scope.$on($DESTROY, function () {
                        $element.unbind(MOUSELEAVE, mouseLeave);
                    });
                }

                if (attrs.dropMouseMove) {
                    var mouseMove = doCallBack(attrs.dropMouseMove);
                    $element.bind(MOUSEMOVE, mouseMove);
                    scope.$on($DESTROY, function () {
                        $element.unbind(MOUSEMOVE, mouseMove);
                    });
                }
            }
        }
    }]);


}(angular.module('dragAndDrop', [])));