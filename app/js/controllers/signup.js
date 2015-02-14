'use strict';

// signup controller
app.controller('SignupFormController', ['$scope', '$state', 'authService', function ($scope, $state, authService) {
    $scope.user = {};
    $scope.authError = null;
    $scope.signup = function () {
        $scope.authError = null;
        // Try to create
        var data={
            type: 'standart',
            firstname: $scope.user.name,
            lastname: $scope.user.name,
            email: $scope.user.email,
            password: $scope.user.password,
            telephone: '9824848353',
            notes:'this is standard user',
            website_id: '1001'
        };
        authService.registration(data)
            .then(function (response) {
                if (!response.data.user) {
                    $scope.authError = response;
                } else {
                    $state.go('show.recommendation');
                }
            }, function () {
                $scope.authError = 'Server Error';
            });
    };
}])
;