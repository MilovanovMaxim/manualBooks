(function (module) {
    module.directive('notes', function () {
        return {
            restrict: 'E',
            templateUrl: 'tpl/blocks/notes.html',
            scope: {},
            controller: ["$scope", "profileService", "apiService", function ($scope, profileService, apiService) {

                $scope.notes = [];
                $scope.note = {
                    message: null
                };
                $scope.profileName = function () {
                    var profile = profileService.getProfile();
                    if (profile)
                        return profile.firstname +' '+ profile.lastname;
                    return '';
                };
                $scope.isAdmin = function () {
                    var profile = profileService.getProfile();
                    if (profile)
                        return profile.type == 'admin';
                    return '';
                };
                $scope.canDelete= function(isLast, author){
                    if(!isLast)
                        return false;
                    if($scope.isAdmin())
                        return true;
                    if($scope.profileName()==author)
                        return true;
                    return false;
                };
                $scope.deleteUserNote = function (id) {
                    apiService.account.deleteUserNote(id).then(function(){
                        $scope.notes = _.reject($scope.notes, function (note) {
                            return note.id == id;
                        })
                    });
                };
                $scope.addUserNote = function () {
                    if ($scope.note.message.length > 0)
                        apiService.account.addUserNote({
                            admin_id: profileService.getUserId(),
                            note: $scope.note.message,
                            user_id: profileService.getUserId()
                        }).then(function (data) {
                            $scope.notes = _.reject($scope.notes, function (note) {
                                return note.id == 0;
                            });

                            if (data.items && data.items.length > 0) {
                                $scope.notes.push({
                                    id: data.items[0].id,
                                    note: $scope.note.message,
                                    note_by: $scope.profileName(),
                                    createTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                                    avatar: profileService.getAvatar()
                                });
                            }

                            $scope.note.message=null;
                        });
                };

                $scope.deleteAllUserNotes= function(){
                    apiService.account.deleteAllUserNotes().then(function(){
                        $scope.notes = _.reject($scope.notes, function (note) {
                            return note.note_by == $scope.profileName();
                        });
                        if($scope.notes.length==0)
                        {
                            addEmptyNote();
                        }
                    });
                };

                var minutesDiff = function (dateStr) {
                    var startTime = new Date();
                    startTime.setTime(Date.parse(dateStr));
                    var endTime = new Date();
                    var difference = endTime.getTime() - startTime.getTime();
                    return Math.round(difference / 60000);
                };

                var addEmptyNote= function(){
                    $scope.notes.push({
                        id: 0,
                        note: "Nobody hasn't written here",
                        note_by: '',
                        createTime: '',
                        avatar: '../img/a0.jpg'
                    });
                };

                init = function () {
                    apiService.account.displayUserNotes().then(function (data) {
                        if (data.items.length == 0) {
                            addEmptyNote();
                        }
                        else {
                            _.each(data.items, function (item) {
                                $scope.notes.push({
                                    id: item.note_id,
                                    note: item.note,
                                    note_by: item.note_by==='me' ? $scope.profileName() : item.note_by,
                                    createTime: item.created,
                                    avatar:  item.avatar ? item.avatar : '../img/a0.jpg'//minutesDiff(item.created)+ ' minutes ago'
                                });
                            });
                            $scope.notes= _.sortBy($scope.notes, 'id');
                        }
                        ;
                    });
                };

                init();

            }]
        }
    })
})(angular.module('app'));
