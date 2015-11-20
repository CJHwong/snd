angular.module('sndApp')
    .controller('orderCtrl', ['$scope', '$filter', 'orderStorage', function ($scope, $filter, orderStorage) {
        $scope.orders = {};
        orderStorage.get().success(function (data) {
            $scope.orders = data;
            for (var i = 0; i < $scope.orders.length; i++) {
                $scope.orders[i].pizzas = JSON.parse($scope.orders[i].pizzas);
            }
        });
        setInterval(function() {
            orderStorage.get().success(function (data) {
                $scope.orders = data;
                for (var i = 0; i < $scope.orders.length; i++) {
                    $scope.orders[i].pizzas = JSON.parse($scope.orders[i].pizzas);
                }
            });
        }, 3000);

        $scope.addOrder = function () {
            try {
                var pizzas = $scope.newOrderFlavour.trim().split(',');
                for (var i = 0; i < pizzas.length; i++) {
                    var pizza = {};
                    pizza['flavour'] = pizzas[i];
                    pizza['half'] = false;
                    pizza['made'] = false;
                    pizzas[i] = pizza;
                }
                var newOrder = {
                    date: "",
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
                alert("Please complete necesary forms");
                return;
            }
            orderStorage.post(newOrder).success(function (data) {
                $scope.newOrder = '';
                $scope.orders = data;
            });
        };

        $scope.removeOrder = function (order) {
            orderStorage.delete(order).success(function (data) {
                $scope.orders = data; // assign our new list of orders
            });
        };

        $scope.pizzaMade = function(order, flavour) {
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
            console.log(newOrder);
            orderStorage.put(newOrder._id, newOrder);
            orderStorage.get().success(function (data) {
                $scope.orders = data;
                for (var i = 0; i < $scope.orders.length; i++) {
                    $scope.orders[i].pizzas = JSON.parse($scope.orders[i].pizzas);
                }
            });
        }
    }]);
