(function (module) {
    module.directive('notes',function(){
        return {
            restrict: 'E',
            templateUrl:'tpl/blocks/notes.html',
            scope:{},
            controller: ["$scope", "profileService", function($scope, profileService){

                $scope.profileName=function(){
                    var profile=profileService.getProfile();
                    return profile.firstname;
                };
                $scope.isAdmin=function(){
                    var profile=profileService.getProfile();
                    return profile.type=='admin';
                };
            }]
        }
    })
})(angular.module('app'));
