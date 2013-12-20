'use strict';


angular.module('lpApp')
    .controller('ProfileCtrl', ['$scope', '$rootScope', 'userInfo', 'userApps', 'UserService', 'StringService', 'MessageService',
        function ($scope, $rootScope, userInfo, userApps, UserService, StringService, MessageService) {

            // Set Location Bar
            $rootScope.appLocation = 'Profile';


            $scope.user = userInfo;
            $scope.apps = userApps;


            // Public API

            $scope.submitUserProfile = function (user) {

                $scope.$broadcast('submit:profile', user);
            };

            $scope.cancelUserProfile = function () {

                $scope.$broadcast('cancel:profile');

            };

            $scope.verifyUserPassword = function (user) {

                $scope.$broadcast('verify:password', user);
            };


            // Private API

            $scope._submitUserInfo = function (user) {

                var userInfo = {
                    "default_app_id": user.default_app_id,
                    "display_name": user.display_name,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "phone": user.phone,
                    "security_question": user.security_question,
                    "security_answer": user.security_answer
                }


                UserService.profile().save(userInfo,
                    function (response) {
                        return true;
                    },
                    function (response) {
                        throw new Error('Submit Profile Error: ' + MessageService.getFirstMessage(response))

                    });
            };

            $scope._submitUserPassword = function (user) {

                if (user.new_password && $scope._verifyPasswordMatch) {
                    var password = {
                        "old_password": user.old_password,
                        "new_password": user.new_password
                    };

                    UserService.password().save(password,
                        function (response) {
                            return true;
                        },
                        function (response) {
                            throw new Error('Submit Password Error: ' + MessageService.getFirstMessage(response))
                        });
                }
            };


            $scope._verifyPasswordMatch = function (user) {


                return StringService.areIdentical(user.new_password, user.verify_password);
            };


            // UI functions
            $scope._resetUI = function () {

                $scope.user = UserService.profile().get();
            };


            // Message Received
            $scope.$on('submit:profile', function (e, user) {


                try {
                    $scope._submitUserPassword(user);
                    $scope._submitUserInfo(user);
                    $scope._resetUI();
                }
                catch (err) {

                }

            });

            $scope.$on('verify:password', function (e, user) {

                $scope.identical = $scope._verifyPasswordMatch(user);
            });

            $scope.$on('cancel:profile', function (e) {

                //Reset User Profile
                $scope.user = getInfo;
            });

        }]);