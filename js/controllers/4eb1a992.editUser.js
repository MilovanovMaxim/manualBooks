app.controller('EditUserController', ['$scope', '$modalInstance', 'profileService', 'apiService', 'notificationService', function ($scope, $modalInstance, profileService, apiService, notificationService) {
    $scope.close = function () {
        $modalInstance.close();
    };

    var updateUser= function(account){
        $scope.inProgress=true;
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
                    $scope.inProgress=null;
                    account.firstname = $scope.profile.firstname;
                    account.lastname = $scope.profile.lastname;
                    account.email = $scope.profile.email;
                    account.telephone = $scope.profile.telephone;
                    profileService.saveProfile(account);
                    $modalInstance.close(account);
                }, function (error) {
                    $scope.inProgress=null;
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
            };
    };

    $scope.ok = function () {
        $scope.fnError=null;
        $scope.lnError=null;
        $scope.emailError=null;
        $scope.phoneError=null;
        $scope.emailCheck=null;
        $scope.inProgress=null;
        var account = profileService.getProfile();
        if(account.email!=$scope.profile.email){
            $scope.emailCheck=true;
            apiService.account.checkEmail($scope.profile.email).then(function(){
                 $scope.emailCheck=null;
                updateUser(account);
            }, function(error){
                 $scope.emailCheck=null;
                if(error)
                $scope.emailError=error.message;
            });
        }else{
            updateUser(account);
        };
        
    };
    $scope.fnError=null;
    $scope.lnError=null;
    $scope.emailError=null;
    $scope.phoneError=null;
    $scope.emailCheck=null;
    $scope.inProgress=null;
    $scope.currentProfile=profileService.getProfile();
    $scope.profile=profileService.getProfile();




}]);
