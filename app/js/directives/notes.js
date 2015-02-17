(function (module) {
    module.directive('notes', function () {
        return {
            restrict: 'E',
            templateUrl: 'tpl/blocks/notes.html',
            scope: {},
            controller: ["$scope", "profileService", function ($scope, profileService) {

                $scope.profileName = function () {
                    var profile = profileService.getProfile();
                    if (profile)
                        return profile.firstname;
                    return '';
                };
                $scope.isAdmin = function () {
                    var profile = profileService.getProfile();
                    if (profile)
                        return profile.type == 'admin';
                    return '';
                };
            }]
        }
    })
})(angular.module('app'));
