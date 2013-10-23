/// <reference path="../libs/jquery-1.8.3.js" />
/// <reference path="../libs/backbone-0.9.2.js" />
/// <reference path="../libs/backbone.offline.js" />

///
/// Admin online collection of options (mult choice items, single answer items etc...)
///
define(["jquery", "backbone", "backboneOffline", "models/Models"], function ($, Backbone, BackboneOffline, Models) {

    var OptionCollection = Backbone.Collection.extend( {

        url: function () {
            return App.utils.urlify("Options");
        },

        model: Models.OptionModel,

        initialize: function( models, options ) {


        },

        // override sync for GET
        sync: function (method, model, options) {
            options || (options = {});

            // passing options.url will override 
            // the default construction of the url in Backbone.sync
            switch (method) {
                case "read":
                    options.url = App.utils.urlify("Options/" + App.questionId);
                    break;
            }

            if (options.url)
                Backbone.sync.call(model, method, model, options);
        }

    });

    return OptionCollection;

});