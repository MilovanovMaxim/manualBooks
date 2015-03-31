/**
 * Created by Администратор on 30.03.2015.
 */
(function (module, _) {
    module.controller('modal.addFaqControler', addFaqController);
    addFaqController.$inject = ['$scope', '$modal', '$modalInstance','apiService','profileService','notificationService'];
    function addFaqController($scope, $modal, $modalInstance,apiService,profileService ,notificationService) {
        $scope.model = {
            question: '',
            answer: '',
            notes: '',
            tags: []
        };

        $scope.addTag = function () {
            var modalInstance = $modal.open({
                templateUrl: 'tpl/modal.addTag.html',
                controller: 'modal.addTagController',
                resolve: {
                    items: function () {
                    }
                }
            });

            modalInstance.result.then(function (tags) {
                _.each(tags, function (tag) {
                    $scope.model.tags.push(tag);
                });

            }, function () {
            });
        };
        $scope.removeTag = function (tag) {
            $scope.model.tags = _.reject($scope.model.tags, function (item) {
                return item == tag;
            });
        };

        $scope.close = function () {
            $modalInstance.close();
        };
        $scope.ok = function () {
            var description = document.getElementById('wysiwyg');
            $scope.model.answer = angular.element(description).html();
            var userId=profileService.getUserId();
            return apiService.faq.addFaq(userId,$scope.model.question,$scope.model.answer,$scope.model.notes).then(function(result){
                //if(result.Items)
                //{
                //    var id= result.Items[0].Id;
                //}
                $modalInstance.close();
            }, function(error){
                notificationService.error(error.message, 'bottom_right');
                $modalInstance.close();
            });
        };
    }
})(angular.module('app'), _);
