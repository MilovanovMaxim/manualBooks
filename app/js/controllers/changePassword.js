app.controller('ChangePasswordController', ['$scope', '$modalInstance', 'profileService', 'apiService', 'notificationService', function ($scope, $modalInstance, profileService, apiService, notificationService) {
    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.ok = function () {
        apiService.account.changePassword({
            password: $scope.oldPassword,
            new_password: $scope.newPassword,
            confirm_password: $scope.confirmPassword
        }).then(function () {
            $modalInstance.close();
        }, function (error) {
            if (error.message)
                notificationService.error(error.message, 'bottom_right');
        });
    };

    $scope.avatar = profileService.getAvatar();
    $scope.oldPassword = null;
    $scope.newPassword = null;
    $scope.confirmPassword = null;
    $scope.error = null;

}]);
