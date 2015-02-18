(function (module) {
    module.factory('localStorageService', ['$window', function ($window) {
        return {
            getItem: function (name) {
                return $window.localStorage.getItem(name);
            },
            clear: function () {
                return $window.localStorage.clear();
            },
            setItem: function (name, value) {
                return $window.localStorage.setItem(name, value);
            },
            removeItem: function (name) {
                return $window.localStorage.removeItem(name);
            }
        };
    }]);
})(angular.module('app'));
