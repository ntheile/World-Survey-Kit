/// <reference path="../libs/jquery-1.8.3.js" />
/// <reference path="../libs/backbone-0.9.2.js" />
/// <reference path="../libs/backbone.offline.js" />

///
/// Collection of the all file instances in an org for an admin, used for online mode when an admin navigates
/// to the #reports page. Mainly used so an admin can edit a different users file
///
define(["jquery", "backbone", "backboneOffline", "collections/UResponseCollection"], function ($, Backbone, BBOffline, UResponseCollection) {


    var FileInstanceCollection = Backbone.Collection.extend({

        url: function () {
            return App.utils.urlify("FileInstances");
        },


        // override sync for GET
        sync: function (method, model, options) {
            options || (options = {});

            // passing options.url will override 
            // the default construction of the url in Backbone.sync
            switch (method) {
                case "read":
                    options.url = App.utils.urlify("FileInstanceCollection/" + App.defaultOrg);
                    break;
            }

            if (options.url)
                Backbone.sync.call(model, method, model, options);
        },

        initialize: function (models, options) {

            // Assign the Deferred issued by fetch() as a property
            // so you can call this.collection.deferred.done( ...do stuff ) in your view
            var self = this;
            this.deferred = new $.Deferred();
            this.fetch({
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
            this.deferred.promise();

        },

        cachedForFile: [1]

    });

    return FileInstanceCollection;

});