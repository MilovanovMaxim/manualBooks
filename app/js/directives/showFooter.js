(function (module) {
    module.directive('showFooter',function(){
        return {
            restrict: 'E',
            templateUrl:'tpl/blocks/show.footer.html',
            scope:{},
            controller: ["$scope", "authService",'$window', function($scope, authService, $window){

                $scope.logout=function(){
                    authService.logout();
                };

                $scope.zeroclipModel = '';

                $scope.$watch(function(){return $window.location.href;},function(){
                    debugger;
                    $scope.zeroclipModel = $window.location.href;
                });

            }]
        }
    })
})(angular.module('app'));
