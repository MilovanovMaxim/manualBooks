app.controller('ChangePasswordController', ['$scope', '$modalInstance', 'profileService', 'apiService', 'notificationService', function ($scope, $modalInstance, profileService, apiService, notificationService) {
    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.ok = function () {
        if (!$scope.oldPassword || !$scope.newPassword || !$scope.confirmPassword)
            return;
        if ($scope.oldPassword.length == 0 || $scope.newPassword.length == 0 || $scope.confirmPassword.length == 0)
            return;
        $scope.oldPasswordError = false;
        $scope.confirmPasswordError = false;
        if ($scope.newPassword !== $scope.confirmPassword) {
            $scope.confirmPasswordError = true;
            return;
        };
        apiService.account.changePassword({
            password: $scope.oldPassword,
            new_password: $scope.newPassword,
            confirm_password: $scope.confirmPassword
        }).then(function () {
            notificationService.success('Password changed successfully', 'bottom_right');
            $modalInstance.close();
        }, function (error) {
            if (error.message === 'old password doesnot match')
                $scope.oldPasswordError = true;
            else
                notificationService.error(error.message, 'bottom_right');
        });
    };

    $scope.avatar = profileService.getAvatar();
    $scope.oldPassword = null;
    $scope.oldPasswordError = false;

    $scope.newPassword = null;

    $scope.confirmPassword = null;
    $scope.confirmPasswordError = false;
    $scope.error = null;

}]);
