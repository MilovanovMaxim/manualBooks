app.controller('EditUserController', ['$scope', '$modalInstance', 'profileService', 'apiService', 'notificationService', function ($scope, $modalInstance, profileService, apiService, notificationService) {
    $scope.close = function () {
        $modalInstance.close();
    };

    $scope.ok = function () {
        $scope.fnError=null;
        $scope.lnError=null;
        $scope.emailError=null;
        $scope.phoneError=null;
        var account = profileService.getProfile();
        if (account) {
                apiService.account.editUser({
                    id: account.id,
                    admin_id: account.id,
                    type: account.type,
                    firstname: $scope.profile.firstname,
                    lastname: $scope.profile.lastname,
                    email: $scope.profile.email,
                    telephone: $scope.profile.telephone,
                    locked: 0,
                    status: 1,
                    department: 'developer'
                }).then(function () {
                    account.firstname = $scope.profile.firstname;
                    account.lastname = $scope.profile.lastname;
                    account.email = $scope.profile.email;
                    account.telephone = $scope.profile.telephone;
                    profileService.saveProfile(account);
                    $modalInstance.close(account);
                }, function (error) {
                    if(error && error.items && error.items.length>0){
                        if(error.items[0]['firstname'])
                            $scope.fnError=error.items[0]['firstname'];
                         if(error.items[0]['lastname'])
                            $scope.lnError=error.items[0]['lastname'];
                         if(error.items[0]['email'])
                            $scope.emailError=error.items[0]['email'];
                         if(error.items[0]['telephone'])
                            $scope.phoneError=error.items[0]['telephone'];
                    }else
                    if (error.message)
                        notificationService.error(error.message, 'bottom_right');
                });
            }
    };
    $scope.fnError=null;
    $scope.lnError=null;
    $scope.emailError=null;
    $scope.phoneError=null;
    $scope.currentProfile=profileService.getProfile();
    $scope.profile=profileService.getProfile();




}]);
