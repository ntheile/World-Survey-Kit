/// <reference path="../libs/jquery-1.8.3.js" />
/// <reference path="../libs/backbone-0.9.2.js" />
/// <reference path="../libs/backbone.offline.js" />

define(["jquery", "backbone", "backboneOffline"], function ($, Backbone, BBOffline) {
    
    var TestStore = Backbone.Collection.extend({

        url: function(){
            return App.utils.urlify("Responses");
        },

        storage: undefined,

        // override sync for GET
        sync: function (method, model, options) {
            options || (options = {});

            // passing options.url will override 
            // the default construction of the url in Backbone.sync
            switch (method) {
                case "read":
                    options.url = App.utils.urlify("ResponseCollection/" + App.defaultOrg);
                    break;
            }

            if (options.url)
                Backbone.sync.call(model, method, model, options);
        },

        initialize: function (models, options) {

            var self = this;

            self.storage = new Offline.Storage("TestStore", self, { keys: { newFileInstanceId: App.uFileInstanceCollection } });

            // Assign the Deferred issued by fetch() as a property
            // so you can call this.collection.deferred.done( ...do stuff ) in your view
            self.deferred = new $.Deferred();
            self.fetch({
                success: function () {
                    self.deferred.resolve();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    self.deferred.reject(textStatus.statusText);
                }
            });
            self.deferred.promise();

        }

    });

    return TestStore;

});