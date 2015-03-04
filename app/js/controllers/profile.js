'use strict';

/* Controllers */




// profile controller
app.controller('ProfileFormController', ['$rootScope', '$scope', 'profileService', 'authService', 'apiService', '$log', '$modal', 'usSpinnerService', 'notificationService',
    function ($rootScope, $scope, profileService, authService, apiService, $log, $modal, usSpinnerService, notificationService) {
        usSpinnerService.spin('mainSpiner');

        $scope.profile = {
            status: 1
        };

        $scope.logout = function () {
            authService.logout();
        };

       


        $scope.editProfile = function () {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal.edituser.html',
                controller: 'EditUserController',
                //size: size,
                resolve: {
                    items: function () {
                        //return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                //$scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        

        $scope.updateProfile = function () {
            var account = profileService.getProfile();
            if (account) {
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
                }, function (error) {
                    $log.error(error);
                    if (error.message)
                        notificationService.error(error.message, 'bottom_right');
                });
            }
        };

        var changeStatus= function(){
            var account = profileService.getProfile();
                    apiService.account.statusUser({user_id: account.id, status: +!$scope.profile.status}).then(function () {
                        $scope.profile.status = +!$scope.profile.status;
                    });
        }

        $scope.setStatus = function () {
            if($scope.profile.status===0)
            {
                changeStatus();
                return;
            }
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal.changeStatus.html',
                controller: 'ChangeStatusController'
            });

            modalInstance.result.then(function (result) {
                if(result) {
                    changeStatus();
                }
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });

        };

        $scope.changeAvatar = function () {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal.changepicture.html',
                controller: 'ChangeAvatarController',
                //size: size,
                resolve: {
                    items: function () {
                        //return $scope.items;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                //$scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $scope.changePassword = function () {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal.changepassword.html',
                controller: 'ChangePasswordController'
            });

            modalInstance.result.then(function (selectedItem) {
                //$scope.selected = selectedItem;
            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        };

        $rootScope.$on('avatarChanged', function (event, data) {
                    $scope.profile.avatar = data;
                });

        var init = function () {
            var account = profileService.getProfile();
            usSpinnerService.stop('mainSpiner');
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
                $scope.profile.avatar = account.avatar;
                $scope.profile.website_name = account.website_name;
                $scope.profile.companyAvatar = account.website_logo ? account.website_logo : '../img/bigcompany.jpg';


            }
        };
        init();
    }]);
