// Menu Model
// ==============

// Includes file dependencies
define([ "jquery", "backbone" ], function( $, Backbone ) {

    // The Model constructor
    var MenuModel = Backbone.Model.extend({
        defaults: {
            active: 'active',
            text: 'text',
            url: 'url',
            created_at: new Date(),
            userId: App.uid
        }
    });

    // Returns the Model class
    return MenuModel;

} );