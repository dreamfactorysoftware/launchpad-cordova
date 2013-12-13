'use strict';


angular.module('lpApp')
    .controller('NavCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {

        $scope.goBack = function () {
            if ($rootScope.appLocation === 'Home') {
                return false;
            }

            history.back();
        }
    }])
    .controller('HomeCtrl', ['$scope', '$rootScope', 'getDSPList', function ($scope, $rootScope, getDSPList) {

        // Set Location Bar
        $rootScope.appLocation = "Home";

        $scope.dsps = getDSPList;


    }])
    .controller('LoginCtrl', ['$scope', '$rootScope', '$location', '$q', 'AppStorageService', 'getDSPConfig', 'UserService', 'MessageService',
        function ($scope, $rootScope, $location, $q, AppStorageService, getDSPConfig, UserService, MessageService) {

            // Set Location Bar
            $rootScope.appLocation = "Login: " + getDSPConfig.name;


            $scope.currentDSP = getDSPConfig;
            $scope.user = {};


            // Public API
            $scope.userLogin = function (user) {

                $scope.$broadcast('user:userLogin', user);
            };

            $scope.guestLogin = function () {

                $scope.$broadcast('user:guestLogin');
            };


            // Private API

            $scope._userLogin = function (user) {

                var defer = $q.defer();

                UserService.session().save(user,
                    function (response) {
                        defer.resolve(response);
                    },
                    function (response) {
                        defer.reject(response);
                    }
                );

                return defer.promise;
            };

            $scope._guestLogin = function () {

                var defer = $q.defer();

                UserService.session().get(
                    function (response) {
                        defer.resolve(response);
                    },
                    function (response) {
                        defer.reject(response)
                    }
                );

                return defer.promise;
            };


            // Messages

            $scope.$on('user:userLogin', function (e, user) {

                UserService.currentDSPUrl = $scope.currentDSP.url;
                $scope._userLogin(user).then(
                    function (result) {
                        AppStorageService.User.save(result);
                        AppStorageService.URL.save($scope.currentDSP);
                        $scope.currentDSP['config'] = result;
                        AppStorageService.Apps.save($scope.currentDSP);
                        AppStorageService.Config.save($scope.currentDSP);
                        $location.replace().url('/launchpad');
                    },
                    function (reason) {
                        throw {message: 'Unable to login: ' + MessageService.getFirstMessage(reason)}
                    });
            });

            $scope.$on('user:guestLogin', function (e) {

                UserService.currentDSPUrl = $scope.currentDSP.url;
                $scope._guestLogin().then(function (result) {
                    console.log(result);
                    AppStorageService.User.save(result);
                    AppStorageService.URL.save($scope.currentDSP);
                    $scope.currentDSP['config'] = result;
                    AppStorageService.Apps.save($scope.currentDSP);
                    AppStorageService.Config.save($scope.currentDSP);
                    $location.replace().url('/launchpad');
                },
                function(reason) {
                    throw {message: 'Unable to login: ' + MessageService.getFirstMessage(reason)}
                });
            })
        }])
    .controller('AppSettingsCtrl', ['$scope', '$rootScope', function ($scope, $rootScope) {
        // Set Location Bar
        $rootScope.appLocation = "Settings";

    }])
    .controller('DSPListCtrl', ['$scope', '$rootScope', 'getDSPList', function ($scope, $rootScope, getDSPList) {

        // Set Location Bar
        $rootScope.appLocation = "Settings: DSP List";

        $scope.dsps = getDSPList;


    }])
    .controller('DSPSettingsCtrl', ['$scope', '$q', '$rootScope', '$location', 'getDSP', 'AppStorageService', 'SystemService', 'NotificationService',
        function ($scope, $q, $rootScope, $location, getDSP, AppStorageService, SystemService, NotificationService) {

            // Set Location Bar
            $rootScope.appLocation = "Settings: " + getDSP.name;


            $scope.currentDSP = getDSP;
            $scope.UISettings = getDSP.UISettings;


            // Public API
            $scope.saveDSPSettings = function (UISettings) {

                $scope.$broadcast('settings:save', UISettings);
            };

            $scope.updateConfig = function () {

                $scope.$broadcast('settings:updateFromServer', $scope.currentDSP);
            };

            $scope.removeDSP = function() {

                $scope.$broadcast('settings:removeDSP');
            };


            // Private API

            $scope._getConfigFromServer = function(dsp) {

                var defer = $q.defer();

                SystemService.config(dsp.url).get(
                    function (response) {
                        defer.resolve(response);
                    },
                    function (response) {
                        defer.reject(response);
                    }
                );

                return defer.promise;
            };


            // Messages

            $scope.$on('settings:save', function (e, UISettings) {

                AppStorageService.DSP.UISettings.save($scope.currentDSP, UISettings);
                NotificationService.alertDialog('Settings saved.');

            });

            $scope.$on('settings:updateFromServer', function (e, dsp) {

                $scope._getConfigFromServer(dsp).then(
                    function(response) {
                        AppStorageService.DSP.Config.save($scope.currentDSP, response);
                        NotificationService.alertDialog('Config Updated');
                    },
                    function(reason) {
                        throw {message: 'Unable to connect to server'}
                    }
                )
            });

            $scope.$on('settings:removeDSP', function(e) {

                var confirmFunc = function () {
                    if (AppStorageService.DSP.delete($scope.currentDSP)) {
                        $location.replace().url('/dsp-settings');
                    }
                };

                var confirm = {
                    message:  'You are about to delete ' +$scope.currentDSP.name + ' from your lists',
                    confirmCallback: confirmFunc,
                    title: 'Delete DSP'
                };

                NotificationService.confirmDialog(confirm);

            });
        }])
    .controller('GetDSPCtrl', ['$scope', '$q', '$rootScope', '$location', 'SystemService', 'AppStorageService',
        function ($scope, $q, $rootScope, $location, SystemService, AppStorageService) {

            // Set Location Bar
            $rootScope.appLocation = "Add A DSP";

            $scope.dsp = {};


            // Public API

            $scope.getDSP = function (dsp) {
                $scope.$broadcast('dsp:get', dsp);
            };

            // Private API

            $scope._getDSP = function(dsp) {

                var defer = $q.defer();

                SystemService.config(dsp.url).get(
                    function (response) {
                        defer.resolve(response)
                    },
                    function (reason) {
                        defer.reject(dsp);
                    });

                return defer.promise;
            };


            // Messages

            $scope.$on('dsp:get', function (e, dsp) {

                $scope._getDSP(dsp).then(
                    function (result) {
                        dsp.config = result;
                        dsp.UISettings = {
                            openRegistration: false,
                            guestUsers: false,
                            unGroupedApps: {}
                        };

                        AppStorageService.DSP.save(dsp);
                        $location.url('/');

                    },
                    function (reason) {
                        throw {message: 'Unable to connect ' + dsp.name + ' at ' + dsp.url}
                    });

            })
        }]);