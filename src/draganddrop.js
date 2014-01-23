var app = angular.module('dragAndDrop', []);


function DragAndDropItemController($scope, $rootScope, dragAndDrop, $element,$document) {

    $scope.init = function (data) {
        $scope.data = data;
    }

    $document.bind('mousemove', function (event) {
        $element.css({
            top : event.pageY + 5,
            left : event.pageX + 5,
            visibility:"visible"
        });
    });

}

function DragAndDropController($scope, $rootScope, dragAndDrop, $document) {
    $scope.items = dragAndDrop.datas;
}


function SampleController($scope, $http) {
    $scope.itemsDrag = [
        {title: "Meliphaga notata" , description:"Le Méliphage marqué (Meliphaga notata) est une espèce de passereau de la famille des Meliphagidae.",
            url : "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Meliphaga_notata_-_Daintree_Village.jpg/290px-Meliphaga_notata_-_Daintree_Village.jpg"},
        {title: "Meliphaga lewinii" , description:"Le Méliphage de Lewin (Meliphaga lewinii) est une espèce de passereau de la famille des Meliphagidae. Il habite les montagnes le long de la côte est de l'Australie. Il a une tache semi-circulaire de couleur jaune pâle au niveau des oreilles.",
            url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Lewins_Honeyeater_kobble_apr06.jpg/290px-Lewins_Honeyeater_kobble_apr06.jpg"},
        {title: "Meliphaga gracilis" , description:"Le Méliphage gracile (Meliphaga gracilis) est une espèce de passereau de la famille des Meliphagidae.",
            url:"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Meliphaga_gracilis_-_Julatten.jpg/290px-Meliphaga_gracilis_-_Julatten.jpg"}
    ];

    $scope.itemsDrop = [];


    $scope.endDrag = function (data) {
        console.log("endDrag " + data);
        $scope.itemsDrag.splice(data, 1);
    }

    $scope.endDrop = function (data) {
        console.log("endDrop " + data);
        $scope.itemsDrop.push(angular.copy(data));
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
