// OrgItemView View
// =============

define(["jquery", "backbone", "models/Models", "text!templates/OrgItemTemplate.html"],
    function ($, Backbone, Models, Template) {

    // Extends Backbone.View
    var OrgItemView = Backbone.View.extend({

        tagName: "li",

        template: _.template(Template),

        events: {
            "click .deleteOrg": "deleteOrg_ONCLICK"
        },

        // The View Constructor
        initialize: function() {

            console.log("======> OrgItemView - Init()");

            var self = this;

            this.model.on("change", this.render, this);

        },

        // Renders all of the Menu models on the UI for your user Id
        render: function () {

            console.log("====> OrgItemView - render()");

            this.$el.html(this.template(this.model.toJSON()));

            return this;

        },
        
        deleteOrg_ONCLICK: function () {

            console.log("=====> OrgItemView - delete() ");

            var answer = confirm("Are you sure you want to delete the entire " + this.model.get('orgName') + " organization and all of it's associated data?");
            if (answer) {
                this.kill();
            }
            else {
                
            }

        },

        kill: function () {

           // console.log('Kill: ', this);
            var self = this;

          
            this.model.destroy({
                success: function (model, response) {

                    console.log("====> org destoryed success ");
                    console.log(response);
                    self.off(); // Unbind all local event bindings
                    self.model.off('change', this.render, this); // Unbind reference to the model
                    self.model.off('click', '.deleteOrg');

                    self.remove(); // Remove view from DOM

                    delete self.$el; // Delete the jQuery wrapped object variable
                    delete self.el; // Delete the variable reference to this node


                    try {
                        $("#orgList").listview("refresh");
                    }
                    catch (e) {
                    }

                },
                error: function (model, response) {

                    console.log(response);

                    alert("Error - " + response.statusText);

                }
                
            });


        }


    });

    return OrgItemView;

});