(function (module) {
    module.factory('glossaryService', ['$q', 'apiService', function ($q, apiService) {
        var service = {};
        service.getGlossary = function () {
            var defer = $q.defer();
            apiService.glossary.displayFaqs().then(function(data){
                    var items=[];
                    _.each(data.items,function(item){
                        items.push({
                            id: item.id,
                            FAQ: item.question
                        });
                    });
                    defer.resolve(items);
                }
            );
            return defer.promise;
        };
        service.getDetails= function(id){
            var defer = $q.defer();
            apiService.glossary.displayFaq(id).then(function(data){
                var items=[];
                _.each(data.items,function(item){
                    items.push({
                        notes: item.content
                    });
                });
                defer.resolve(items);
            });
            return defer.promise;
        };
        return service;

    }
    ]);
})
(angular.module('app'));
