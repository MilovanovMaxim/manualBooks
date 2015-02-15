angular.module('app').controller('GuideversionsControlle', ['$scope', "apiService",'$stateParams', function($scope, apiService, $stateParams){

     apiService.books
        .getVersions($stateParams.fold)
        .then(function(data){
             $scope.bookVersions = data.items;
        });
}]);