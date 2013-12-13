'use strict';

angular.module('lpApp')
    .factory('df',[ function() {

        //replace this dsp_url with yours ( leave the /rest/api_docs part )
        var dsp_url = "http://localhost:8080/rest/api_docs/user";
        //replace this app_name with yours
        var app_name = "launchpad";
       // var resource = "/user";
        //dsp_url = dsp_url + resource;

        var df;
        window.authorizations.add("X-DreamFactory-Application-Name", new ApiKeyAuthorization("X-DreamFactory-Application-Name", app_name, "header"));
        window.authorizations.add('Content-Type', new ApiKeyAuthorization('Content-Type', 'application/json', 'header'));
        df = new SwaggerApi({
            url: dsp_url,
            supportedSubmitMethods: ['get', 'post', 'put', 'patch', 'merge', 'delete']
        });
        df.authorizations = window.authorizations;
        df.build();
        return df;
    }]);
