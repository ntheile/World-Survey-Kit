// QGpsView
// ===============

define(["jquery", "backbone", "models/Models", "text!templates/QGpsTemplate.html"],
    function ($, Backbone, Models, Template) {

        var QGpsView = Backbone.View.extend({

        el: "#question .main-content",

        template: Template,

        events: {
            "click #qGpsQuestionDelete": "deleteQuestion_ONCLICK",
        },

        initialize: function() {

        },

        render: function (model) {
          
            //render view here

            var self = this;

            var tmpl = _.template(this.template, model.toJSON());

            this.$el.html(tmpl);

            // order logic for drop down
            $("#qGpsQuestionOrder").html("<option value='-2'>No Order Change</option><option value='-1'>Make this question first</option>");
            App.questionCollection.each(function (model, i) {
                var num = i + 1;
                $("#qGpsQuestionOrder").append("<option value='" + model.get("id") + "'>" + num + ".) " + model.get("question") + "</option>");
            }, this);
            $("#qGpsQuestionOrder").append("<option value='-3'>Make this question last</option>");

            // gps
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    var strGPS = '<img src="//maps.googleapis.com/maps/api/staticmap?center=' + position.coords.latitude + ' ' + position.coords.longitude + '&amp;zoom=14&amp;size=288x200&amp;markers=color:blue%7Clabel:X%7C' + position.coords.latitude + ' ' + position.coords.longitude + '&amp;sensor=false" height="200" width="288">';
                    var strgps = 'Latitude: ' + position.coords.latitude + '<br/>' + 'Longitude: ' + position.coords.longitude + '<br/>';
                    $('#qGpsQuestionImage').html(strGPS + "<br/>" + strgps);
                },
                function (error) {
                    Alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
                }
            );
 
            $("#question").trigger("create");

            $("#qGpsQuestionSave").on("click", {self: self }, this.save_ONCLICK);
          
            return this;

        },

        save_ONCLICK: function(e) {
           
            // save to the global  App.questionCollection

            var self = e.data.self;

            var q = $("#qGpsQuestionInput").val();

            var model = App.questionCollection.get(App.questionId);

            // order logic passed to server,  -1= first, -2= no change, -3=last
            // anything else is the questionId the current question should go after
            var order = $("#qGpsQuestionOrder").val();

            
            model.save({
                question: q,
                File: null,
                order: order
            }, {

                wait: true,

                success: function (data, textStatus, jqXHR) {
                    // nav to #question/qid page
                    App.router.navigate("file?" + App.fileId, { trigger: true });

                },
                error: function (jqXHR, textStatus, errorThrown) {
                    alert("Error - " + textStatus.statusText);
                }

            });

        },

        deleteQuestion_ONCLICK: function () {

            var model = App.questionCollection.get(App.questionId);

            var answer = confirm("Are you sure you want to delete this questions? It will also delete the answers from anybody who already answered this question.");
            if (answer) {
                model.destroy({

                    wait: true,

                    success: function (data, textStatus, jqXHR) {
                        // nav to #question/qid page
                        App.router.navigate("file?" + App.fileId, { trigger: true });

                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        alert("Error - " + textStatus.statusText);
                    }

                });
            }

        },

        dispose: function () {

            console.log("dispose called");

            this.model.clear();

            $("#qGpsQuestionSave").off("click");

        }

    });

   return QGpsView;

});