'use strict';

/* Controllers */
// profile controller
app.controller('ProfileFormController', ['$scope', 'profileService','authService', function ($scope, profileService,authService) {
    $scope.profile = {};

    $scope.logout= function(){
        authService.logout();
    };

    var init= function(){
        var account= profileService.getProfile();
        if(account) {
            $scope.profile.fullName = account.firstname + ' ' + account.lastname;
            $scope.profile.firstName = account.firstname;
            $scope.profile.lastName = account.lastname;
            $scope.profile.email = account.email;
            $scope.profile.joinedDate = '01/01/001';
            $scope.profile.companyName = 'Temp Company Name';
            $scope.profile.companyPlace = 'Temp Company Place';
            $scope.profile.phone = '123456789';
            $scope.profile.department = 'Temp dept';
            $scope.profile.companyAvatar = '../img/bigcompany.jpg';
        }
    };

    init();

}]);
