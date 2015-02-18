angular.module('app').controller('PageController', ['$scope', 'apiService', '$stateParams', function($scope, api, $stateParams){
     api.books
        .displayPage($stateParams.fold)
        .then(function(data){
             $scope.page = data.items[0];
        });
}]);