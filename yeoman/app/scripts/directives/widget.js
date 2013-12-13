'use strict';

angular.module('lpApp')
    .directive('locationText', ['$rootScope', function($rootScope) {
        return {
            restrict: 'E',
            scope: {
                locationText: '=location'
            },
            template:'{{locationText}}'
        }
    }]);


