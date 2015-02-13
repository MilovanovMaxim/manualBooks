/**
 * Created by rsabiryanov on 13.02.2015.
 */
(function (module) {
    module.factory('userMapper', function () {
        var mapper = {};
        mapper.toClientModel = function (server) {
            if (!server.items || server.items.length == 0)
                return null;
            var serverUser = server.items[0];
            return {
                email: serverUser.email,
                firstname: serverUser.firstname,
                id: serverUser.id,
                lastname: serverUser.lastname,
                status: serverUser.status,
                type: serverUser.type
            };
        };

        return mapper;
    });
}(angular.module('app')));
