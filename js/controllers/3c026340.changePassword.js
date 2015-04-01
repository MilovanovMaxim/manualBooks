app.controller('ChangePasswordController', ['$scope', '$modalInstance', 'profileService', 'apiService', 'notificationService', function ($scope, $modalInstance, profileService, apiService, notificationService) {
    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.ok = function () {
        $scope.oldPasswordError = false;
        $scope.confirmPasswordError = false;
        
        if (!$scope.oldPassword || !$scope.newPassword || !$scope.confirmPassword)
            return;
        if ($scope.oldPassword.length == 0 || $scope.newPassword.length == 0 || $scope.confirmPassword.length == 0)
            return;
        
        if ($scope.newPassword !== $scope.confirmPassword) {
            $scope.confirmPasswordError = true;
            return;
        };
        $scope.inProgress= true;
        apiService.account.changePassword({
            password: $scope.oldPassword,
            new_password: $scope.newPassword,
            confirm_password: $scope.confirmPassword
        }).then(function () {
             $scope.inProgress = null;
            notificationService.success('Password changed successfully', 'bottom_right');
            $modalInstance.close();
        }, function (error) {
             $scope.inProgress = null;
            if (error.message === 'old password doesnot match')
                $scope.oldPasswordError = true;
            else
                notificationService.error(error.message, 'bottom_right');
        });
    };

    $scope.name= profileService.getFullName();
    $scope.avatar = profileService.getAvatar();
    $scope.oldPassword = null;
    $scope.oldPasswordError = false;

    $scope.newPassword = null;
    $scope.inProgress = null;

    $scope.confirmPassword = null;
    $scope.confirmPasswordError = false;
    $scope.error = null;

}]);
