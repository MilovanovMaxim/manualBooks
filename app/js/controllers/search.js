angular.module('app').controller('SearchFormConroller', ['$scope', '$stateParams', 'apiService', function($scope, $stateParams, apiService){
    $scope.searchString = $stateParams.searchString;

    $scope.search = function(){
        $scope.searchResult = apiService.search($scope.searchString);
    }
}]);