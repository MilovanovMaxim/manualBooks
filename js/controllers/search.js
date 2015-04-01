angular.module('app').controller('SearchFormConroller', ['$scope', '$stateParams', 'apiService', 'usSpinnerService',
    function ($scope, $stateParams, apiService, usSpinnerService) {
        usSpinnerService.spin('mainSpiner');
        $scope.searchString = $stateParams.searchString;

        $scope.search = function () {
            apiService.search($scope.searchString).then(function (data) {
                $scope.searchResult = data.items[0];
                usSpinnerService.stop('mainSpiner');
            });
        }

        $scope.search();
    }]);