(function (module) {
    module.directive('bookmarkItems', function () {
        return {
            restrict: 'E',
            templateUrl: 'tpl/blocks/bookmarkItems.html',
            scope: {},
            controller: ["$scope", "apiService", "$state", 'usSpinnerService', function ($scope, apiService, $state, usSpinnerService) {

                $scope.displayBookmarks = function (open) {
                    if (!open)
                        return;
                    usSpinnerService.spin('mainSpiner');
                    return apiService.books.displayBookmarks().then(function (data) {
                        $scope.bookmarks = [];
                        if (data.items.length == 0) {
                            $scope.bookmarks.push(
                                {
                                    page_subtitle: 'No pages have been pinned',
                                    page_full_title: 'No pages have been pinned',
                                    media_image: ''
                                });
                        }
                        else {
                            _.each(data.items, function (item) {
                                $scope.bookmarks.push(
                                    {
                                        bookmark_id: item.bookmark_id,
                                        media_image: item.media_image,
                                        page_id: item.page_id,
                                        manual_id: item.manual_id,
                                        manual_version_id: item.manual_version_id,
                                        manual_title: item.manual_title,
                                        manual_version_title: item.manual_version_title,
                                        page_full_title: item.page_full_title,
                                        page_short_title: item.page_short_title,
                                        page_subtitle: item.page_subtitle

                                    }
                                );
                            });
                        }
                        usSpinnerService.stop('mainSpiner');
                    });
                };

                $scope.goToPage = function (manualId, title, manualVersion, pageId) {
                    $state.go('show.guidepages', {fold: manualId, title: title, version: manualVersion, page: pageId});
                };

            }]
        }
    })
})(angular.module('app'));
