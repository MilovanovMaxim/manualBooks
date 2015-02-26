app.controller('ChangeAvatarController', ['$scope', '$modalInstance', 'profileService', 'apiService', 'notificationService', function ($scope, $modalInstance, profileService, apiService, notificationService) {

    var _baseUrl = 'http://marksmith.biz/mbooksapi/';

    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.ok = function () {
        apiService.account.uploadPicture({
            file: $scope.file
        }).then(function (data) {
            if (data && data.items && data.items.length > 0) {
                var profile = profileService.getProfile();
                profile.avatar = _baseUrl + data.items[0].picture;
                $modalInstance.close();
            }
        }, function (error) {
            if (error.message)
                notificationService.error(error.message, 'bottom_right');
        });
    };

    $scope.avatar = profileService.getAvatar();
    $scope.file = {};
    $scope.file.src = "";

}]);/**
 * Created by rsabiryanov on 26.02.2015.
 */
