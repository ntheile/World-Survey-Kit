/// <reference path="../libs/jquery-1.8.3.js" />
/// <reference path="../libs/backbone-0.9.2.js" />
/// <reference path="../libs/backbone.offline.js" />

///
/// Collection of all survey reponses/answers used in admin online mode for an org
///
define(["jquery", "backbone", "backboneOffline"], function ($, Backbone, BBOffline) {
    
    /// <summary>
    /// Used by org admin for reports
    /// </summary>
    var ResponseCollection = Backbone.Collection.extend({

        url: function () {
            return App.utils.urlify("Responses");
        },

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

            // Assign the Deferred issued by fetch() as a property
            // so you can call this.collection.deferred.done( ...do stuff ) in your view
            self.deferred = new $.Deferred();
            self.fetch({
                success: function (data) {

                    // hack so admin can view files in #edit
                    _.each(data.models, function (model) {
                        model.set("sid", model.get("id"));
                    });

                    self.deferred.resolve();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    self.deferred.reject(textStatus.statusText);
                }
            });
            //self.deferred.resolve();
            self.deferred.promise();

        },

        cachedForFile: [1],

        refetch: false

    });

    return ResponseCollection;

} );