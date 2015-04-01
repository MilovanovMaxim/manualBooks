/**
 * Created by Администратор on 30.03.2015.
 */
app.controller('modal.addTagController', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

    $scope.systems=[
        {name:'Keyboard', value:'Keyboard'},
        {name:'Microsoft', value:'Microsoft'},
        {name:'Apple', value:'Apple'},
        {name:'Windows', value:'Windows'},
        {name:'OSX', value:'OSX'},
        {name:'Mouse', value:'Mouse'}
    ];


    $scope.selectedTags= null;
    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.ok = function () {
        $modalInstance.close($scope.selectedTags);
    };
}]);
