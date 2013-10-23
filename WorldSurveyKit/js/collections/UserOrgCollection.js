/// <reference path="../libs/jquery-1.8.3.js" />
/// <reference path="../libs/backbone-0.9.2.js" />
/// <reference path="../libs/backbone.offline.js" />

///
/// Admin collection of all the users in an org
///
define(["jquery", "backbone", "backboneOffline", "models/Models"], function ($, Backbone, BackboneOffline, Models) {
    
    var UserOrgCollection = Backbone.Collection.extend( {

        // This is loaded from the view
        url: function () {
            return App.utils.urlify("OrgUserMapping");
        },

        model: Models.OrgUsersModel,

        // The Collection constructor
        initialize: function( models, options ) {


        },

        // override sync for GET
        sync: function (method, model, options) {
            options || (options = {});

            // passing options.url will override 
            // the default construction of the url in Backbone.sync
            switch (method) {
                case "read":
                    options.url = App.utils.urlify("OrgUserMapping/" + App.orgId);
                    break;
            }

            if (options.url)
                Backbone.sync.call(model, method, model, options);
        }

    });

    return UserOrgCollection;

});