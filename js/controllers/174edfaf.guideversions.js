angular.module('app').controller('GuideversionsControlle', ['$scope', "apiService", '$stateParams', 'usSpinnerService', 'profileService',
    function ($scope, apiService, $stateParams, usSpinnerService, profileService) {

        $scope.currentPage = 0;
        $scope.pagSize = 15;

        usSpinnerService.spin('mainSpiner');

        $scope.pageChanged = function () {
        };
        $scope.isAdmin = function () {
            return profileService.isAdmin() || profileService.isSuperAdmin();
        }

        apiService.books
            .getVersions($stateParams.fold)
            .then(function (data) {
                usSpinnerService.stop('mainSpiner');

                $scope.manual = data.items[0];
                $scope.bookVersions = data.items;
                return data.items
            });

    }]);