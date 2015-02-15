angular.module('app').directive('mbPaginator', function(){
   return {
       restrict: 'AC',
       replace:true,
       template:'<ul ng-show="totalCount>pageSize" class="pagination pagination">\
                <li><a ng-click="onClick(currentPage-1)"><i class="fa fa-chevron-left"></i></a></li>\
                <li ng-repeat="i in getPageCount() track by $index" ng-class="{active:$index == currentPage}">\
                    <a ng-click="onClick($index)">{{$index+1}}</a>\
                </li>\
                <li><a ng-click="onClick(currentPage+1)"><i class="fa fa-chevron-right"></i></a></li>\
                </ul>',
       scope:{
           totalCount:'=',
           pageSize: '=',
           onPage: '&',
           currentPage: '='
       },
       controller: ["$scope", "apiService", function($scope, apiService){
           $scope.currentPage = 0;

           $scope.onClick = function (page) {
               if (page<0 || page>=$scope.totalCount) {
                   return;
               }

               $scope.currentPage = page;
               $scope.onPage({
                   page:page
               });
           }

           $scope.getPageCount = function() {
               var pageCount = ($scope.totalCount/$scope.pageSize) | 0;
               if (($scope.totalCount % $scope.pageSize) > 0) {
                   pageCount++;
               }

               return new Array(pageCount);
           }
       }]

   };
});