'use strict';

/* Controllers */
// forgot password controller
app.controller('ForgotPasswordFormController', ['$scope', 'authService', function ($scope, authService) {
    $scope.isCollapsed = true;
    $scope.email=null;

    $scope.send= function(){
        authService.forgotPwd({email: $scope.email}).then(function(){
            $scope.isCollapsed=false;
        });
    };
}]);
