/// <reference path="../libs/jquery-1.8.3.js" />
/// <reference path="../libs/backbone-0.9.2.js" />
/// <reference path="../libs/backbone.offline.js" />

///
/// Collection of all users in the system, only accessable by a system admin
///
define(["jquery", "backbone", "backboneOffline", "models/Models"], function ($, Backbone, BackboneOffline, Models) {

    var UserMangerCollection = Backbone.Collection.extend( {

        url: function () {
            return App.utils.urlify("Users");
        },


        initialize: function( models, options ) {


        }

    });

    return UserMangerCollection;

});