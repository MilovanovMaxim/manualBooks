(function (module) {
    module.directive('bookmarkItems', function () {
        return {
            restrict: 'E',
            templateUrl: 'tpl/blocks/bookmarkItems.html',
            scope: {},
            controller: ["$scope", "apiService", function ($scope, apiService) {

                $scope.displayBookmarks = function () {
                    return apiService.books.displayBookmarks().then(function (data) {
                        $scope.bookmarks = [];
                        _.each(data.items, function (item) {
                            $scope.bookmarks.push(
                                {
                                    short_title: item.short_title,
                                    full_title: item.full_title,
                                    subtitle: item.subtitle,
                                    media_image: item.media_image
                                }
                            );
                        });
                    });
                };


            }]
        }
    })
})(angular.module('app'));
