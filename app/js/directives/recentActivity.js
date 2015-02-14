angular.module('app').directive('mbRecentActivity', function(){
    return {
        restrict: 'AC',
        templateUrl:'tpl/blocks/recentActivity.html',
        scope:true,
        replace:true,
        controller: ["$scope", "apiService", function($scope, apiService){
            apiService.account
                .getRecentActivity()
                .then(function(data){
                    $scope.recentActivity = data.items;
                });
        }]
    }
})