/// <reference path="../libs/jquery-1.8.3.js" />
/// <reference path="../libs/backbone-0.9.2.js" />
/// <reference path="../libs/backbone.offline.js" />

///
/// Collection of questions used in admin online mode
///
define(["jquery", "backbone", "backboneOffline", "models/Models"], function ($, Backbone, BackboneOffline, Models) {
  
    var QuestionCollection = Backbone.Collection.extend( {

        // This is loaded from the view
        url: function () {
            return App.utils.urlify("Questions");
        },

        model: Models.QuestionModel,

        // override sync for GET
        sync: function (method, model, options) {
            options || (options = {});

            // passing options.url will override 
            // the default construction of the url in Backbone.sync
            switch (method) {
                case "read":
                    options.url = App.utils.urlify("QuestionCollection/" + App.fileId);
                    break;
            }

            if (options.url)
                Backbone.sync.call(model, method, model, options);
        },

        // The Collection constructor
        initialize: function( models, options ) {

            // Assign the Deferred issued by fetch() as a property
            // so you can call this.collection.deferred.done( ...do stuff ) in your view
            //var self = this;
            //this.deferred = new $.Deferred();
            //this.fetch({
            //    success: function () {
            //        self.deferred.resolve();
            //    },
            //    error: function (jqXHR, textStatus, errorThrown) {
            //        self.deferred.reject(textStatus.statusText);
            //    }
            //});
            //this.deferred.promise();

        }

       

    });

    return QuestionCollection;

});