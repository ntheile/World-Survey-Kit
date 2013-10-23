/// <reference path="../libs/jquery-1.8.3.js" />
/// <reference path="../libs/backbone-0.9.2.js" />
/// <reference path="../libs/backbone.offline.js" />

///
/// Collection of all the user's file instances, used in offline sync mode
///
define(["jquery", "backbone", "backboneOffline"], function ($, Backbone, BBOffline) {

    var UFileInstanceCollection = Backbone.Collection.extend({

        url: function(){
            return App.utils.urlify("FileInstances");
        },

        storage: undefined,

        // override sync for GET
        //sync: function (method, model, options) {
        //    options || (options = {});

        //    // passing options.url will override 
        //    // the default construction of the url in Backbone.sync
        //    switch (method) {
        //        case "read":
        //            options.url = App.utils.urlify("FileInstanceCollection");
        //            break;
        //    }

        //    if (options.url)
        //        Backbone.sync.call(model, method, model, options);
        //},

        initialize: function (models, options) {

            var self = this;

            // create local store
            self.storage = new Offline.Storage("User-" + App.id + "-UFileInstanceCollection", this);   
        
            // Assign the Deferred issued by fetch() as a property
            // so you can call this.collection.deferred.done( ...do stuff ) in your view
            
            self.deferred = new $.Deferred();
            self.fetch({
                success: function () {
                    //App.uResponseCollection = new UResponseCollection();
                    //App.uResponseCollection.fetch();                 
                    self.deferred.resolve();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    self.deferred.reject(textStatus.statusText);
                }
            });
            self.deferred.promise();
  
        }

    });

    return UFileInstanceCollection;

});