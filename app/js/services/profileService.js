(function (module) {
    module.factory('profileService', ['localStorageService', function (localStorageService) {
        var key = 'account';
        var service = {};
        var profile = {};
        service.isAdmin = function () {
            if (profile)
                return profile.type == 'admin';
            return false;
        };
        service.isSuperAdmin = function () {
            if (profile)
                return profile.type == 'superadmin';
            return false;
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
