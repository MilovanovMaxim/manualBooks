(function (module) {
    ZeroClipboard.config( { swfPath:'/vendor/ZeroClipboard.swf'});

    var client = new ZeroClipboard();
    ZeroClipboard.on("beforecopy", function(e) {
        client.setText(window.location.href);
    });


    client.setText( '' ); // onМouseDown будет копировать нужный текст

    module.directive('asideFooter', function () {
        return {
            restrict: 'E',
            templateUrl: 'tpl/blocks/aside.footer.html',
            controller: ['$scope', 'profileService', 'authService', '$state', function ($scope, profileService, authService, $state) {

                // Приклеили к кнопке с айди 'd_clip_button'
                client.clip(document.getElementById('d_clip_button'));

                $scope.getProfileName = function () {
                    var account = profileService.getProfile();
                    if (!account)
                        return '';
                    return account.firstname;// + ' ' + account.lastname;
                };

                $scope.asideFold = function(){
                    $scope.app.settings.asideFolded = !$scope.app.settings.asideFolded
                };

                $scope.logout = function () {
                    authService.logout();
                };
                $scope.openProfile = function () {
                    $state.go('show.user');
                };
            }]
        }
    })
})(angular.module('app'));
