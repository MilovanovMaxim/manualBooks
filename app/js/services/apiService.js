/**
 * Created by rsabiryanov on 13.02.2015.
 */
(function (module) {

    module.factory('apiService', ['$http', function ($http) {

        var _baseUrl = 'http://marksmith.biz/mbooksapi/';

        var _http = {
            get: function (method, data) {
                return $http.get(_baseUrl + method, { params: data});
            }
            ,
            post: function (method, data) {
                return $http.post(_baseUrl + method, data, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
            }
        };

        return {
            registration: function (data) {
                //return $http.post(_baseUrl + 'registration',{type:'standard',firstname:'demo',lastname:'demo',telephone:'9824848353', notes: 'this is standard user',website_id: '1001', email: 'mma29121983@gmail.com', password: 'qwerty123#'}, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}});
                return _http.post('registration', data);
            },
            login: function(data){
                return _http.get('login', data);
            }
        };
    }]);

})(angular.module('app'));
