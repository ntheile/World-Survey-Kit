/// <reference path="../libs/jquery-1.8.3.js" />
/// <reference path="../libs/backbone-0.9.2.js" />
/// <reference path="../libs/backbone.offline.js" />

///
/// Collection of all the orgs the logged on user belongs to
///
define(["jquery", "backbone", "backboneOffline"], function ($, Backbone, BBOffline) {

    var MyOrgsCollection = Backbone.Collection.extend({

        storage: undefined,

        deferred: null,

        initialize: function() {
           
            this.storage = new Offline.Storage("MyOrgs-" + App.uid , this, { autoPush: true });

        }

    });

    return MyOrgsCollection;

} );