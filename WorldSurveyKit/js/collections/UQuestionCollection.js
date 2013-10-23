/// <reference path="../libs/jquery-1.8.3.js" />
/// <reference path="../libs/backbone-0.9.2.js" />
/// <reference path="../libs/backbone.offline.js" />

///
/// User collection of questions for an org, used in offline sync mode
///
define(["jquery", "backbone", "backboneOffline"], function ($, Backbone, BBOffline) {

  

    var UQuestionCollection = Backbone.Collection.extend({

        url: function(){
            return App.utils.urlify("Questions");
        },

        storage: undefined,

        deferred: null,

        // override sync for GET
        sync: function (method, model, options) {
            options || (options = {});

            // passing options.url will override 
            // the default construction of the url in Backbone.sync
            switch (method) {
                case "read":
                    options.url = App.utils.urlify("UQuestionCollection/" + App.defaultOrg);
                    break;
            }

            if (options.url) Backbone.sync.call(model, method, model, options);

        },

 
        // sort by order
        comparator:  function (collection) {
            return collection.get("order");
        },

        initialize: function() {
           
            this.storage = new Offline.Storage("Org-" + App.defaultOrg + "-UQuestionCollection", this, { autoPush: true });

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

    return UQuestionCollection;

} );