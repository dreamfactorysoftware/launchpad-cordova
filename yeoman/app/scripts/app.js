'use strict';

angular.module('lpApp', [
        'ngRoute',
        'ngResource',
        'hmTouchEvents'
    ])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                resolve: {
                    hasDSP: ['$location', 'AppStorageService', function($location, AppStorageService){

                        if (AppStorageService.DSP.getAll()) {

                            $location.replace().url('/home')

                        }else {
                            $location.replace().url('/welcome')
                        }
                    }]
                }
            })
            .when('/welcome', {
                templateUrl: 'views/public/welcome.html',
                controller: 'WelcomeCtrl'
            })
            .when('/get-started', {
                templateUrl: 'views/public/get-started.html',
                controller: 'GetStartedCtrl'
            })
            .when('/home', {
                templateUrl:'views/public/home.html',
                controller: 'HomeCtrl',
                resolve: {
                    getDSPList: ['AppStorageService', '$q', '$location', function(AppStorageService, $q, $location) {

                        var dspList = AppStorageService.DSP.getAll();

                        angular.forEach(dspList, function(obj) {

                            if(!obj['modes']) {
                                obj['modes'] = {
                                    length: 0,
                                    currentMode: 0,
                                    add: function(mode) {
                                        Array.prototype.push.call(this, mode)
                                    },
                                    next: function() {
                                        if (this.currentMode === (this.length-1)) {
                                            this.currentMode = 0;
                                        }
                                        else {
                                            this.currentMode++
                                        }
                                    },

                                    previous: function() {
                                        if (this.currentMode === 0) {
                                            this.currentMode = this.length -1
                                        }
                                        else {
                                            this.currentMode--
                                        }
                                    }

                                };
                                obj.modes.add('Home');
                                obj.modes.add('Settings');
                            }
                        });

                        if (dspList) {
                            return dspList;
                        }
                        else {
                            $location.replace().url('/welcome');
                        }

                        return false;

                    }]
                }
            })
            .when('/app-settings', {
                templateUrl: 'views/public/settings/app-settings.html',
                controller: 'AppSettingsCtrl'
            })
            .when('/dsp-settings', {
                templateUrl: 'views/public/settings/dsp-settings.html',
                controller: 'DSPListCtrl',
                resolve: {

                    getDSPList:['AppStorageService', function(AppStorageService) {

                        return AppStorageService.DSP.getAll();
                    }]
                }
            })
            .when('/dsp-settings/:dsp', {
                templateUrl: 'views/public/settings/dsp-settings-expand.html',
                controller: 'DSPSettingsCtrl',
                resolve: {

                    getDSP:['$route', '$q', 'SystemService', 'AppStorageService', function($route, $q, SystemService, AppStorageService) {

                        return AppStorageService.DSP.get($route.current.params.dsp);
                    }]
                }
            })
            .when('/connect-to-dsp', {
                templateUrl: 'views/public/connect-to-dsp.html',
                controller: 'ConnectDSPCtrl'
            })
            .when('/go-to-dsp/:dsp', {
                resolve: {
                    getDSPConfig: ['$route', '$q', '$location', 'AppStorageService', 'UserService', 'MessageService',
                        function ($route, $q, $location, AppStorageService, UserService, MessageService) {

                            // Get the currently selected DSP info out of our localStorage
                            var dsp = AppStorageService.DSP.get($route.current.params.dsp);

                            // Is this the current DSP?
                            if (dsp.url === AppStorageService.URL.get().currentURL) {

                                // It is so just take us to launchpad for this DSP
                                $location.replace().url('/launchpad');

                                // Stop executing
                                return false;
                            }


                            // This is a different DSP.
                            // Do we need to be authorized to access?
                            if (!dsp.config.allow_guest_user) {

                                // Yes we do.  No guest users allowed
                                // Render login page
                                $location.replace().url('/login/' + dsp.id);

                                // Stop Executing
                                return false;
                            }


                            // This function is called below.
                            // It will retrieve our guest session which will contain
                            // what apps we have access to as a guest/unregistered user.
                            // Use deferred because we have to operate on that data when
                            // it comes back.  No fire and forget here.
                            function _guestLogin () {

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
                            }

                            // We allow guests.  Let's get the guest information
                            // and setup the dsp for guest access.
                            // First, we set the url for the DSP we will make a call to
                            UserService.currentDSPUrl = dsp.url;

                            // Then grab our guest session and store some info
                            // about what we're doing in the browser sessionStorage
                            _guestLogin().then(function (result) {

                                    // Store some info about our user
                                    // We store the session id to use in our http header.
                                    // We also store a boolean called 'authenticated' that we use
                                    // to show/hide UI elements
                                    AppStorageService.User.save(result);

                                    // We save our current working URL just in case we need to
                                    // know about where we're looking
                                    AppStorageService.URL.save(dsp);

                                    // We store the result from our async call(which was deferred)
                                    // in a variable called 'user' as it contains 'Guest User' information.
                                    // See description of _guestLogin function above
                                    dsp['user'] = result;

                                    // This requires the dsp.user property we just assigned to sort, group,
                                    // and store our apps for display.
                                    AppStorageService.Apps.save(dsp);

                                    // We also save the current DSP Config so we can reference it quickly
                                    AppStorageService.Config.save(dsp);

                                    // Last but not least...let's go see what we've loaded in launchpad
                                    $location.url('/launchpad');

                                    // Stop Executing
                                    return false;
                                },
                                function(reason) {

                                    // There was an error
                                    // Alert the user
                                    throw {message: 'Unable to login: ' + MessageService.getFirstMessage(reason)}
                                });

                        }]
                }
            })
            .when('/login', {
                resolve: {
                    getDSPId: ['$location', 'AppStorageService',
                        function($location, AppStorageService) {
                            $location.replace().url('/login/' + AppStorageService.Config.get().id);
                    }]
                }
            })
            .when('/login/:dsp', {
                templateUrl: 'views/public/login.html',
                controller: 'LoginCtrl',
                resolve: {
                    getDSPConfig: ['$route', '$location', 'AppStorageService',
                        function($route, $location, AppStorageService) {
                            return AppStorageService.DSP.get($route.current.params.dsp);
                    }]
                }
            })
            .when('/logout', {
                resolve: {
                    logout:['$location', '$rootScope', '$http', 'UserService', 'StorageService',
                        function($location, $rootScope, $http, UserService, StorageService) {

                        StorageService.sessionStorage.clear();
                        UserService.session().delete();
                        $http.defaults.headers.common['X-DreamFactory-Session-Token'] = '';
                        UserService.reset();
                        $rootScope.authenticated = false;
                        $rootScope.guestUser = false;

                        $location.path('/');
                    }]
                }
            })
            .when('/launchpad', {
                templateUrl: 'views/launchpad.html',
                controller: 'LaunchPadCtrl',
                resolve: {
                    getGroups: ['AppStorageService', function(AppStorageService) {

                        return AppStorageService.Apps.get();
                    }],

                    getDSPInfo: ['AppStorageService', function(AppStorageService) {

                        return AppStorageService.Config.get();
                    }]
                }
            })
            .when('/launchpad/:groupId',{
                templateUrl: 'views/launchpad-group.html',
                controller: 'LaunchPadGroupCtrl',
                resolve: {
                    getApps: ['$route', 'AppStorageService', function($route, AppStorageService) {

                        var group = AppStorageService.Apps.getAppsFromGroup($route.current.params.groupId);


                        angular.forEach(group.apps, function(obj) {

                            if (!obj['modes']) {

                                obj['modes'] = {
                                    length: 0,
                                    currentMode: 0,
                                    add: function(mode) {
                                        Array.prototype.push.call(this, mode);

                                    },
                                    next: function() {
                                        if (this.currentMode === (this.length-1)) {
                                            this.currentMode = 0;
                                        }
                                        else {
                                            this.currentMode++
                                        }
                                    },

                                    previous: function() {
                                        if (this.currentMode === 0) {
                                            this.currentMode = this.length -1
                                        }
                                        else {
                                            this.currentMode--
                                        }
                                    }
                                }

                                obj.modes.add('Home');
                                obj.modes.add('Description');
                            }

                        });


                        return group;
                    }],

                    getDSPInfo: ['AppStorageService', function(AppStorageService) {

                        return AppStorageService.Config.get();
                    }]

                }
            })
            .when('/app-detail/:groupId/:appId', {
                templateUrl: 'views/app-detail.html',
                controller: 'AppDetailCtrl',
                resolve: {
                    getAppInfo: ['$route', 'AppStorageService', function($route, AppStorageService) {

                        return  AppStorageService.Apps.getSingleApp($route.current.params.groupId, $route.current.params.appId);

                    }]
                }
            })
            .when('/profile', {
                templateUrl: 'views/profile.html',
                controller: 'ProfileCtrl',
                resolve: {
                    userInfo:['UserService', '$q', function(UserService, $q) {

                        var defer = $q.defer();

                        UserService.profile().get(
                            function(response) {
                                defer.resolve(response);
                            },
                            function(response) {
                                defer.reject(response);
                            }
                        );

                        return defer.promise;
                    }],

                    userApps: ['UserService', '$q', function(UserService, $q) {

                        var defer = $q.defer(),
                            apps = [];

                        function getAppsFromGroups(response) {
                            angular.forEach(response.app_groups, function(group, index){
                                angular.forEach(group.apps, function(app, i) {
                                    apps.push(app);
                                });
                            });
                        }

                        function getAppsFromNoGroup(response) {
                            angular.forEach(response.no_group_apps, function(group, index){
                                angular.forEach(group.apps, function(app, i) {
                                    apps.push(app);
                                });
                            });
                        }

                        UserService.session().get(
                            function(response) {
                                getAppsFromGroups(response);
                                getAppsFromNoGroup(response);
                                defer.resolve(apps);
                            },
                            function(response) {
                                defer.reject(response);
                            }
                        );

                        return defer.promise;
                    }]
                }
            })
            .otherwise({
                redirectTo: '/'
            });
    }])
    .config(['$httpProvider', function($httpProvider) {

        $httpProvider.defaults.headers.common['X-DreamFactory-Application-Name'] = 'launchpad';

        /*
        var interceptor = function($rootScope, $location, $q) {

            var success = function(response) {

                return response;
            };

            var error = function(response) {

                if (response.status == 401) {

                    console.log(response)
                }

                return $q.reject(response);
            };

            return function(promise) {

                return promise.then(success, error);
            }

        }
        */
    }])
    .config(['$provide', function ($provide) {
        $provide.decorator('$exceptionHandler', ['$delegate', '$injector', function ($delegate, $injector) {
            return function (exception, cause) {

                $injector.invoke(['NotificationService', function (NotificationService) {

                    NotificationService.alertDialog(exception.message);
                }]);

                return $delegate(exception, cause);
            }
        }]);
    }])
    .run(['$route', '$rootScope', '$location', '$http', 'UserService', 'AppStorageService',
        function ($route, $rootScope, $location, $http, UserService, AppStorageService) {

        $rootScope.$on('$routeChangeStart', function(scope, next, current) {

            var protectedRoutes = [
                '/launchpad/:groupId',
                '/launchpad',
                '/profile'
            ];

            var path = next.$$route.originalPath;

            angular.forEach(protectedRoutes, function(v, i) {
                if (path === v) {

                    if (AppStorageService.User.get().sessionId) {
                        $http.defaults.headers.common['X-DreamFactory-Session-Token'] = AppStorageService.User.get().sessionId;
                    }

                $rootScope.authenticated = AppStorageService.User.get().authenticated;
                $rootScope.guestUser = AppStorageService.User.get().guestUser;

                    UserService.currentDSPUrl = AppStorageService.URL.get().currentURL;
                    UserService.session().get(
                        function(response) {
                            $location.url();
                        },
                        function(response) {

                            $location.url('/');
                        }
                    )
                }
            })
        })
    }]);
