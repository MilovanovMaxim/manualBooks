angular.module('app').directive('mbSearchInput', function () {
    return {
        restrict: 'AC',
        templateUrl: 'tpl/blocks/searchInput.html',
        scope: true,
        replace: true,
        controller: ["$scope", "$state", function ($scope, $state) {
            $scope.search = function () {
                if ($scope.searchString) {
                    $state.go('show.search', {searchString: $scope.searchString})
                    $scope.searchString = '';
                }
            }
        }
    ]
}
})
;