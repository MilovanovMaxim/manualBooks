/**
 * Created by rsabiryanov on 13.02.2015.
 */
(function (module) {
    module.factory('authService', ['$q', 'apiService','$log','userMapper', function ($q,apiService,$log,userMapper) {
        var service = {};
        service.registration = function (data) {
            return apiService.registration(data);
        };
        service.login = function (data) {
            var defer = $q.defer();
            apiService.login(data).then(function (data) {
                defer.resolve(userMapper.toClientModel(data));
            }, function(x) {
                return defer.reject(x);
            });
            return defer.promise;
        };
        return service;
    }]);
})(angular.module('app'));
