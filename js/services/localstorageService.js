(function (module) {
    module.factory('localStorageService', ['$window', function ($window) {
        return {
            getItem: function (name) {
                return $window.sessionStorage.getItem(name);
            },
            clear: function () {
                return $window.sessionStorage.clear();
            },
            setItem: function (name, value) {
                return $window.sessionStorage.setItem(name, value);
            },
            removeItem: function (name) {
                return $window.sessionStorage.removeItem(name);
            }
        };
    }]);
})(angular.module('app'));
