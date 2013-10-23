/// <reference path="../libs/jquery-1.8.3.js" />
/// <reference path="../libs/backbone-0.9.2.js" />
/// <reference path="../libs/backbone.offline.js" />
/// <reference path="../models/Models.js" />

define(["jquery", "backbone", "backboneOffline", "models/Models"], function ($, Backbone, BBOffline, Models) {

    // Extends Backbone.Router
    var OpenEndedCollection = Backbone.Collection.extend( {

        url: function(){
            var u;
            if (App.rootUrl) {
                u = App.rootUrl + "/api/menu/" + App.uid;
            }
            else {
                u = "/api/menu/" + App.uid;
            }
            
            return u;
        },

        model: Models.OpenEndedCollection,

        storage: undefined,

        // The Collection constructor
        initialize: function( models, options ) {
           
            //this.storage = new Offline.Storage("Menu" + App.uid , this, { autoPush: true  });

        }

    });

    return OpenEndedCollection;

} );