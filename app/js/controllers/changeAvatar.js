/**
 * Created by rsabiryanov on 26.02.2015.
 */
app.controller('ChangeAvatarController', ['$scope', '$modalInstance', 'profileService', 'apiService', 'notificationService', 'FileUploader','$rootScope', function ($scope, $modalInstance, profileService, apiService, notificationService, FileUploader,$rootScope) {

    var _url = 'http://marksmith.biz/uploadtest/upload.php?user_id=' + profileService.getUserId();

    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.ok = function () {
        _.each(uploader.queue, function (item) {
            item.upload();
        });
    };

    var uploader = $scope.uploader = new FileUploader({
        url: _url
    });

    uploader.filters.push({
        name: 'customFilter',
        fn: function (item /*{File|FileLikeObject}*/, options) {
            return this.queue.length < 10;
        }
    });

    uploader.onSuccessItem = function (fileItem, response, status, headers) {

        var profile = profileService.getProfile();
        profile.avatar = response.items[0].picture;
        profileService.saveProfile(profile);
        $rootScope.$emit('avatarChanged',profile.avatar);
        notificationService.success('Avatar has been uploaded', 'bottom_right');
        $modalInstance.close();
    };

    uploader.onErrorItem = function (fileItem, response, status, headers) {
        //console.info('onErrorItem', fileItem, response, status, headers);
        notificationService.error('Upload avatar error', 'bottom_right');
    };

    $scope.avatar = profileService.getAvatar();
}]);
