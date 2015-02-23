'use strict';

/* Controllers */
// profile controller
app.controller('ProfileFormController', ['$scope', 'profileService', 'authService', 'apiService','$log', function ($scope, profileService, authService, apiService,$log) {
    var closeEdit = function () {
        $scope.canEditFirstName = $scope.canEditLastName = $scope.canEditEmail = $scope.canEditPhone = false;
    };

    $scope.profile = {};

    $scope.logout = function () {
        authService.logout();
    };

    $scope.canEditFirstName = false;
    $scope.canEditLastName = false;
    $scope.canEditEmail = false;
    $scope.canEditPhone = false;

    $scope.editFirstName = function () {
        closeEdit();
        $scope.canEditFirstName = true;
    };

    $scope.editLastName = function () {
        closeEdit();
        $scope.canEditLastName = true;
    };
    $scope.editEmail = function () {
        closeEdit();
        $scope.canEditEmail = true;
    };
    $scope.editPhone = function () {
        closeEdit();
        $scope.canEditPhone = true;
    };

    $scope.cancelUpdate = function () {
        closeEdit();
        init();
    };


    $scope.updateProfile = function () {
        var account = profileService.getProfile();
        if (account) {
            closeEdit();
            apiService.account.editUser({
                id: account.id,
                admin_id: account.id,
                type: account.type,
                firstname: $scope.profile.firstName,
                lastname: $scope.profile.lastName,
                email: $scope.profile.email,
                telephone: $scope.profile.phone,
                locked: 0,
                status: 1,
                department: 'developer'
            }).then(function () {
                account.firstname = $scope.profile.firstName;
                account.lastname = $scope.profile.lastName;
                account.email = $scope.profile.email;
                account.telephone = $scope.profile.phone;
                profileService.saveProfile(account);
            }, function (ex) {
                $log.error(ex);
            });
        }
    };

    var init = function () {
        var account = profileService.getProfile();
        if (account) {
            $scope.profile.fullName = account.firstname + ' ' + account.lastname;
            $scope.profile.firstName = account.firstname;
            $scope.profile.lastName = account.lastname;
            $scope.profile.email = account.email;
            $scope.profile.joinedDate = '01/01/001';
            $scope.profile.companyName = 'Temp Company Name';
            $scope.profile.companyPlace = 'Temp Company Place';
            $scope.profile.phone = account.telephone;
            $scope.profile.department = 'Temp dept';
            $scope.profile.companyAvatar = '../img/bigcompany.jpg';
            $scope.profile.avatar= account.avatar;
        }
    };
    init();
}]);
