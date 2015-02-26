'use strict';

/* Controllers */
// signin controller
app.controller('SigninFormController', ['$scope', 'authService', '$state', 'profileService', function ($scope, authService, $state, profileService) {

    profileService.getProfile();
    if (profileService.getUserId()) {
        $state.go('show.recommendation');
        return;
    }

    $scope.user = {};
    $scope.authError = null;
    $scope.login = function () {
        $scope.authError = null;
        // Try to login
        var data = {email: $scope.user.email, password: $scope.user.password};
        authService.login(data)
            .then(function () {
                $state.go('show.recommendation');
            }, function (error) {
                if (error.message)
                    $scope.authError = error.message;
                else
                    $scope.authError = 'Email or Password not right';
            });
    };

    var checkLogedIn = function () {
        if ($state.current && $state.current.name == 'access.signin') {
            profileService.clearProfile();
            //var account = profileService.getProfile();
            //if (account)
            //    $state.go('show.recommendation');
        }
    };

    checkLogedIn();
}])
;