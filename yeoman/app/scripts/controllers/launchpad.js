'use strict';



angular.module('lpApp')
    .controller('LaunchPadCtrl', ['$scope', '$rootScope', 'getGroups', 'getDSPInfo',
        function($scope, $rootScope, getGroups, getDSPInfo) {

        // Set Location Bar
        $rootScope.appLocation = getDSPInfo.name + ': Groups'

        $scope.groups = getGroups;
    }])
    .controller('LaunchPadGroupCtrl', ['$scope', '$rootScope', 'getApps', 'getDSPInfo', 'AppLaunchService',
        function($scope, $rootScope, getApps, getDSPInfo, AppLaunchService) {

        // Set Location Bar
        $rootScope.appLocation = getDSPInfo.name + ': ' + getApps.name;


        // Variables
        $scope.group = getApps;


        // Public API
        $scope.launchApp = function(app) {

            $scope.$broadcast('app:launch', app)
        };


        // Private API


        // Messages
        $scope.$on('app:launch', function(e, app) {

            AppLaunchService.launchApp(app);

        });
    }]);