angular.module('app').controller('RecommendationController', ['$scope', 'apiService', 'usSpinnerService','$q', function ($scope, apiService, usSpinnerService, $q) {

    usSpinnerService.spin('mainSpiner');

    var recommendatedBooks = apiService.books
        .getRecommendatedBooks()
        .then(function (data) {
            $scope.recommendatedBooks = data.items;
        });

    var recommendatedVersions = apiService.books
        .getRecommendatedVersions()
        .then(function (data) {
            $scope.recommendatedVersions = data.items;
        });

    var recommendatedPages = apiService.books
        .getRecommendatedPages()
        .then(function (data) {
            $scope.recommendatedPages = data.items;
        });

    $q.all(recommendatedBooks, recommendatedPages, recommendatedVersions).then(function(){
        usSpinnerService.stop('mainSpiner');
    });

}]);