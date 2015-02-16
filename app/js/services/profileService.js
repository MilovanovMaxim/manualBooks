(function (module) {
    module.factory('profileService', ['localStorageService', function (localStorageService) {
        var key = 'account';
        var service = {};
        var profile = {};
        service.isAdmin = function () {
            return profile.type == 'admin';
        };
        service.isSuperAdmin = function () {
            return profile.type == 'superadmin';
        };
        service.saveProfile = function (data) {
            profile = data;
            localStorageService.setItem(key, JSON.stringify(data));
        };
        service.getProfile = function () {
            profile = JSON.parse(localStorageService.getItem(key))
            return profile;
        };
        service.clearProfile = function () {
            profile = {};
            localStorageService.removeItem(key);
        };
        return service;
    }]);
})(angular.module('app'));
