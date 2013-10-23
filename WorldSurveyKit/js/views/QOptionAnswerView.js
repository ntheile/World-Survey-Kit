// QOptionAnswerView
// ===================

define(["jquery", "backbone", "models/Models", "text!templates/QOptionAnswerTemplate.html", "collections/OptionCollection"],
    function ($, Backbone, Models, Template, OptionCollection) {
        
        var QOptionAnswerView = Backbone.View.extend({

        el: "#question .main-content",

        template: Template,

        events: {
            "click #qOptionAnswerQuestionAdd": "addItem_ONCLICK",
            "click #qOptionAnswerQuestionDelete": "deleteQuestion_ONCLICK",
            
        },

        initialize: function() {

            App.optionCollection = new OptionCollection();
            App.optionCollection.on("reset", this.renderOption, this);
            App.optionCollection.on("add", this.renderAdd, this);
            
        },

        htmlType: '',

        render: function (model) {
          
            //render view here

            var self = this;

            var tmpl = _.template(this.template, model.toJSON());

            this.$el.html(tmpl);

            this.htmlType = model.get("type");

            // order logic for drop down
            $("#qOptionAnswerQuestionOrder").html("<option value='-2'>No Order Change</option><option value='-1'>Make this question first</option>");
            App.questionCollection.each(function (model, i) {
                var num = i + 1;
                $("#qOptionAnswerQuestionOrder").append("<option value='" + model.get("id") + "'>" + num + ".) " + model.get("question") + "</option>");
            }, this);
            $("#qOptionAnswerQuestionOrder").append("<option value='-3'>Make this question last</option>");

            $("#question").trigger("create");

            // load the options
            App.optionCollection.fetch();
            
            $("#qOptionAnswerQuestionSave").on("click", { self: self }, this.save_ONCLICK);
          
            return this;

        },

        renderOption: function (collection) {

            console.log(collection);

            $("#qOptionAnswerQuestionList").html("");

            // set radio button or checkmark

            console.log(this.htmlType);
            var htmType;
            if (this.htmlType == "MultipleChoice") {
                htmType = "checkbox";
            }
            else {
                htmType = "radio";
            }

            collection.each(function (model) {
                
                //append to radio button list
                $("#qOptionAnswerQuestionList").append(
                    "<li style='padding-top:0px;padding-bottom:0px'>"+
                        "<a><input data-mini='true' type='" + htmType + "' name='groupOptionAnswer' id='r" + model.get("id") + "' />" +
                        "<label for='r" + model.get("id") + "'>" + model.get("option") + "</label></a>" +
                        "<a class='qOptionAnswerQuestionListDeleteItem' data-id='" + model.get("id") + "'>Delete Item</a>" +
                    "</li>"
                );

            }, this);

            $("#qOptionAnswerQuestionList").listview("refresh");

            $("#question").trigger("create");

            $(".qOptionAnswerQuestionListDeleteItem").off("click");
            $(".qOptionAnswerQuestionListDeleteItem").on("click", this, this.deleteItem_ONCLICK);

        },

        renderAdd: function (model) {

            App.optionCollection.fetch();

        },

        addItem_ONCLICK: function(){

            $("#qOptionAnswerQuestionPopup").popup("open");

            $("#qOptionAnswerQuestionPopupAdd").on("click", {}, this.addItem_ONSUBMIT);

        },

        addItem_ONSUBMIT: function () {

            // Add the item to the collection then re-render
            var item = $("#qOptionAnswerQuestionPopupInput").val();

            App.optionCollection.create({
                option: App.utils.strip(item),
                questionsId: App.questionId
            }, {
                wait: true
            });

            $("#qOptionAnswerQuestionPopup").popup("close");

            $("#qOptionAnswerQuestionPopupAdd").off("click");

        },

        deleteItem_ONCLICK: function(){

            var delItem = $(this).data("id");

            var model = App.optionCollection.get(delItem);

            $.mobile.loading("show");

            var answer = confirm("Are you sure you want to delete this item? It will also delete the answers from anybody who already answered this question using this option.");
            if (answer) {
                model.destroy({
                    success: function (model, response) {

                        // re-render
                        $.mobile.loading("hide");
                        App.optionCollection.fetch();

                    }
                });
            }

        },

        save_ONCLICK: function (e) {

            // save to the global  App.questionCollection

            var self = e.data.self;

            var q = $("#qOptionAnswerQuestionInput").val();

            var model = App.questionCollection.get(App.questionId);

            // order logic passed to server,  -1= first, -2= no change, -3=last
            // anything else is the questionId the current question should go after
            var order = $("#qOptionAnswerQuestionOrder").val();


            model.save({
                question: q,
                file: null,
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

        deleteQuestion_ONCLICK: function(){

            var model = App.questionCollection.get(App.questionId);


            var answer = confirm("Are you sure you want to delete this item? It will also delete the answers from anybody who already answered this question using this option.");
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

        }

    });

        return QOptionAnswerView;

});