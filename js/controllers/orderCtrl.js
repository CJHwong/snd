var sndApp = angular.module('sndApp');

sndApp.controller('orderCtrl', ['$scope', '$filter', 'orderStorage', function ($scope, $filter, orderStorage) {
    var d = new Date();
    $scope.orderDate = d.getFullYear()
		     + "/" + ((d.getMonth() + 1) < 10 ? '0':'') + (d.getMonth() + 1)
		     + "/" + (d.getDate() < 10 ? '0':'') + d.getDate();

    $scope.orders = {};
    orderStorage.get($scope.orderDate).success(function (data) {
        $scope.orders = data;
        for (var i = 0; i < $scope.orders.length; i++) {
            $scope.orders[i].pizzas = JSON.parse($scope.orders[i].pizzas);
        }
	setInterval(function () {
	    orderStorage.get($scope.orderDate).success(function (data) {
	        $scope.orders = data;
	        for (var i = 0; i < $scope.orders.length; i++) {
	            $scope.orders[i].pizzas = JSON.parse($scope.orders[i].pizzas);
		}
            });
	}, 3000);
    });

    $scope.checkTimeFormat = function ($event) {
        if ($scope.newOrderTime.length == 3 && $event.keyCode == 8) {
           $scope.newOrderTime = $scope.newOrderTime[0];
        } else if (isNaN($scope.newOrderTime.substring($scope.newOrderTime.length - 1, $scope.newOrderTime.length))) {
           $scope.newOrderTime = $scope.newOrderTime.substring(0, $scope.newOrderTime.length - 1);
        } else if ($scope.newOrderTime.length == 2) {
           $scope.newOrderTime = $scope.newOrderTime + ":";
        } else if ($scope.newOrderTime.length > 5) {
           $scope.newOrderTime = $scope.newOrderTime.substring(0, $scope.newOrderTime.length - 1);
        }
    }

    $scope.addOrder = function () {
        try {
            if ($scope.newOrderPhone.length != 0 || ($scope.newOrderPhone.length > 0 && $scope.newOrderPhone.length != 10)) {
                throw "Phone number is not correct"
            }
            var pizzas = $scope.newOrderFlavour.trim().split(',');
            for (var i = 0; i < pizzas.length; i++) {
                var pizza = {};
                pizza['flavour'] = pizzas[i];
                pizza['half'] = false;
                pizza['made'] = false;
                pizzas[i] = pizza;
            }
            var newOrder = {
                date: $scope.orderDate,
                time: $scope.newOrderTime.trim(),
                pizzaString: $scope.newOrderFlavour.trim(),
                pieces: $scope.newOrderPieces.trim(),
                name: $scope.newOrderName == undefined ? "" : $scope.newOrderName.trim(),
                phone: $scope.newOrderPhone == undefined ? "" : $scope.newOrderPhone.trim(),
                address: $scope.newOrderAddress == undefined ? "" : $scope.newOrderAddress.trim(),
                note: $scope.newOrderNote == undefined ? "" : $scope.newOrderNote.trim(),
                halfBox: $scope.newOrderHalfBox || false,
                paid: $scope.newOrderPaid || false,
                taken: $scope.newOrderTaken || false,
                pizzas: JSON.stringify(pizzas),
                done: false,
            };
        } catch (e) {
	    alert(e);
            return;
        }
        orderStorage.post(newOrder).success(function (data) {
            $scope.newOrder = '';
            $scope.orders = data;

	    $scope.newOrderTime = "";
	    $scope.newOrderPieces = "";
	    $scope.newOrderFlavour = "";
	    $scope.newOrderName = "";
	    $scope.newOrderPhone = "";
	    $scope.newOrderAddress = "";
	    $scope.newOrderNote = "";
        });

    };

    $scope.removeOrder = function (order) {
        orderStorage.delete(order).success(function (data) {
            $scope.orders = data; // assign our new list of orders
        });
    };

    $scope.pizzaMade = function (order, flavour) {
        var newOrder = order;
        for (var i = 0; i < newOrder.pizzas.length; i++) {
            if (flavour.trim() == newOrder.pizzas[i].flavour && newOrder.pizzas[i].made == false) {
                newOrder.pizzas[i].made = true;
                break;
            }
        }
        for (var i = 0; i < newOrder.pizzas.length; i++) {
            if (newOrder.pizzas[i].made == false) {
                newOrder.done = false;
                break;
            }
            newOrder.done = true;
        }
        newOrder.pizzas = JSON.stringify(newOrder.pizzas);
        orderStorage.put(newOrder._id, newOrder).success(function() {
		orderStorage.get().success(function (data) {
		    $scope.orders = data;
		    for (var i = 0; i < $scope.orders.length; i++) {
			$scope.orders[i].pizzas = JSON.parse($scope.orders[i].pizzas);
		    }
		})
	});
    }
}]);

sndApp.filter('dateFilter', [function () {
    return function (machines, myParam) {
        var result = {};

        angular.forEach(machines, function (machine, key) {
            if (machine.date == myParam) {
                result[key] = machine;
            }
        });
        return result;
    };
}]);

sndApp.filter('toArray', function () {
    'use strict';

    return function (obj) {
        if (!(obj instanceof Object)) {
            return obj;
        }

        return Object.keys(obj).filter(function(key){if(key.charAt(0) !== "$") {return key;}}).map(function (key) {
            return Object.defineProperty(obj[key], '$key', {__proto__: null, value: key});
        });
    };
});
