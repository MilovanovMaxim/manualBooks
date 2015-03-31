/**
 * Created by Администратор on 30.03.2015.
 */
(function (module) {
    module.directive('administrationTools', function () {
        return {
            restrict: 'E',
            templateUrl: 'tpl/blocks/administrationTools.html',
            scope: {},
            controller: ['$scope', '$modal', function ($scope, $modal) {
                $scope.addfaq = function () {
                    var modalInstance = $modal.open({
                        templateUrl: 'tpl/modal.addFaq.html',
                        controller: 'modal.addFaqControler',
                        resolve: {
                            items: function () {
                                //return $scope.items;
                            }
                        }
                    });

                    modalInstance.result.then(function (result) {
                    }, function () {
                    });
                };
            }]
        }
    });


})(angular.module('app'));
