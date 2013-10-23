/// <reference path="../libs/jquery-1.8.3.js" />
/// <reference path="../libs/backbone-0.9.2.js" />
/// <reference path="../libs/backbone.offline.js" />

///
/// User collection of options (mult choice items, single answer items etc...), used in offline sync mode
///
define(["jquery", "backbone", "backboneOffline"], function ($, Backbone, BBOffline) {
   
    var UOptionCollection = Backbone.Collection.extend({

        url: function(){
            return App.utils.urlify("Options");
        },

        storage: undefined,

        // override sync for GET
        sync: function (method, model, options) {
            options || (options = {});

            // passing options.url will override 
            // the default construction of the url in Backbone.sync
            switch (method) {
                case "read":
                    options.url = App.utils.urlify("OptionCollection/" + App.defaultOrg);
                    break;
            }

            if (options.url)
                Backbone.sync.call(model, method, model, options);
        },

        initialize: function (models, options) {

            this.storage = new Offline.Storage("Org-" + App.defaultOrg + "-UOptionCollection", this, { autoPush: true });

            // Assign the Deferred issued by fetch() as a property
            // so you can call this.collection.deferred.done( ...do stuff ) in your view
            var self = this;
            this.deferred = new $.Deferred();
            this.fetch({
                success: function () {
                    self.deferred.resolve();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    self.deferred.reject(textStatus.statusText);
                }
            });
            this.deferred.promise();

        }

    });

    return UOptionCollection;

});