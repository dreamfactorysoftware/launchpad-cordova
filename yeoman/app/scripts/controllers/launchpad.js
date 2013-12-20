'use strict';


angular.module('lpApp')
    .controller('LaunchPadCtrl', ['$scope', '$rootScope', '$location', 'getGroups', 'getDSPInfo', 'AppLaunchService', 'AppStrings', 'ObjectService',
        function ($scope, $rootScope, $location, getGroups, getDSPInfo, AppLaunchService, AppStrings, ObjectService) {

            // Set App Location
            $rootScope.appLocation = 'Launchpad';

            $scope.overridePageStrings = {
                title: getDSPInfo.name,
                description: ''
            };

            $scope.pageText = ObjectService.extend(AppStrings.getLaunchPadStrings, $scope.overridePageStrings);


            $scope.groups = getGroups;


            // PUBLIC API

            $scope.singleTapGroup = function (group) {

                $scope.$broadcast('tap:single:group', group)
            };

            $scope.singleTapApp = function (app) {

                $scope.$broadcast('tap:single:app', app);
            };

            $scope.holdApp = function(app) {

                $scope.$broadcast('hold:app', app);
            };


            // PRIVATE API

            $scope._launchApp = function (app) {

                AppLaunchService.launchApp(app);
            };

            $scope._launchGroup = function (group) {

                $location.url('/launchpad/' + group.id)
            };

            $scope._launchAppDetail = function(group, app) {

                $location.url('/app-detail/'+ group.id + '/' + app.id);
            };


            // MESSAGES

            $scope.$on('tap:single:group', function (e, group) {

                $scope._launchGroup(group);
            });

            $scope.$on('tap:single:app', function (e, app) {

                $scope._launchApp(app);
            });

            $scope.$on('hold:app', function(e, app) {

                var group = {
                    id: 'ungrouped'
                };

                $scope._launchAppDetail(group, app);
            });

        }])
    .controller('LaunchPadGroupCtrl', ['$scope', '$rootScope', '$location', 'getApps', 'getDSPInfo', 'AppLaunchService', 'AppStrings', 'ObjectService',
        function ($scope, $rootScope, $location, getApps, getDSPInfo, AppLaunchService, AppStrings, ObjectService) {

            // Set App Location
            $rootScope.appLocation = 'LaunchPad Group';

            $scope.overridePageStrings = {
                title: getDSPInfo.name + ': ' + getApps.name,
                description: ''
            };


            $scope.pageText = ObjectService.extend(AppStrings.getLaunchPadGroupStrings, $scope.overridePageStrings);


            // Variables
            $scope.group = getApps;


            // PUBLIC API
            $scope.singleTap = function (app) {

                $scope.$broadcast('tap:single', app);
            };

            $scope.holdApp = function(app) {

                $scope.$broadcast('hold:app', app);
            };



            // PRIVATE API

            $scope._launchApp = function (app) {

                AppLaunchService.launchApp(app);
            };

            $scope._changeModeForward = function (app) {

                app.modes.next();
            };

            $scope._changeModeBackward = function (app) {

                app.modes.previous();
            };

            $scope._launchAppDetail = function(group, app) {


                $location.url('/app-detail/'+ group.id + '/' + app.id);
            };


            // MESSAGES
            $scope.$on('tap:single', function (e, app) {

                    $scope._launchApp(app);
            });


            $scope.$on('hold:app', function(e, app) {

                $scope._launchAppDetail($scope.group, app);
            });
        }])
    .controller('AppDetailCtrl', ['$scope', '$rootScope', '$location', 'getAppInfo', 'AppLaunchService', 'AppStrings', 'ObjectService',
        function ($scope, $rootScope, $location, getAppInfo, AppLaunchService, AppStrings, ObjectService) {

            // Set App Location
            $rootScope.appLocation = 'App Detail';

            $scope.overridePageStrings = {
                title: 'App Info: ' + getAppInfo.name,
                description: '',
                info: getAppInfo
            };

            $scope.app = getAppInfo;

            $scope.pageText = ObjectService.extend(AppStrings.getAppInfoStrings, $scope.overridePageStrings);


            $scope.moreInfoData = false;

            // PUBLIC API

            $scope.launchApp = function() {

                $scope.$broadcast('app:launch');
            };

            $scope.moreDetail = function() {

                $scope.$broadcast('app:moreDetail');
            };


            // PRIVATE API
            $scope._moreDetail = function() {

                if ($scope.moreInfoData === false) {
                    $scope.moreInfoData = true;
                }
                else {
                    $scope.moreInfoData = false
                }
            };


            // MESSAGES

            $scope.$on('app:launch', function(e) {


                AppLaunchService.launchApp($scope.app);
            });


            $scope.$on('app:moreDetail', function(e) {

                $scope._moreDetail();
            });



        }]);