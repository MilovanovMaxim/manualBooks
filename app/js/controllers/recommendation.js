angular.module('app').controller('RecommendationController', ['$scope', 'apiService', function ($scope, apiService) {

    apiService.books
        .getRecommendatedBooks()
        .then(function (data) {
            $scope.recommendatedBooks = data.items;
        });

    apiService.books
        .getRecommendatedVersions()
        .then(function (data) {
            $scope.recommendatedVersions = data.items;
        });

    apiService.books
        .getRecommendatedPages()
        .then(function (data) {
            $scope.recommendatedPages = data.items;
        });

}]);