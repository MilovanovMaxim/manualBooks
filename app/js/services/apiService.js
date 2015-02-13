/**
 * Created by rsabiryanov on 13.02.2015.
 */
(function (module) {

    module.factory('apiService', ['$http','$q', function ($http, $q) {

        var _baseUrl = 'http://marksmith.biz/mbooksapi/';
        var websiteId = 1001;
        var currentUserId = 0;

        var getResourceUrl = function(method){
            return _baseUrl + method;
        };

        var wrapResponse = function(response){
            var defer = $q.defer();

            response.then(function(respone){
                data = respone.data;
                if (data.success === 'true')
                    defer.resolve(data);
                return defer.reject(data);
            },function(reason){
                return defer.reject(reason);
            });

            return defer.promise;
        };

        var _http = {

            get: function (method, data) {
                return  wrapResponse($http.get(getResourceUrl(method), { params: data}))
                    .then(function(data){
                        currentUserId = data.id;
                        return data;
                    });
            }
            ,
            post: function (method, data) {
                return wrapResponse($http.post(getResourceUrl(method), data, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}}))
            }
        };

        return {
            registration: function (data) {
                //return $http.post(_baseUrl + 'registration',{type:'standard',firstname:'demo',lastname:'demo',telephone:'9824848353', notes: 'this is standard user',website_id: '1001', email: 'mma29121983@gmail.com', password: 'qwerty123#'}, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
                return _http.post('registration', data);
            },
            login: function(data){
                return _http.get('login', data);
            },
            isAuth: function(){
                return !!currentUserId;
            },

            books: {
                get: function(){
                    return _http.get('displayBooks', {
                        user_id:currentUserId,
                        website_id: websiteId
                    });
                },

                getVersions: function (book) {
                    return _http.get('displayVersions',{
                        user_id:currentUserId,
                        website_id: websiteId,
                        manual:book
                    });
                }
            }
        };
    }]);

})(angular.module('app'));
