// User Manager View 
// ====================

define(["jquery", "backbone", "models/Models", "text!templates/UserManagerTemplate.html", "collections/UserManagerCollection", "views/UserRowView"],
    function ($, Backbone, Models, UserManagerTemplate, UserMangerCollection, RowView) {

    var UserManagerView = Backbone.View.extend({

        el: "#admin .main-content",

        events: {
            
        },

        initialize: function() {

            console.log("====> UserManagerView - init()");

            var self = this;

        },

        // Renders the entire user manager composite view, returns a .done() jQuery promise
        render: function () {
            
            var dfd = new $.Deferred();

            var self = this;

            console.log("====> UserManagerView - render()");

            $("#manageUsers").html(_.template(UserManagerTemplate));

            $("#admin").trigger("create");

            // render the table now, pass the deferred obkect 
            // so the table render function can resolve the promise
            self.renderTable(dfd);

            return dfd.promise();

        },

        // render the table
        renderTable: function (dfd) {

            var self = this;

            // get a collection of all the systems users
            if (!App.userManagerCollection) {

                App.userManagerCollection = new UserMangerCollection();
                App.userManagerCollection.fetch({
                    success: function (data) {
                        $("#userManagerBody").html("");
                        _.each(data.models, function (model) {

                            console.log(model);
                            self.renderRow(model);
                        });

                        // Table
                        $('#example').dataTable();
                        $(".dataTables_filter").after("<div style='clear:both'></div>");
                        
                        // Resolve the promise
                        dfd.resolve();
                        
                    }
                });

            }
            else {
                console.log("render table second time");
                $("#userManagerBody").html("");
                _.each(App.userManagerCollection.models, function (model) {
                    self.renderRow(model);
                });

                // Table
                $('#example').dataTable();
                $(".dataTables_filter").after("<div style='clear:both'></div>");

                // Resolve the promise
                dfd.resolve();
            }

        },

        // Renders a table row
        renderRow: function (model) {

            console.log("====render row======");

            var view = new RowView({ model: model });

            $('#userManagerBody').append(view.render().el);

            return this;

        }


    });

    return UserManagerView;

});