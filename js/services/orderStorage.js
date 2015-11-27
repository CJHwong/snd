/*global angular */

/**
 * Services that persists and retrieves Orders from mongodb through node API.
 */
angular.module('sndApp', [])
	.service('orderStorage', ['$http', function ($http) {
		'use strict';

		return {
			get: function (date) {
				return $http.get('/api/orders', date);
			},

			delete: function (order) {
				return $http.delete('/api/orders/' + order._id);
			},

			post: function (order) {
				return $http.post('/api/orders', order);
			},

			put: function(orderId, newOrder) {
				return $http.put('/api/orders/' +  orderId, newOrder);
			}
		};
	}]);
