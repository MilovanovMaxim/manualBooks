'use strict';

/* Controllers */
// guidepages controller
app.controller('GuidePagesFormController', ['$scope', 'profileService', 'apiService', '$stateParams', '$state', function ($scope, profileService, apiService, $stateParams, $state) {

    $scope.book = {};
    $scope.book.pages = [];
    var manualId=$stateParams.fold;


    var setActive = function (id) {
        _.each($scope.book.pages, function (page) {
            page.active = page.id == id;
        })
    };

    $scope.displayPage = function (id) {
        setActive(id);

        $state.go('show.guidepages',
            {fold: $stateParams.fold, title:$stateParams.title, version:$stateParams.version, page:id},
            {inherit:true, notify:false}
        );

        apiService.books.displayPage(id).then(function (data) {
            if (data.items.length > 0) {
                var page = data.items[0];
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
        return apiService.books.addBookmark(pageId, manualId);
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
                    pdf: page.pdf,
                    bookmarked: page.bookmarked
                });
            });
            if ($scope.book.pages.length > 0) {
                $scope.displayPage($stateParams.page || $scope.book.pages[0].id);
            }


        });
    };

    init();

}]);

