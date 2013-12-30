'use strict';

angular.module('lpApp')
    .directive('pageHeader', [function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                title: '=title',
                description: '=description'
            },
            template:'<div class="pageText"><h2>{{title}}</h2><p>{{description}}</p></div>'
        }
    }]);

