/**
 * Created by rsabiryanov on 02.03.2015.
 */
/**
 * Created by rsabiryanov on 26.02.2015.
 */
app.controller('ChangeStatusController', ['$scope', '$modalInstance', 'profileService', 'apiService', 'notificationService', 'FileUploader', function ($scope, $modalInstance, profileService, apiService, notificationService, FileUploader) {

    $scope.close = function () {
        $modalInstance.close(false);
    };

    $scope.ok = function () {
        $modalInstance.close($scope.result);
    };

    $scope.result = false;

}]);

