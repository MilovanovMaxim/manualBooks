app.controller('GlossaryCtrl', ['$scope', '$http', '$filter', function($scope, $http, $filter) {
  $http.get('js/app/glossary/glossary.json').then(function (resp) {
    $scope.items = resp.data.items;
    $scope.item = $filter('orderBy')($scope.items, 'FAQ')[0];
    $scope.item.selected = true;
    $scope.loadOrders();
  });

  $scope.filter = '';

  $scope.checkItem = function(obj, arr, key){
    var i=0;
    angular.forEach(arr, function(item) {
      if(item[key].indexOf( obj[key] ) == 0){
        var j = item[key].replace(obj[key], '').trim();
        if(j){
          i = Math.max(i, parseInt(j)+1);
        }else{
          i = 1;
        }
      }
    });
    return obj[key] + (i ? ' '+i : '');
  };

  $scope.selectItem = function(item){    
    angular.forEach($scope.items, function(item) {
      item.selected = false;
      item.editing = false;
    });
    $scope.item = item;
    $scope.item.selected = true;
    $scope.selectedCustomer = item.FAQ;
    $scope.loadOrders();
  };

  $scope.loadOrders = function () {
            //  Reset our list of orders  (when binded, this'll ensure the previous list of orders disappears from the screen while we're loading our JSON data)
            $scope.listOfOrders = null;
            //alert($scope.selectedCustomer);
            //  The user has selected a Customer from our Drop Down List.  Let's load this Customer's records.
            //$http.get('js/app/glossary2/getBasketsForCustomer.json/' + $scope.selectedCustomer)
            $http.get('js/app/glossary/glossarydetail.json').success(function (data) {
                        $scope.listOfOrders = data.gggxxx;
                    })
                    .error(function (data, status, headers, config) {
                        $scope.errorMessage = "Couldn't load the list of FAQs, error # " + status;
                    });
        }

}]);

////////////
