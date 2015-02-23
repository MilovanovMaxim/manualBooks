(function (module) {
    module.directive('notes', function () {
        return {
            restrict: 'E',
            templateUrl: 'tpl/blocks/notes.html',
            scope: {},
            controller: ["$scope", "profileService","apiService", function ($scope, profileService, apiService) {

                $scope.notes=[];
                $scope.profileName = function () {
                    var profile = profileService.getProfile();
                    if (profile)
                        return profile.firstname;
                    return '';
                };
                $scope.isAdmin = function () {
                    var profile = profileService.getProfile();
                    if (profile)
                        return profile.type == 'admin';
                    return '';
                };
                $scope.deleteUserNote= function(id){
                    apiService.account.deleteUserNote(id);
                };

                init= function(){
                    apiService.account.displayUserNotes().then(function(data){
                        if(data.items.length==0)
                        {
                            $scope.notes.push({
                                id: 0,
                                note: "Nobody hasn't written here",
                                note_by: '',
                                createTime: ''
                            });
                        }
                        else{
                        _.each(data.items, function(item){
                            $scope.notes.push({
                                id: item.note_id,
                                note: item.note,
                                note_by: item.note_by,
                                createTime: '24 minutes ago'
                            });
                        });
                    };
                    });
                };

                init();

            }]
        }
    })
})(angular.module('app'));
