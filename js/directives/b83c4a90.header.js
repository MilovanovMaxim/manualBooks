/**
 * Created by Администратор on 01.04.2015.
 */
(function (module) {
    module.directive('header', function () {
        return {
            restrict: 'E',
            templateUrl: 'tpl/blocks/header.html',
            controller: ['$scope', 'profileService', function ($scope, profileService) {
                $scope.isAdmin = function () {
                    return profileService.isAdmin() || profileService.isSuperAdmin();
                }
            }]
        }
    });
})(angular.module('app'));
