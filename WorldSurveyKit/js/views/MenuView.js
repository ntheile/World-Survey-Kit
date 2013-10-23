// Menu View
// =============

define(["models/MenuModel", "text!templates/MenuTemplate.html", "collections/MenuCollection"], function (MenuModel, MenuTemplate, MenuCollection) {
 
    // Extends Backbone.View
    var MenuView = Backbone.View.extend({

        el: "#menu",

        events: {

        },

        // The View Constructor
        initialize: function() {

            console.log("past define");

            this.collection = new MenuCollection();

            // Events

            $("#add").on("click", this.add_ONCLICK);
            $("#push").on("click", this.push_ONCLICK);
            $("#reload").on("click", this.reload_ONCLICK);

            this.collection.on("add", this.render, this);
            this.collection.on("change", this.render, this);

            console.log("past jq envet bind");

            // set api link
            try {
                if (App.rootUrl) {
                    $("#apiLink").attr('href', App.rootUrl + '/help');
                }
                else {
                    $("#apiLink").attr('href', '/help');
                }
            }
            catch (e) {

            }

            var that = this;
            

        },

        // Renders all of the Menu models on the UI for your user Id
        render: function () {
            try{
                console.log("MenuView.Render Called");

                //alert(JSON.parse(localStorage.getItem("Menu-45ca18d6-6b7d-444f-4fae-fe9907a95a94")).dirty);

                var m = this.collection.toJSON();
                $("#menu").html("");
                var compiledTemplate = _.template(MenuTemplate, { menuitems: m });
                $("#menu").append(compiledTemplate);
                $('#menu').listview('refresh');
                $(".loadingMenu").remove();

                // Maintains chainability
            }
            catch (e) {}
           
            return this;

        },

        // First Load, grab the data
        firstLoad: function () {

            var self = this;

            try {

                console.log("first load");
                this.collection.fetch({
                    success: function () {
                        console.log("fetched");
                        var m = self.collection.toJSON();
                        $("#menu").html("");
                        var compiledTemplate = _.template(MenuTemplate, { menuitems: m });
                        $("#menu").append(compiledTemplate);
                        $('#menu').listview('refresh');
                        $(".loadingMenu").remove();
                    }
                });

                
            }
            catch (e) {

            }

            return this;

        },

        // Events

        add_ONCLICK: function () {
           
            console.log("===================================> add_ONCLICK");

            var txt =  App.uid +  ' - ' + new Date();

            
            App.menuView.collection.create(
                {
                    active: 'active',
                    text: txt,
                    url: 'http://meteor.com',
                    userId: App.uid
                }
            );

        },

        push_ONCLICK: function () {
            App.menuView.collection.storage.sync.push();
        },

        reload_ONCLICK: function (){
            // possibly bad... dont use this to refresh when offline, or else you will lose un-pushed data 
            App.menuView.collection.storage.sync.full();
        }


    });

    // Returns the View class
    return MenuView;

});