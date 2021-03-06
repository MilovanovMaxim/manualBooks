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
            lastname: $scope.user.lastname,
            email: $scope.user.email,
            password: $scope.user.password,
            telephone: '9824848353',
            department: 'developer',
            website_id: $scope.user.website_id
        };
        authService.registration(data)
            .then(function (response) {
                if(response.items && response.items.length>0)
                {
                    //data.id=response.items[0].id;
                    //profileService.saveProfile(data);
                    $state.go('access.signin');
                }
            }, function (error) {
                if(error && error.message)
                    $scope.authError = error.message;
                else
                    $scope.authError = 'Server Error';
            });
    };
}])
;