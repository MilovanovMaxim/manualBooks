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
            lastname: '',
            email: $scope.user.email,
            password: $scope.user.password,
            telephone: '',
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