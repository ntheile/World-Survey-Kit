// Coll (Collection localStorage) View
// ===================================

// Includes file dependencies
define(["collections/MenuCollection", "collections/OrgCollection"], function (MenuCollection, OrgCollection) {
    
    // Extends Backbone.View
    var CollView = Backbone.View.extend({

        el: "#coll .main-content #collWrapper",

        events: {

        },

        // The View Constructor
        initialize: function() {

            
        },

        render: function () {

            $("#collWrapper").html("");

            var isDirt = "";
            var val;
            var value;

            for (var i in window.localStorage) {

                val = localStorage.getItem(i);
                value = val.split(","); //splitting string inside array to get name
                name[i] = value[1]; // getting name from split string

                isDirt = "";
                try {
                    isDirt = $.parseJSON(val).dirty;
                }
                catch (e) {
                    isDirt = "";
                }


                $("#collWrapper").append('<h3>' + i + '</h3><div class="dirty-' + isDirt + '">' + val + '</div><hr/>');


            }
            
        }

    });

    // Returns the View class
    return CollView;

});