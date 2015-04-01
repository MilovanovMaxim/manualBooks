angular.module('app').directive('mbRecentActivity', function(){
    return {
        restrict: 'AC',
        templateUrl:'tpl/blocks/recentActivity.html',
        scope:true,
        replace:true,
        controller: ["$scope", "apiService",'$state', function($scope, apiService, $state){
            apiService.account
                .getRecentActivity()
                .then(function(data){
                    $scope.recentActivity = data.items;
                });

            var openRules = {
                page: function(recent){
                    $state.go('show.page', {fold:recent.id});
                },
                manual: function(recent){
                    $state.go('show.page', {fold:recent.id});
                }
            };

            $scope.open = function(recent){
                if (openRules[recent.type]) {
                    openRules[recent.type](recent)
                }
            };

        }]
    }
})