'use strict';

/* Controllers */
// guidepages controller
app.controller('GuidePagesFormController', ['$scope', 'profileService', 'apiService', '$stateParams', function ($scope, profileService, apiService, $stateParams) {

    $scope.book = {};
    $scope.book.pages = [];


    var setActive = function (id) {
        _.each($scope.book.pages, function (page) {
            page.active = page.id == id;
        })
    };

    $scope.displayPage = function (id) {
        apiService.books.displayPage(id).then(function (data) {
            if (data.items.length > 0) {
                var page = data.items[0];
                setActive(page.id);
                $scope.currentPage = {
                    id: page.id,
                    full_title: page.full_title,
                    content: page.content,
                    document_update_version: page.document_update_version,
                    views_count: page.count,
                    media_image: page.media_image
                }
            }

        });
    };

    $scope.addBookmark = function (pageId) {
        return apiService.books.addBookmark(pageId);
    };

    $scope.isAdmin = function () {
        return profileService.isAdmin() || profileService.isSuperAdmin();
    };

    var init = function () {
        $scope.book.title = $stateParams.title;
        $scope.book.version = $stateParams.version;
        apiService.books.displayPages($stateParams.fold).then(function (data) {
            _.each(data.items, function (page) {
                $scope.book.pages.push({
                    name: page.full_title,
                    id: page.id,
                    pdf: page.pdf
                });
            });
            if ($scope.book.pages.length > 0) {
                $scope.displayPage($scope.book.pages[0].id);
            }


        });
    };

    init();

}]);

