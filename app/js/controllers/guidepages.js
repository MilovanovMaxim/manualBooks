'use strict';

/* Controllers */
// guidepages controller
app.controller('GuidePagesFormController', ['$scope', 'profileService','apiService','$state', function ($scope, profileService,apiService,$state) {

    $scope.book={};

    $scope.currentPage=null;

    $scope.displayPage= function(){

        $scope.currentPage= {
            id: "1",
            short_title: "Welcome",
            full_title: "Welcome page",
            subtitle: "wel img",
            content: "<b>Hi</b><br><p>This is welcome page</p>",
            document_update_version: "1.0",
            status: "1",
            created: "2015-02-05 05:17:00",
            modified: "0000-00-00 00:00:00",
            media_id: "2",
            admin_id: "2",
            admin_name: "ravi vagadiya",
            notes: "This is welcome note!",
            media_title: "welcome image",
            media_subtitle: "wel img",
            media_image: "http://marksmith.biz/media/2.png",
            media_status: "1",
            media_created: "2015-02-05 05:17:00",
            media_modified: "0000-00-00 00:00:00",
            media_admin_id: "2",
            media_notes: "This is image note",
            views_count: 777
        }
    };

    var init=function(){

        //apiService.displayPages()
    };

    init();

}]);

