// GoOptionsView View
// ===============

///
/// A skeleton model is passed in that contains all the important information 
/// the model is a uQuestionCollection model with these additional fields
///     { back, next, fileInstanceId [the long clinet id], fileName, fileInstanceName }
///     the number of questions is also passed into render as a second parameter
///
define(["jquery", "backbone", "models/Models", "text!templates/GoOptionsTemplate.html"],
    function ($, Backbone, Models, Template) {

        var GoOptionsView = Backbone.View.extend({

        el: "#go .main-content",

        template: Template,

        events: {

        },

        initialize: function() {

        },

        back: "",

        next: "",

        fileInstanceId: "",

        fileInstColl: null,

        responseColl: null,

        edit: "",

        previousAnswer: null,

        render: function (model, questionCount) {
          
            // Render the question Skeleton view here

            console.log("GoOptionsView");
            console.log(model);

            var self = this;

            this.previousAnswer = false;

            model.set({ questionCount: questionCount });

            var tmpl = _.template( this.template, model.toJSON() );

            this.$el.html(tmpl);

            $("#go").trigger("create");

            // now that the view is rendered get the previous answer, or it will be blank
            this.loadData(model);
          
            return this;

        },

        loadData: function (questionSkeletonModel) {

            // does a response already exist?
            console.log("questionSkeletonModel");
            console.log(questionSkeletonModel);

            var self = this;
            // these are the two variables from the ?file= and ?q= in the request
            var fileInstanceId = questionSkeletonModel.get("fileInstanceId");
            var questionsId = questionSkeletonModel.get("sid");
            var nextUrl = "#go?file" + fileInstanceId + "?q" + questionSkeletonModel.get("next") + self.edit;
            var backUrl = "#go?file" + fileInstanceId + "?q" + questionSkeletonModel.get("back") + self.edit;


            // get the options from the question
            var optionsCollection = App.uOptionCollection.where({ questionsId: parseInt(questionsId) });
            var type = App.uQuestionCollection.where({ sid: parseInt(questionsId) })[0].get("type");


            ///
            /// Figure out if the this question has been answered yet
            /// A response contains the newFileInstanceId field, this can reference 
            ///   either the id or sid of the uFileInstance Model
            ///
    

                // get the response model if one exists (there might be multiple)
                var responseModel;
                // offline
                if (App.isClientId(fileInstanceId)) { // dashes in fileId - working offline with id (client id), therefore newFileInstaceId field must client id
                    console.log("===> load data offline ====>");
                    responseModel = self.responseColl.where({ questionsId: parseInt(questionsId), newFileInstanceId: fileInstanceId }); // the sid passed in here is either client id or server id from logic above parseInt is used in the case that is a server sid
                    console.log(responseModel);
                }
                // online
                else { // int for fileId -  online with sid, but 3 cases possible due to backbone.offline logic and the key implementation
                    console.log("=====> load data online ====>");

                    // case 1 - response is online
                    responseModel = self.responseColl.where({ questionsId: parseInt(questionsId), newFileInstanceId: fileInstanceId }); // strangly enough backbone.offline saves the online sid as a string since we configured this via the keys attr of uResponseCollection
                    console.log("=====>case 1:  do we have online response but a string fileInstanceId? ====>");
                    console.log(responseModel);

                    // case 2 - response is online - questionId is an Int, fileInstanceIs is an Int (probably first load senerio)
                    if (responseModel.length == 0) {
                        responseModel = self.responseColl.where({ questionsId: parseInt(questionsId), newFileInstanceId: parseInt(fileInstanceId) });
                        console.log("=====> case 2: do we have online response, probably first load ====>");
                        console.log(responseModel);
                    }

                    // case 3 - the respone is offline
                    if (responseModel.length == 0) {
                        // check by sid
                        var offlineFileInstanceId = self.fileInstColl.where({ sid: parseInt(fileInstanceId) });
                        offlineFileInstanceId = offlineFileInstanceId[0].get("id");
                        responseModel = self.responseColl.where({ questionsId: parseInt(questionsId), newFileInstanceId: offlineFileInstanceId });
                        console.log("=====> case 3: do we have offline response? ====>");
                        console.log(responseModel);
                    }
                   
                }
            
                var response;
                // question has already been answered
                if (responseModel.length > 0) {
                    
                    console.log("Existing response model loaded");
                    console.log(responseModel);
                    this.previousAnswer = true;
                }
                // no answer yet
                else {
                    
                }
            
            ///
            /// Output and bind
            ///     Next and Back will save response locally
            ///     Save and finish later will save locally
            ///     Done will save uFileInstanceCollection to server then the uReponseCollection
            ///     

                // render all possible item options , then select the ones you already answered, if any
                // type is mutiplechoice or single answer
                self.renderOptions(optionsCollection, responseModel, type);
                self.previousAnswer = this.previousAnswer;
            
                // bind to save and done click event
                $(".goOptionsSave").off("click");
                $(".goOptionsSave").on("click", { self: self, model: responseModel, questionsId: questionsId, url: "#home", syncData: true, fileInstanceId: fileInstanceId }, this.save);

                // bind to done event
                $("#goOptionsDone").off("click");
                $("#goOptionsDone").on("click", { self: self, model: responseModel, questionsId: questionsId, url: "#home", syncData: true, fileInstanceId: fileInstanceId }, this.save);

                // bind to next event
                $("#goOptionsNext").off("click");
                $("#goOptionsNext").on("click", { self: self, model: responseModel, questionsId: questionsId, url: nextUrl, syncData: false, fileInstanceId: fileInstanceId }, this.save);

                // bind to back event
                $("#goOptionsBack").off("click");
                $("#goOptionsBack").on("click", { self: self, model: responseModel, questionsId: questionsId, url: backUrl, syncData: false, fileInstanceId: fileInstanceId }, this.save);


        },

        renderOptions: function(optionsCollections, selectedOptionsCollection, type){

            // clear options div
            $("#goOptionsResponse").html("");
            
            // get type
            if (type == "MultipleChoice") {
                type = "checkbox";
            }
            else {
                type = "radio";
            }

            // add all possible items the to div
            _.each(optionsCollections, function (model) {

                //append to radio button list
                $("#goOptionsResponse").append(
                        "<input type='" + type + "' name='groupOptionAnswerUser' id='rUser" + model.get("sid") + "' />" +
                        "<label for='rUser" + model.get("sid") + "'>" + model.get("option") + "</label>"
                );

            });

            // refresh and style
            $("#go").trigger("create");


            // now select any that the user already selected
            _.each(selectedOptionsCollection, function (selectedModel) {
                var selector = "#rUser" + selectedModel.get("response");
                $(selector).prop("checked", true).checkboxradio("refresh");
            });

            // refresh and style
            $("#go").trigger("create");

        },

        // gets all the checked items
        // pass in element containing control group
        // returns an array of responses containing the id of the option selected
        getChecked: function(elContainer){

            var newSelectedItemsList = [];

            _.each($(elContainer).find("input"), function (item) {
                if ( $(item).prop("checked") ) {
                    var itemId = $(item).attr("id").replace("rUser", "");
                    newSelectedItemsList.push(
                        itemId
                    );
                }  
            });

            App.isNew = newSelectedItemsList;

            return newSelectedItemsList;
            
        },
        
        save: function(e) { 

            console.log("Who clicked?");
            console.log(this);
            var caller = $(this).attr("id");
            console.log(caller);
            ///
            /// 'Next' and 'Back' will save response locally
            /// 'Save and finish later' and 'Done' will save uFileInstanceCollection to server then the uReponseCollection
            ///

            var self = e.data.self;
            var oldSelectedItemsList = e.data.model;
            var questionsId = e.data.questionsId;
            var url = e.data.url; // the next/back/home url to nav to
            var syncData = e.data.syncData;
            var fileInstanceId = e.data.fileInstanceId;


            // gather the selected item(s)
            var newSelectedItemsList = self.getChecked(".goOptionsResponse");
            App.old = oldSelectedItemsList;

            ///
            /// Update your answer
            /// delete any old response based on fileInstaceId and questionID
            /// save any new checked items
            /// TODO - maybe make this more efficient with deltas, only delete nessesary items and only save new ones
            /// 


                    // delete any old response based on fileInstaceId and questionID
                    //if (oldSelectedItemsList.length > 0) {
                    console.log("previousAnswer status: " + self.previousAnswer);
                    if (self.previousAnswer == true) {

                        // loop the responses and delete them
                        _.each(oldSelectedItemsList, function (model) {
                            console.log("destroy old:");
                            console.log(model);
                            model.destroy();
                        }); 

                    }
                  
                    // save any new checked items

                    _.each(newSelectedItemsList, function (responseOptionId) {

                        console.log("save new:");
                        console.log(responseOptionId);
                        self.responseColl.create({
                            response: responseOptionId,
                            respondedTo: true,
                            questionsId: parseInt(questionsId),
                            newFileInstanceId: fileInstanceId,
                            updated_at: (new Date()).toJSON()
                        });

                    });
                    

                   

            ///
            /// save to server if syncData is true, only syncs when done or save is clicked
            /// This function has logic that will resolve any client Id's stored in newFileInstance 
            /// to the appropriate server Id's. It also set complete to true on the fileInstance if done is clicked
            ///

                if (syncData == true) {

                    //
                    // set complete to true if done is clicked
                    //
                        if (caller == "goOptionsDone") {
                            // determine if fileInstance is online or offline
                            var fileInst;
                            if (App.isClientId(fileInstanceId)) {
                                //alert("done- isOffline file");
                                fileInst = self.fileInstColl.where({ id: fileInstanceId });
                            }
                            else {
                                //alert("done- isOnline file");
                                fileInst = self.fileInstColl.where({ sid: parseInt(fileInstanceId) });
                            }

                            // save it
                            fileInst[0].save({
                                completed: true,
                                updated_at: (new Date()).toJSON()
                            });

                            App.syncSurvey(fileInstanceId);

                            // gotta delete items too

                        }
                        else {
                            App.syncSurvey(fileInstanceId);

                            // gotta delete items too
                        }

                }

            App.router.navigate(url, { trigger: true });

        },

        dispose: function () {


        }

    });

   return GoOptionsView;

});