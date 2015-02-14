(function (module) {
    module.factory('glossaryService', ['$q', 'apiService', function ($q, apiService) {
        var service = {};
        service.getGlossary = function () {
            var defer = $q.defer();
            var items = apiService.glossary.getGlossary();
            defer.resolve(items);
            return defer.promise;
        };
        service.getDetails= function(){
            var defer = $q.defer();
            var items = apiService.glossary.getDetails();
            defer.resolve(items);
            return defer.promise;
        };
        return service;

    }
    ]);
})
(angular.module('app'));
