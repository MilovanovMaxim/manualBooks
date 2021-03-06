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

        service.isAuthorized = function(){
            var profile = service.getProfile();
            if (profile)
                return !!profile.id;

            return false;
        };

        service.hasRole = function(role){
            var profile = service.getProfile();
            if (!profile) return false;

            return profile.type === role;

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
        service.getAvatar= function(){
            var profile = service.getProfile();
            if (profile && profile.avatar)
                return profile.avatar;
            return '../img/a0.jpg';
        };
        service.getFullName= function(){
            var profile = service.getProfile();
            if(profile)
                return profile.firstname + ' ' + profile.lastname;
            return '';
        };
        return service;
    }]);
})(angular.module('app'));
