/// <reference path="../libs/jquery-1.8.3.js" />
/// <reference path="../libs/backbone-0.9.2.js" />
/// <reference path="../libs/backbone.offline.js" />
/// <reference path="../models/MenuModel.js" />

///
/// Colletion to load menu items used in the MenuView, not needed for core application functionality
///
define(["jquery", "backbone", "backboneOffline", "models/MenuModel"], function ($, Backbone, BBOffline, MenuModel) {

    // Extends Backbone.Router
    var MenuCollection = Backbone.Collection.extend( {

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

        model: MenuModel,

        storage: undefined,

        // The Collection constructor
        initialize: function( models, options ) {
            
            //alert(App.uid + " menu");

            this.storage = new Offline.Storage("Menu" + App.uid , this, { autoPush: true  });

        }

    });

    // Returns the Model class
    return MenuCollection;

} );