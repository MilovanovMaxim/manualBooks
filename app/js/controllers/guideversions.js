angular.module('app').controller('GuideversionsControlle', ['$scope', "apiService",'$stateParams', 'usSpinnerService', function($scope, apiService, $stateParams, usSpinnerService){

    $scope.currentPage = 0;
    $scope.pagSize = 15;

    usSpinnerService.spin('mainSpiner');

    $scope.pageChanged = function(){
    };

    apiService.books
        .getVersions($stateParams.fold)
        .then(function(data){
            usSpinnerService.stop('mainSpiner');

            $scope.manual = data.items[0];
            $scope.bookVersions = data.items;
            return data.items
        });

}]);