// OrgCompositeView View
// =====================

define(["jquery", "backbone", "models/Models", "views/OrgItemView"],
    function ($, Backbone, Models, OrgItemView) {

    // Extends Backbone.View
    var OrgCompositeView = Backbone.View.extend({

        el: "#admin .main-content",

        events: {
            "click .addOrg": "addOrg_ONCLICK",
            'keypress #new-org': 'addOrg_ONENTER'
        },

        // The View Constructor
        initialize: function() {

            console.log("====> OrgCompositeView - init()");


            // bind to model events
            App.orgCollection.on("reset", this.addAll, this);
            App.orgCollection.on("add", this.addOneItem, this);

            App.orgCollection.fetch({
                success: function () {
                    try {
                        $("#orgList").listview("refresh");
                    }
                    catch (e) { }

                }
            });

        },

        // Renders org models that are added
        render: function () {
            
            console.log("====> OrgCompositeView - render()");

            // hack to make list-item render properly
            $.wait(App.delay).then(function () {
                
                try {
                    $("#orgList").listview("refresh");
                }
                catch (e) { }

            });


            return this;

        },

        _addOne: function (org) {

            console.log("====> OrgCompositeView - addOne()");

            var view = new OrgItemView({ model: org });

            $('#orgList').append(view.render().el);

        },

        addOneItem: function (org) {

            this._addOne(org);

            this.render();

        },


        addAll: function (orgCollection) {

            console.log("====> OrgCompositeView - addAll()");

            $('#orgList').html('');

            App.orgCollection.each(this._addOne, this);
           
        },


        addOrg_ONCLICK: function () {
            if (!$("#new-org").val().trim()) {
                return;
            }

            console.log("====> OrgCompositeView - addOrg_ONCLICK()");

            App.orgCollection.create(this.newAttributes(), {

                wait: true,

                success: function (data, textStatus, jqXHR) {


                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error - " + textStatus.statusText);
                }

            });

            try{
             $(".orgCollapse").trigger("collapse");
            }
            catch(e){}
           
        
        },
        
        addOrg_ONENTER: function (e) {
            if (e.which !== 13 || !$("#new-org").val().trim()) {
                return;
            }
            console.log("====> OrgCompositeView - addOrg_ONENTER()");

            App.orgCollection.create(this.newAttributes(), { wait: true });

            try {
                $(".orgCollapse").trigger("collapse");
            }
            catch (e) { }
        },


        // Generate the attributes for a new Todo item.
        newAttributes: function () {
            return {
                orgName: $("#new-org").val().trim()
            };
        }

    });

    return OrgCompositeView;

    });
