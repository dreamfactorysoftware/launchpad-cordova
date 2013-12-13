'use strict';

angular.module('lpApp', [
        'ngRoute',
        'ngResource'
    ])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                resolve: {
                    hasDSP: ['$location', 'AppStorageService', function($location, AppStorageService){

                        var dspList = AppStorageService.DSP.getAll();

                        if (dspList) {

                            $location.replace().url('/home')

                        }else {
                            $location.replace().url('/welcome')
                        }
                    }]
                }
            })
            .when('/get-started', {
                templateUrl: 'views/public/get-started.html',
                resolve: {
                    setAppLocation: ['$rootScope', function($rootScope) {
                        $rootScope.appLocation = 'Get Started'
                    }]
                }
            })
            .when('/home', {
                templateUrl:'views/public/home.html',
                controller: 'HomeCtrl',
                resolve: {
                    getDSPList: ['AppStorageService', '$q', '$location', function(AppStorageService, $q, $location) {

                        var dspList = AppStorageService.DSP.getAll();

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
            .when('/welcome', {
                templateUrl: 'views/public/welcome.html',
                resolve: {
                    setAppLocation: ['$rootScope', function($rootScope) {

                        $rootScope.appLocation = 'Welcome to Launchpad!'

                    }]
                }
            })
            .when('/app-settings', {
                templateUrl: 'views/public/app-settings.html',
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
            .when('/get-dsp-form', {
                templateUrl: 'views/utility/forms/get-dsp-form.html',
                controller: 'GetDSPCtrl'
            })
            .when('/login/:dsp', {
                templateUrl: 'views/public/login.html',
                controller: 'LoginCtrl',
                resolve: {
                    getDSPConfig: ['$route', '$http', '$q', '$location', 'AppStorageService',
                        function($route, $http, $q, $location, AppStorageService) {
                        var dsp =  AppStorageService.DSP.get($route.current.params.dsp);

                        if (dsp.url === AppStorageService.URL.get().currentURL) {
                            $location.replace().url('/launchpad');
                        }

                        return dsp;
                    }]
                }
            })
            .when('/logout', {
                resolve: {
                    logout:['$location', '$rootScope', 'UserService', 'StorageService',
                        function($location, $rootScope, UserService, StorageService) {

                        StorageService.sessionStorage.clear();
                        UserService.session().delete();
                        UserService.reset();
                        $rootScope.authenticated = false;
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

                        return AppStorageService.Apps.getAppsFromGroup($route.current.params.groupId);
                    }],

                    getDSPInfo: ['AppStorageService', function(AppStorageService) {

                        return AppStorageService.Config.get();
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
