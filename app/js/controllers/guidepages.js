'use strict';

/* Controllers */
// guidepages controller
app.controller('GuidePagesFormController', ['$scope', 'profileService', 'apiService', '$stateParams', '$state', 'usSpinnerService', function ($scope, profileService, apiService, $stateParams, $state, usSpinnerService) {

    usSpinnerService.spin('mainSpiner');

    $scope.book = {};
    $scope.book.pages = [];
    var manualId=$stateParams.fold;
    var manualVersionId= $stateParams.version;


    var setActive = function (id) {
        _.each($scope.book.pages, function (page) {
            page.active = page.id == id;
        })
    };

    var download= function(data)
    {
        if(data.items && data.items.length>0)
        {
            window.open(data.items[0].link,'_blank');
        }
    };
    $scope.downloadBook= function()
    {
        apiService.books.downloadVersion(manualId).then(function(data){
            download(data);
        });
    };
    $scope.downloadPage= function(pageId)
    {
        apiService.books.downloadPage(pageId).then(function(data){
            download(data);
        });
    };


    $scope.displayPage = function (id, noChangeUrl) {
        setActive(id);

        if (!noChangeUrl) {
            $state.go('show.guidepages',
                {fold: $stateParams.fold, title: $stateParams.title, version: $stateParams.version, page: id},
                {inherit: true, notify: false}
            );
        }

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
        return apiService.books.addBookmark(pageId, manualId, manualVersionId).then(function(){
            var fPage= _.find($scope.book.pages, function(page){ return page.id==pageId;})
            if(fPage)
            {
                fPage.bookmarked = true;
            }
        });
    };
    $scope.removeBookmark = function (pageId) {
        return apiService.books.removeBookmark(pageId).then(function(){
            var fPage= _.find($scope.book.pages, function(page){ return page.id==pageId;})
            if(fPage)
            {
                fPage.bookmarked = false;
            }
        });
    };

    $scope.isAdmin = function () {
        return profileService.isAdmin() || profileService.isSuperAdmin();
    };

    var init = function () {

        apiService.books.displayPages($stateParams.fold).then(function (data) {
            $scope.book.title= data.manual_name;
            $scope.book.version= data.version_name;
            manualVersionId= data.version_id;
            manualId= data.manual_id;
            _.each(data.items, function (page) {
                $scope.book.pages.push({
                    name: page.full_title,
                    id: page.id,
                    pdf: page.pdf,
                    bookmarked: page.bookmarked == true
                });
            });
            if ($scope.book.pages.length > 0) {
                $scope.displayPage($stateParams.page || $scope.book.pages[0].id, true);
            }

            usSpinnerService.stop('mainSpiner');

        });



    };

    init();

}]);

