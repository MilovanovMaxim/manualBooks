'use strict';

/* Controllers */
// guidepages controller
app.controller('GuidePagesFormController', ['$scope', 'profileService', 'apiService', '$stateParams', '$state', 'usSpinnerService', function ($scope, profileService, apiService, $stateParams, $state, usSpinnerService) {

    usSpinnerService.spin('mainSpiner');

    $scope.baseUrl=apiService.getBaseUrl();
    $scope.book = {};
    $scope.book.pages = [];
    var manualId = $stateParams.fold;


    var setActive = function (id) {
        _.each($scope.book.pages, function (page) {
            page.active = page.id == id;
        })
    };

    //var download = function (data) {
    //    if (data.items && data.items.length > 0) {
    //        window.open(data.items[0].link, '_blank');
    //    }
    //};
    //$scope.downloadBook = function (versionId) {
    //    return apiService.getBaseUrl()+'/downloadpdf?version_id'+versionId;
    //    //apiService.books.downloadVersion(versionId).then(function (data) {
    //    //    download(data);
    //    //});
    //};
    $scope.downloadPage = function (pageId) {
        return +'/downloadpdf?page_id'+pageId;
        //apiService.books.downloadPage(pageId).then(function (data) {
        //    download(data);
        //});
    };

    var loadingMap = {};
    $scope.loadingBookmark = function(page){
        return loadingMap[page.id];
    };


    $scope.displayPage = function (id, noChangeUrl) {
        setActive(id);

        if (!noChangeUrl) {
            usSpinnerService.spin('currentPageSpiner');
            $state.go('show.guidepages',
                {fold: $stateParams.fold, title: $stateParams.title, version: $stateParams.version, page: id},
                {inherit: true, notify: false}
            );
        }


        apiService.books.displayPage(id).then(function (data) {
            usSpinnerService.stop('currentPageSpiner');
            usSpinnerService.stop('mainSpiner');
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


    $scope.addBookmark = function (pageId, versionId) {
        loadingMap[pageId] = true;
        return apiService.books.addBookmark(pageId, manualId, versionId).then(function () {
            loadingMap[pageId] = false;
            var fPage = _.find($scope.book.pages, function (page) {
                return page.id == pageId;
            });
            if (fPage) {
                fPage.bookmarked = true;
            }
        });
    };
    $scope.removeBookmark = function (bookmarkId, pageId) {
        loadingMap[pageId] = true;
        return apiService.books.removeBookmark(bookmarkId).then(function () {
            loadingMap[pageId] = false;
            var fPage = _.find($scope.book.pages, function (page) {
                return page.id == pageId;
            });
            if (fPage) {
                fPage.bookmarked = false;
            }
        });
    };

    $scope.isAdmin = function () {
        return profileService.isAdmin() || profileService.isSuperAdmin();
    };

    var init = function () {

        apiService.books.displayPages($stateParams.fold).then(function (data) {
            $scope.book.title = data.manual_name;
            $scope.book.version = data.version_name;
            $scope.book.version_id = data.version_id;
            manualId = data.manual_id;
            _.each(data.items, function (page) {
                $scope.book.pages.push({
                    name: page.full_title,
                    id: page.id,
                    pdf: page.pdf,
                    bookmarked: page.bookmarked == true,
                    bookmark_id: page.bookmark_id
                });
            });
            if ($scope.book.pages.length > 0) {
                $scope.displayPage($stateParams.page || $scope.book.pages[0].id, true);
            }
            else {
                usSpinnerService.stop('mainSpiner');
            }
        });


    };

    init();

}]);

