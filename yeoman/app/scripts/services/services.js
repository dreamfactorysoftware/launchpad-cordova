'use strict';


angular.module('lpApp')
    .factory('ObjectService', [function() {
        return {
            hasProperty: function(obj) {
                for(var key in obj) {
                    if(obj.hasOwnProperty(key))
                        return true;
                }
                return false;
            }
        }
    }])
    .factory('UrlService', [function() {

        return {

            makeSlug: function(string) {

                return string.toLowerCase().split(' ').join('-');
            }
        }
    }])
    .factory('StringService', [function() {

        return {

            makeExcerpt: function(string, limit) {

                var excerpt = string.split(' ', limit).join(' ');

                if (string.split(' ').length >= limit) {
                    return excerpt + '...';
                }

                return string;

            },

            makeSlug: function(string) {

              return string.toLowerCase().split(' ').join('-');

            },


            areIdentical: function(stringA, stringB) {

                stringA = stringA || '';
                stringB = stringB || '';


                function _sameLength(stringA, stringB) {
                    return  stringA.length == stringB.length;
                }

                function _sameLetters(stringA, stringB) {

                    var l = Math.min(stringA.length, stringB.length);

                    for (var i =0; i<l; i++) {
                        if (stringA.charAt(i) !== stringB.charAt(i)) {
                            return false;
                        }
                    }
                    return true;
                }

                if (_sameLength(stringA, stringB) && _sameLetters(stringA, stringB)) {
                    return true;
                }

                return false;
            },

            getOriginFromString: function(string) {

                 return string.split('/', 3).join('/');

            }
        }
    }])
    .factory('MessageService', [function() {

        return {

            getFirstMessage: function(response) {


                return response.data.error[0].message;
            },

            getAllMessages: function(data) {

            }
        }
    }])
    .factory('AppStorageService', ['StorageService', 'StringService', 'ObjectService', function(StorageService, StringService, ObjectService) {

        return {
            DSP: {

                save: function(dsp) {
                    var DSPList = StorageService.localStorage.get('DSPList') || {},
                        counter = DSPList.counter || 0;

                    counter++;
                    DSPList.counter = counter;
                    dsp.id = DSPList.counter;
                    dsp.slug = StringService.makeSlug(dsp.name);
                    DSPList.platforms = DSPList.platforms || {};
                    DSPList.platforms[dsp.id] = dsp;


                    if (StorageService.localStorage.save('DSPList', DSPList)) {
                        return true;
                    }


                    throw {message: 'Unable to save DSP ' + dsp.name}

                },

                get: function(dspId) {

                    var DSPList = StorageService.localStorage.get('DSPList');

                    if(DSPList.platforms[dspId]){
                        return DSPList.platforms[dspId]
                    }

                    throw {message: 'Unable to find DSP' + dspId}
                },

                update: function() {},

                delete: function(dsp) {

                    var DSPList = StorageService.localStorage.get('DSPList');

                    if(DSPList.platforms[dsp.id]){
                        delete DSPList.platforms[dsp.id];
                        StorageService.localStorage.save('DSPList', DSPList);
                        return true;
                    }

                    throw {message: 'Unable to delete DSP' + dsp.name + ' with id of ' + dsp.id}

                },

                getAll: function() {

                    var DSPList = StorageService.localStorage.get('DSPList');

                    if (ObjectService.hasProperty(DSPList.platforms)) {
                        return DSPList.platforms;
                    }

                    return false

                },

                Config: {
                    save: function(dsp, config) {
                        var DSPList = StorageService.localStorage.get('DSPList');

                        if (DSPList.platforms[dsp.id]) {
                            DSPList.platforms[dsp.id].config = config;
                            StorageService.localStorage.save('DSPList', DSPList);
                            return true;
                        }

                        throw {message: 'Unable to save ' + dsp.name + ' settings'}
                    }
                },

                UISettings: {

                    save: function(dsp, settings) {

                        var DSPList = StorageService.localStorage.get('DSPList');

                        if (DSPList.platforms[dsp.id]) {
                            DSPList.platforms[dsp.id].UISettings = settings;
                            StorageService.localStorage.save('DSPList', DSPList);
                            return true;
                        }

                        throw {message:'Unable to save ' + dsp.name + ' UI settings'}
                    }
                },

                UserSettings: {

                    save: function(dsp, settings) {
                        var DSPList = StorageService.localStorage.get('DSPList');

                        if (DSPList.platforms[dsp.id]) {
                            DSPList.platforms[dsp.id].UserSettings = settings;
                            StorageService.localStorage.save('DSPList', DSPList);
                            return true;
                        }

                        throw {message:'Unable to save ' + dsp.name + ' User settings'}

                    }
                }
            },

            User: {
                save: function(user) {

                    var User = StorageService.sessionStorage.get('User') || {};

                    User.sessionId = user.session_id;
                    User.displayName = user.display_name;
                    if (User.sessionId.length > 0) {
                        User.guestUser = false;
                        User.authenticated = true;
                    } else {
                        User.guestUser = true;
                        User.authenticated = false;
                    }

                    if (StorageService.sessionStorage.save('User', User)) {
                        return true;
                    }

                    throw {message:'Unable to set User ' + user.displayName}
                },

                get: function() {

                    return StorageService.sessionStorage.get('User');
                }
            },

            URL: {
                save: function(dsp) {

                    var URL = StorageService.sessionStorage.get('URL') || {};

                    URL.currentURL = dsp.url;

                    if (StorageService.sessionStorage.save('URL', URL)) {
                        return true;
                    }

                    throw {message:'Unable to save ' + dsp.name + ' settings'}
                },

                get: function() {

                    return StorageService.sessionStorage.get('URL');
                }
            },

            Apps: {

                save: function(dsp) {
                    var Apps = StorageService.sessionStorage.get('Apps') || {},
                        UnGrouped = {};

                    Apps.appGroups = dsp.user.app_groups;
                    UnGrouped.name = dsp.UISettings.unGroupedApps.name || 'UnGrouped Apps';
                    UnGrouped.id = dsp.UISettings.unGroupedApps.id || 0;
                    UnGrouped.description = dsp.UISettings.unGroupedApps.description || 'Apps not assigned to a group.';
                    UnGrouped.apps = dsp.user.no_group_apps;
                    Apps.appGroups.push(UnGrouped);

                    if (StorageService.sessionStorage.save('Apps', Apps)) {
                        return true;
                    }

                    throw {message:'Unable to save Apps to session.'}
                },

                get: function() {

                    return StorageService.sessionStorage.get('Apps');
                },


                getAppsFromGroup: function(groupId) {

                    var Groups = StorageService.sessionStorage.get('Apps'),
                        Apps = [];

                    angular.forEach(Groups.appGroups, function(obj) {
                        if (obj.id == groupId) {
                            Apps = obj;
                        }
                    });
                    return Apps;
                }

            },

            Config: {
                save: function(dsp) {

                    if (StorageService.sessionStorage.save('Config', dsp)) {
                        return true;
                    }

                    throw {message:'Unable to save Config to session.'}
                },

                get: function() {
                    return StorageService.sessionStorage.get('Config');
                }
            }

        }
    }])
    .factory('StorageService', [function() {
        return {
            localStorage: {

                    //Public API
                    save: function(name, value) {

                        if (typeof value !== 'string' ) {

                            value = angular.toJson(value);
                        }

                        localStorage.setItem(name, value);

                        return true;
                    },

                    get: function(name) {

                        var value = localStorage.getItem(name);

                        if (!value) {
                            return false;
                        }

                        try {
                            value = angular.fromJson(value);
                            return value;
                        }
                        catch(e) {
                            return value;
                        }
                    },

                    getObject: function(name) {

                        return JSON.parse(localStorage.getItem(name));
                    },

                    delete: function(name) {

                        localStorage.removeItem(name);
                    },

                    clear: function() {

                        localStorage.clear();
                    },

                    howMany: function() {

                        return localStorage.length();
                    },

                    getAll: function() {

                        var localData = {};

                        angular.forEach(localStorage, function(v, i) {

                            localData[i] = v;
                        });

                        return localData;
                    }
            },

            sessionStorage: {

                //Public API
                save: function(name, value) {

                    if (typeof value !== 'string' ) {

                        value = angular.toJson(value);
                    }

                    sessionStorage.setItem(name, value);

                    return true;
                },

                get: function(name) {

                    var value = sessionStorage.getItem(name);

                    if (!value) {
                        return false;
                    }

                    try {
                        value = angular.fromJson(value);
                        return value;
                    }
                    catch(e) {
                        return value;
                    }
                },

                getObject: function(name) {

                    return JSON.parse(sessionStorage.getItem(name));
                },

                delete: function(name) {

                    sessionStorage.removeItem(name);
                },

                clear: function() {

                    sessionStorage.clear();
                },

                howMany: function() {

                    return sessionStorage.length();
                },

                getAll: function() {

                    var sessionData = {};

                    angular.forEach(sessionStorage, function(v, i) {

                        sessionData[i] = v;
                    });

                    return sessionData;
                }
            }
        }
    }])
    .factory('AppLaunchService', [function() {


        var windows = {};


        return {

            //Public API


            launchApp: function(app) {

                windows[app.id] = window.open(app.launch_url, app.name, 'location=yes,menubar=yes,titlebar=yes');

                if (windows[app.id]) {
                    return true;
                }

                throw {message:'Unable to launch ' + app.name}

            },

            reopenApp: function(app) {

                if (windows[app.id].show()) {
                   return true;
                }

                throw {message:'Unable to ReOpen ' + app.name}

            },

            closeApp: function(appId) {


            },


            hideApp: function(appId) {


            },

            hideAppContainer: function(id) {


            }

        }

    }])
    .factory('UserService', ['$resource', '$q', 'AppStorageService', function($resource, $q, AppStorageService) {

        return {

            currentDSPUrl: '',

            session: function() {

                return $resource(this.currentDSPUrl + '/rest/user/session');
            },

            profile: function() {

                return $resource(this.currentDSPUrl + '/rest/user/profile');
            },

            password: function() {

                return $resource(this.currentDSPUrl + '/rest/user/password');
            },

            register: function() {

                return $resource(this.currentDSPUrl + '/rest/user/password');
            },

            reset: function() {

                this.currentDSPUrl = null;
            }
        }
    }])
    .factory('SystemService', ['$resource', function($resource) {
        return {
            config: function(dsp) {
                return $resource(dsp + '/rest/system/config')
            }
        }
    }])
    .factory('NotificationService', ['CordovaReady', '$rootScope', function(CordovaReady, $rootScope) {

        function extend(destination, source) {
            for (var property in source) {
                if (source.hasOwnProperty(property)) {
                    destination[property] = source[property];
                }
            }
            return destination;
        }

        return {

            alertDialog: CordovaReady(function(message, alertCallback, title, buttonLabel) {
                navigator.notification.alert(
                    message,
                    function() {
                        if(alertCallback) {
                            $rootScope.$apply(function() {
                                alertCallback.call();
                            })
                        }
                    },
                    title,
                    buttonLabel
                );
            }),

            confirmDialog: CordovaReady(function(options) {

                function defaultConfirmCallback(buttonIndex) {
                    return true;
                }

                var defaults = {
                    message: 'Are you sure you want to do this?',
                    confirmCallback: defaultConfirmCallback,
                    title: 'Confirm',
                    buttonLabels: ['OK', 'Cancel']
                };

                options = extend(defaults, options);

                navigator.notification.confirm(
                    options.message,
                    function (buttonIndex) {
                        if(buttonIndex === 1) {
                            $rootScope.$apply(function () {
                                options.confirmCallback.call();
                            })
                        }
                    },
                    options.title,
                    options.buttonLabels
                );
            })
        }
    }])
    .factory('CordovaReady', [function() {
        return function (fn) {

            var queue = [];

            var impl = function () {
                queue.push(Array.prototype.slice.call(arguments));
            };

            document.addEventListener('deviceready', function () {
                queue.forEach(function (args) {
                    fn.apply(this, args);
                });
                impl = fn;
            }, false);

            return function () {
                return impl.apply(this, arguments);
            };
        };
    }]);


