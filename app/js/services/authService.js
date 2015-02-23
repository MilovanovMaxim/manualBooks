/**
 * Created by rsabiryanov on 13.02.2015.
 */
(function (module) {
    module.factory('authService', ['$q', 'apiService', '$log', '$state', 'profileService', function ($q, apiService, $log, $state, profileService) {
        var service = {};
        var toClientModel = function (server) {
            if (!server.items || server.items.length == 0)
                return null;
            var serverUser = server.items[0];
            apiService.account.setWebsiteId(serverUser.website_id);
            return {
                email: serverUser.email,
                firstname: serverUser.firstname,
                id: serverUser.id,
                lastname: serverUser.lastname,
                status: serverUser.status,
                type: serverUser.type,
                telephone: serverUser.telephone,
                website_id: serverUser.website_id,
                avatar: serverUser.avatar,
                website_name: serverUser.website_name,
                website_logo: serverUser.website_logo
            };
        };

        service.registration = function (data) {
            return apiService.account.registration(data);
        };
        service.login = function (data) {
            var defer = $q.defer();
            profileService.clearProfile();
            apiService.account.login({
                email: data.email,
                password: data.password
            }).then(function (data) {
                var clientData = toClientModel(data);
                profileService.saveProfile(clientData);
                defer.resolve(clientData);
            }, function (x) {
                return defer.reject(x);
            });
            return defer.promise;
        };

        service.logout = function () {
            profileService.clearProfile();
            $state.go('access.signin');
        };

        service.forgotPwd= function(email){
            return apiService.account.forgotPwd(email);
        };
        return service;
    }]);
})(angular.module('app'));
