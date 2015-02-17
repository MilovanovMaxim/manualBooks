(function (module) {
    module.directive('bookmarkItems', function () {
        return {
            restrict: 'E',
            templateUrl: 'tpl/blocks/bookmarkItems.html',
            scope: {},
            controller: ["$scope", "apiService", "$state", function ($scope, apiService, $state) {

                $scope.displayBookmarks = function () {
                    return apiService.books.displayBookmarks().then(function (data) {
                        $scope.bookmarks = [];
                        if (data.items.length == 0) {
                            $scope.bookmarks.push(
                                {
                                    short_title: 'No pages have been pinned',
                                    full_title: 'No pages have been pinned',
                                    media_image: ''
                                });
                        }
                        else {
                            _.each(data.items, function (item) {
                                $scope.bookmarks.push(
                                    {
                                        short_title: item.short_title,
                                        full_title: item.full_title,
                                        subtitle: item.subtitle,
                                        media_image: item.media_image,
                                        page_id: item.page_id,
                                        manual_id: item.manual_id,
                                        manual_version: item.manual_version,
                                        manual_title: item.manual_title
                                    }
                                );
                            });
                        }
                    });
                };

                $scope.goToPage = function (manualId, title, manualVersion, pageId) {
                    $state.go('show.guidepages', {fold: manualId, title: title, version: manualVersion, page: pageId});
                };

            }]
        }
    })
})(angular.module('app'));
