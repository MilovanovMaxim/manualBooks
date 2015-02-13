angular.module('app').directive('mbAside', function(){
    return {
        restrict: 'AC',
        templateUrl:'tpl/blocks/aside.html',
        scope:true,
        controller: ["$scope", "apiService", function($scope, apiService){
            var menu = $scope.menu = {};

            apiService.books
                .get()
                .then(function(data){
                    menu.books = data.items;
                });
        }]
    }
})