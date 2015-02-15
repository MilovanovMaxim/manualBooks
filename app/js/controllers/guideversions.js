angular.module('app').controller('GuideversionsControlle', ['$scope', "apiService",'$stateParams', function($scope, apiService, $stateParams){

    $scope.currentPage = 0;
    $scope.pagSize = 15;

    $scope.pageChanged = function(){
    };

    apiService.books
        .getVersions($stateParams.fold)
        .then(function(data){
             $scope.manual = data.items[0];
             $scope.bookVersions = data.items;
             return data.items
        });

}]);