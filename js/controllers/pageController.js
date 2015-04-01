angular.module('app').controller('PageController', ['$scope', 'apiService', '$stateParams', 'usSpinnerService', function($scope, api, $stateParams, usSpinnerService){
    usSpinnerService.spin('mainSpiner');
    api.books
        .displayPage($stateParams.fold)
        .then(function(data){
             $scope.page = data.items[0];
            usSpinnerService.stop('mainSpiner');
        });
}]);