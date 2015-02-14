(function (module) {
    module.directive('showFooter',function(){
        return {
            restrict: 'E',
            templateUrl:'tpl/blocks/show.footer.html',
            scope:{},
            controller: ["$scope", "authService", function($scope, authService){

                $scope.logout=function(){
                    authService.logout();
                };
            }]
        }
    })
})(angular.module('app'));
