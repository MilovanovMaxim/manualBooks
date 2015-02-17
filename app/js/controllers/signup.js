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
            department: 'developer',
        };
        authService.registration(data)
            .then(function (response) {
                if(response.items && response.items.length>0)
                {
                    profileService.saveProfile(response.items[0]);
                    $state.go('show.recommendation');
                }
            }, function () {
                $scope.authError = 'Server Error';
            });
    };
}])
;