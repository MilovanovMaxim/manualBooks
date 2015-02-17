angular.module('app').controller('SearchFormConroller', ['$scope', '$stateParams', 'apiService', function($scope, $stateParams, apiService){
    $scope.searchString = $stateParams.searchString;

    $scope.search = function(){
        apiService.search($scope.searchString).then(function(data){
            $scope.searchResult = data.items[0];
        });
    }

    $scope.search();
}]);