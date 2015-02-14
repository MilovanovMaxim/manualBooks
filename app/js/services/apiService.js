/**
 * Created by rsabiryanov on 13.02.2015.
 */
(function (module) {

    module.factory('apiService', ['$http', '$q', '$log', function ($http, $q, $log) {

        var _baseUrl = 'http://marksmith.biz/mbooksapi/';
        var websiteId = 1001;
        var currentUserId = 0;

        var getResourceUrl = function (method) {
            return _baseUrl + method;
        };

        var wrapResponse = function (response) {
            var defer = $q.defer();

            response.then(function (respone) {
                data = respone.data;
                if (data.success === 'true')
                    defer.resolve(data);
                return defer.reject(data);
            }, function (reason) {
                $log.error(reason);
                return defer.reject(reason);
            });

            return defer.promise;
        };

        var _http = {

            get: function (method, data) {
                return wrapResponse($http.get(getResourceUrl(method), {params: data}))
                    .then(function (data) {
                        currentUserId = data.id;
                        return data;
                    });
            }
            ,
            post: function (method, object) {
                var method = method + '?' + _http.preparePostData(object);
                return wrapResponse($http.post(getResourceUrl(method)))
            },
            preparePostData: function (data) {
                var query = [];
                for (prop in data) {
                    query.push(prop + '=' + data[prop]);
                }
                return query.join('&');
            }
        };

        return {

            account: {
                registration: function (data) {
                    return _http.post('registration', data);
                },
                login: function (data) {
                    return _http.get('login', data);
                },
                forgotPwd: function (data) {
                    return _http.post('forgotPassword', data);
                }
            },

            books: {
                get: function () {
                    return _http.get('displayBooks', {
                        user_id: currentUserId,
                        website_id: websiteId
                    });
                },

                getVersions: function (book) {
                    return _http.get('displayVersions', {
                        user_id: currentUserId,
                        website_id: websiteId,
                        manual: book
                    });
                }
            }
        };
    }]);

})(angular.module('app'));
