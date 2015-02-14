'use strict';

// signup controller
app.controller('SignupFormController', ['$scope', '$state', 'authService', 'profileService', function ($scope, $state, authService, profileService) {
    $scope.user = {};
    $scope.authError = null;
    $scope.signup = function () {
        $scope.authError = null;
        // Try to create
        var data = {
            type: 'standart',
            firstname: $scope.user.name,
            lastname: $scope.user.name,
            email: $scope.user.email,
            password: $scope.user.password,
            telephone: '9824848353',
            notes: 'this is standard user',
            website_id: '1001'
        };
        authService.registration(data)
            .then(function (response) {
                profileService.saveProfile(data);
                $state.go('show.recommendation');
            }, function () {
                $scope.authError = 'Server Error';
            });
    };
}])
;