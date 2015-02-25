(function (module) {
    module.factory('profileService', ['localStorageService', function (localStorageService) {
        var key = 'account';
        var service = {};
       
        service.isAdmin = function () {
            var profile = service.getProfile();
            if (profile)
                return profile.type == 'admin';
            return false;
        };
        service.isSuperAdmin = function () {
            var profile = service.getProfile();
            if (profile)
                return profile.type == 'superadmin';
            return false;
        };
        service.saveProfile = function (data) {
            localStorageService.setItem(key, JSON.stringify(data));
        };
        service.getProfile = function () {
            var profile = JSON.parse(localStorageService.getItem(key));
            return profile;
        };
        service.clearProfile = function () {
            localStorageService.removeItem(key);
        };
        service.getUserId = function () {
            var profile = service.getProfile();
            if (profile && profile.id)
                return profile.id;
            return 0;
        };
        service.getWebsiteId = function () {
            var profile = service.getProfile();
            if (profile && profile.website_id)
                return profile.website_id;
            return 0;
        };
        return service;
    }]);
})(angular.module('app'));
