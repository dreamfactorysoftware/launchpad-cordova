'use strict';

angular.module('lpApp')
    .directive('pageHeader', [function() {
        return {
            restrict: 'E',
            scope: {
                title: '=title',
                description: '=description'
            },
            template:'<h2 class="pageText">{{title}}</h2><hr /><p class="pageText">{{description}}</p>'
        }
    }]);

