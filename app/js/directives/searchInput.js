angular.module('app').directive('mbSearchInput', function () {
    return {
        restrict: 'AC',
        templateUrl: 'tpl/blocks/searchInput.html',
        scope: true,
        replace: true,
        controller: ["$scope", "$state", 'apiService', function ($scope, $state, apiService) {

            apiService.tags.get().then(function (data) {
                $scope.tags = data.items;
            });

            $scope.onSelected = function(tag){
                $state.go('show.search', {searchString: tag.name});
                $scope.searchString = '';
            };

            $scope.search = function () {
                if ($scope.searchString) {
                    $state.go('show.search', {searchString: $scope.searchString})
                    $scope.searchString = '';
                }
            };
        }
    ]
}
})
;