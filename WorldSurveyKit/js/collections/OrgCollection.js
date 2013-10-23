/// <reference path="../libs/jquery-1.8.3.js" />
/// <reference path="../libs/backbone-0.9.2.js" />
/// <reference path="../libs/backbone.offline.js" />

///
/// GETs a collection of the orgs where you are admin, if your a sys admin then it gets all the orgs
///
define(["jquery", "backbone", "backboneOffline", "models/Models"], function ($, Backbone, BackboneOffline, Models) {

    // Extends Backbone.Router
    var OrgCollection = Backbone.Collection.extend( {

        // get the orgs you own
        url: function(){
            var u;
            if (App.rootUrl) {
                u = App.rootUrl + "/api/orgs";
            }
            else {
                u = "/api/orgs";
            }
            
            return u;
        },

        model: Models.OrgModel,

        initialize: function( models, options ) {

        }

    });

    // Returns the Model class
    return OrgCollection;

});