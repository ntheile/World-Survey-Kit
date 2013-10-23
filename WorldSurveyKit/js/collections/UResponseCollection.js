/// <reference path="../libs/jquery-1.8.3.js" />
/// <reference path="../libs/backbone-0.9.2.js" />
/// <reference path="../libs/backbone.offline.js" />

///
/// User collection of responses/answers to surveys, used in offline sync mode
///
define(["jquery", "backbone", "backboneOffline"], function ($, Backbone, BBOffline) {
    
    

    var UResponseCollection = Backbone.Collection.extend({

        url: function(){
            return App.utils.urlify("Responses");
        },

        storage: undefined,

        // override sync for GET
        //sync: function (method, model, options) {
        //    options || (options = {});

        //    // passing options.url will override 
        //    // the default construction of the url in Backbone.sync
        //    switch (method) {
        //        case "read":
        //            options.url = App.utils.urlify("ResponseCollection/" + App.defaultOrg);
        //            break;
        //    }

        //    if (options.url)
        //        Backbone.sync.call(model, method, model, options);
        //},

        initialize: function (models, options) {

            var self = this;

            // create offline storage and associate the fk newFileInstance to the id of the App.uFileInstanceCollection, also configure this to cascaDelete
            self.storage = new Offline.Storage("User-" + App.id + "-UResponseCollection", self, { 
                keys: { newFileInstanceId: App.uFileInstanceCollection }, cascadeDelete: true
            });

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
            //self.deferred.resolve();
            self.deferred.promise();

        }

    });

    return UResponseCollection;

} );