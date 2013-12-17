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


            // Messages

            $scope.$on('user:userLogin', function (e, user) {

                UserService.currentDSPUrl = $scope.currentDSP.url;
                $scope._userLogin(user).then(
                    function (result) {
                        AppStorageService.User.save(result);
                        AppStorageService.URL.save($scope.currentDSP);
                        $scope.currentDSP['user'] = result;
                        AppStorageService.Apps.save($scope.currentDSP);
                        AppStorageService.Config.save($scope.currentDSP);
                        $location.replace().url('/launchpad');
                    },
                    function (reason) {
                        throw {message: 'Unable to login: ' + MessageService.getFirstMessage(reason)}
                    });
            });
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

            // Store the current DSP
            $scope.currentDSP = getDSP;

            // Extract the UI settings for the current DSP
            $scope.UISettings = getDSP.UISettings;


            // PUBLIC API
            // Facade for the ui
            // This should be self explanatory
            $scope.saveDSPSettings = function (UISettings) {

                $scope.$broadcast('settings:save', UISettings);
            };

            $scope.updateConfig = function () {

                $scope.$broadcast('settings:updateFromServer', $scope.currentDSP);
            };

            $scope.removeDSP = function() {

                $scope.$broadcast('settings:removeDSP');
            };


            // PRIVATE API

            // We need to get the most current config from the server
            // So we make a call passing in the current dsp so we can
            // use the dsp.url to call the right server
            // Use deferred so we can operate on the data later
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


            // MESSAGES
            // This is where we handle the complex aspects of the ui facade(PUBLIC API)

            // We receive the settings:save message with the UI settings passed in
            $scope.$on('settings:save', function (e, UISettings) {

                // Then we save/update the settings on the local storage
                AppStorageService.DSP.UISettings.save($scope.currentDSP, UISettings);

                // Then we notify the user that the settings have been saved
                NotificationService.alertDialog('Settings saved.');

            });

            // We received the settings:updateFromServer message
            $scope.$on('settings:updateFromServer', function (e, dsp) {

                // We get the new config from the server and then...
                $scope._getConfigFromServer(dsp).then(
                    function(response) {

                        // Update the current DSP config in localStorage with the new config from the server
                        AppStorageService.DSP.Config.save($scope.currentDSP, response);

                        // Notify the user that the config update was successful
                        NotificationService.alertDialog('Config Updated');
                    },
                    function(reason) {

                        // We were unable to connect to the server to get a new config
                        // This will alert the user
                        throw {message: 'Unable to connect to server'}
                    }
                )
            });

            // We received the settings:removeDSP message
            // This requires user confirmation
            $scope.$on('settings:removeDSP', function(e) {

                // Because this requires user confirmation we have to setup a function
                // to be called if the user confirms.  We have to attach that function
                // to an object that is passed to the NotificationService.
                var confirmFunc = function () {

                    //  Check if the DSP was deleted
                    if (AppStorageService.DSP.delete($scope.currentDSP)) {

                        // Reroute on success because this settings pages' data
                        // no longer exists.
                        $location.replace().url('/dsp-settings');
                    }
                };

                // Here we build the object that we will pass to the NotificationService
                var confirm = {

                    // We add a custom message to display to the user
                    message:  'You are about to delete ' +$scope.currentDSP.name + ' from your lists',

                    // The call back we wish to be executed if the user confirms.
                    // We built this previously
                    confirmCallback: confirmFunc,

                    // and we add a custom Title for the confirm box
                    title: 'Delete DSP'
                };

                // Execute the NotificationService and let the user decide what to do.
                // If they cancel...nothing happens.
                // If they confirm...the DSP is deleted and we move on.
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