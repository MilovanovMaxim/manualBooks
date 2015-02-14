(function (module) {
    module.directive('asideFooter', function () {
        return {
            restrict: 'E',
            templateUrl: 'tpl/blocks/aside.footer.html',
            scope: {},
            controller: ['$scope', 'profileService', 'authService', '$state', function ($scope, profileService, authService, $state) {

                $scope.getProfileName = function () {
                    var account = profileService.getProfile();
                    if (!account)
                        return '';
                    return account.firstname;// + ' ' + account.lastname;
                };
                $scope.logout = function () {
                    authService.logout();
                };
                $scope.openProfile = function () {
                    $state.go('show.user');
                };
            }]
        }
    })
})(angular.module('app'));
