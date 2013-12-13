'use strict';




angular.module('lpApp')
    .directive('lpCarousel', ['UrlService', '$compile', '$animate', function(UrlService, $compile, $animate) {
        return {
            restrict: 'E',
            scope: {
                groupInfo: '=info'
            },
            templateUrl: 'views/directives/carousel.html',
            link: function(scope, element, attrs) {

                // We lacked a slug to call each element by.
                // So I made a service to create one from the app name
                scope.groupSlug = UrlService.makeSlug(scope.groupInfo.name);


            }

        }

    }])
    .directive('lpThumbnail', ['StringService', '$animate', function(StringService, $animate) {


        return {
            restrict: 'E',
            scope: {
                appInfo: '=info'
            },
            templateUrl: 'views/directives/carousel-thumbnail.html',
            link: function(scope, element, attrs) {

                if (scope.appInfo.description) {
                    scope.appDescription = StringService.makeExcerpt(scope.appInfo.description, 10);

                }

                if (scope.appInfo.title) {
                    scope.appTitle = StringService.makeExcerpt(scope.appInfo.title, 6)

                }

                scope.swipeLeft = function() {

                    var elems = angular.element(element).parent().parent().children();

                    jQuery.each(elems, function() {

                        console.log(jQuery(this));

                        jQuery(this).animate({
                            'left': '-=' + jQuery(this).outerWidth()
                        })

                    });



                }


                scope.swipeRight = function() {

                    var elems = angular.element(element).parent();

                    jQuery.each(elems, function() {

                        console.log(jQuery(this).position());
                        console.log(jQuery(this).outerWidth())

                        jQuery(this).animate({
                            'left': '+=' + jQuery(this).outerWidth()
                        })

                    });

                }



            }
        }


    }]);