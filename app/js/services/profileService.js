(function (module) {
    module.factory('profileService',['localStorageService', function (localStorageService) {
        var key='account';
        var service = {};
        service.saveProfile=function(data){
            localStorageService.setItem(key, JSON.stringify(data));
        };
        service.getProfile= function(){
          return JSON.parse(localStorageService.getItem(key));
        };
        service.clearProfile= function(){
            localStorageService.removeItem(key);
        };
        return service;
    }]);
})(angular.module('app'));
