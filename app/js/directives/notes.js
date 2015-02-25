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
                        return profile.firstname;
                    return '';
                };
                $scope.isAdmin = function () {
                    var profile = profileService.getProfile();
                    if (profile)
                        return profile.type == 'admin';
                    return '';
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
                            })

                            if (data.items && data.items.length > 0) {
                                $scope.notes.push({
                                    id: data.items[0].id,
                                    note: $scope.note.message,
                                    note_by: 'me',
                                    createTime: moment().format('2015-02-25 00:02:06')
                                })
                            }

                            $scope.note.message=null;
                        });
                };

                var minutesDiff = function (dateStr) {
                    var startTime = new Date();
                    startTime.setTime(Date.parse(dateStr));
                    var endTime = new Date();
                    var difference = endTime.getTime() - startTime.getTime();
                    return Math.round(difference / 60000);
                }

                init = function () {
                    apiService.account.displayUserNotes().then(function (data) {
                        if (data.items.length == 0) {
                            $scope.notes.push({
                                id: 0,
                                note: "Nobody hasn't written here",
                                note_by: '',
                                createTime: ''
                            });
                        }
                        else {
                            _.each(data.items, function (item) {
                                $scope.notes.push({
                                    id: item.note_id,
                                    note: item.note,
                                    note_by: item.note_by,
                                    createTime: item.created //minutesDiff(item.created)+ ' minutes ago'
                                });
                            });
                        }
                        ;
                    });
                };

                init();

            }]
        }
    })
})(angular.module('app'));
