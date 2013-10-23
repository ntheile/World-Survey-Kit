// GoOpenEnded View
// ===============

///
/// A skeleton model is passed in that contains all the important information 
/// the model is a uQuestionCollection model with these additional fields
///     { back, next, fileInstanceId [the long clinet id], fileName, fileInstanceName }
///     the number of questions is also passed into render as a second parameter
///
define(["jquery", "backbone", "models/Models", "text!templates/GoOpenEndedTemplate.html"],
    function ($, Backbone, Models, Template) {

    var GoOpenEndedView = Backbone.View.extend({

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

        render: function (model, questionCount) {
          
            // Render the question Skeleton view here

            console.log("GoOpenEndedView - uQuestionCollection Model with additional fields");
            console.log(model);

            var self = this;

            model.set({ questionCount: questionCount });

            var tmpl = _.template( this.template, model.toJSON() );

            this.$el.html(tmpl);

            $("#go").trigger("create");

            // now that the view is rendered get the previous answer, or it will be blank
            this.loadData(model);
          
            return this;

        },

        loadData: function(questionSkeletonModel) {

            // does a response already exist?
            console.log("questionSkeletonModel");
            console.log(questionSkeletonModel);

            var self = this;

            // these are the two variables from the ?file= and ?q= in the request
            var fileInstanceId = questionSkeletonModel.get("fileInstanceId");
            var questionsId = questionSkeletonModel.get("sid");
            var nextUrl = "#go?file" + fileInstanceId + "?q" + questionSkeletonModel.get("next") + self.edit;
            var backUrl = "#go?file" + fileInstanceId + "?q" + questionSkeletonModel.get("back") + self.edit;

            ///
            /// Figure out if the this question has been answered yet
            /// A response contains the newFileInstanceId field, this can reference 
            ///   either the id or sid of the uFileInstance Model
            ///
                
                console.log("<===== Test da fileInstId ===>");
                console.log(fileInstanceId);
                if (typeof fileInstanceId == "string") console.log("string");
                if (typeof fileInstanceId == "number") console.log("number");
                if (typeof fileInstanceId == undefined) console.log("undef");


                // get the response model if one exists
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
                        var offlineFileInstanceId = this.fileInstColl.where({ sid: parseInt(fileInstanceId) });

                        offlineFileInstanceId = offlineFileInstanceId[0].get("id");
                        responseModel = self.responseColl.where({ questionsId: parseInt(questionsId), newFileInstanceId: offlineFileInstanceId });

                        console.log("=====> case 3: do we have offline response? ====>");
                        console.log(responseModel);
                    }
                   
                }
            
                var response;
                // question has already been answered
                if (responseModel.length > 0) {
                    response = responseModel[0].get("response");
                    responseModel = responseModel[0];

                    console.log("Existing response model loaded");
                    console.log(responseModel);
                }
                // no answer yet
                else {
                    
                }
            

            ///
            /// Output and bind
            ///     Next and Back will save response locally
            ///     Save and finish later will save locally
            ///     Done will save uFileInstanceCollection to server then the uReponseCollection

                // fill the repsonse in on the view
                $("#goOpenEndedResponse").val(response);
            
                // bind to save and done click event
                $(".goOpenEndedSave").off("click");
                $(".goOpenEndedSave").on("click", { self: self, model: responseModel, questionsId: questionsId, url: "#home", syncData: true, fileInstanceId: fileInstanceId }, this.save);

                // bind to done event
                $("#goOpenEndedDone").off("click");
                $("#goOpenEndedDone").on("click", { self: self, model: responseModel, questionsId: questionsId, url: "#home", syncData: true, fileInstanceId: fileInstanceId }, this.save);

                // bind to next event
                $("#goOpenEndedNext").off("click");
                $("#goOpenEndedNext").on("click", { self: self, model: responseModel, questionsId: questionsId, url: nextUrl, syncData: false, fileInstanceId: fileInstanceId }, this.save);

                // bind to back event
                $("#goOpenEndedBack").off("click");
                $("#goOpenEndedBack").on("click", { self: self, model: responseModel, questionsId: questionsId, url: backUrl, syncData: false, fileInstanceId: fileInstanceId }, this.save);


        },

        save: function(e) { 

            console.log("Who be clinkcing maeea?");
            console.log(this);
            var caller = $(this).attr("id");
            console.log(caller);
            ///
            /// 'Next' and 'Back' will save response locally
            /// 'Save and finish later' and 'Done' will save uFileInstanceCollection to server then the uReponseCollection
            ///

            var self = e.data.self;
            //var responseModel = e.data.model;
            var questionsId = e.data.questionsId;
            var url = e.data.url; // the next/back/home url to nav to
            var syncData = e.data.syncData;
            var fileInstanceId = e.data.fileInstanceId;


            var res = $("#goOpenEndedResponse").val();

                ///
                /// Figure out if the this question has been answered yet
                ///
                
                    // get the response model if one exists
                    var responseModel;
                    // offline
                    if (App.isClientId(fileInstanceId)) { // working offline with id (client id), therefore newFileInstaceId field must client id
                         responseModel = self.responseColl.where({ questionsId: parseInt(questionsId), newFileInstanceId: fileInstanceId });
                    }
                    // online
                    else { // int for fileId -  online with sid, but 3 cases possible

                        // case 1 - response is online
                         responseModel = self.responseColl.where({ questionsId: parseInt(questionsId), newFileInstanceId: fileInstanceId }); // strangly enough backbone.offline saves the online sid as a string since we configured this via the keys attr of uResponseCollection


                        // case 2 - response is online - questionId is an Int, fileInstanceIs is an Int (probably first load senerio)
                        if (responseModel.length == 0) {
                             responseModel = self.responseColl.where({ questionsId: parseInt(questionsId), newFileInstanceId: parseInt(fileInstanceId) });
                        }

                        // case 3 - the respone is offline
                        if (responseModel.length == 0) {
                            // check by sid
                             var offlineFileInstanceId = self.fileInstColl.where({ sid: parseInt(fileInstanceId) });

                            offlineFileInstanceId = offlineFileInstanceId[0].get("id");
                            responseModel = self.responseColl.where({ questionsId: parseInt(questionsId), newFileInstanceId: offlineFileInstanceId }); // the sid passed in here is either client id or server id from logic above parseInt is used in the case that is a server sid
                        }

                    }

            ////
            //// Update your answer
            ////

                    var response;
                    // update - the question has already been answered
                    if (responseModel.length > 0) {
                  
                        response = responseModel[0].get("response");
                        responseModel = responseModel[0];

                        console.log("=====> Existing Response being update =======>");
                        console.log(responseModel);

                        responseModel.save({
                            response: res,
                            respondedTo: true,
                            updated_at: (new Date()).toJSON()
                        });

                    }
                    // new - no answer yet, so locally create a new response instance to pass into save/done/next/back bindings
                    else {
                        console.log("=====> New Response");
                        responseModel = self.responseColl.create({
                            response: res,
                            respondedTo: true,
                            questionsId: parseInt(questionsId),
                            newFileInstanceId: fileInstanceId,
                            updated_at: (new Date()).toJSON()
                        });
                        console.log(responseModel);
                    }


            ///
            /// save to server if syncData is true, only syncs when done or save is clicked
            /// This function has logic that will resolve any client Id's stored in newFileInstance 
            /// to the appropriate server Id's. It also set complete to true on the fileInstance if done is clicked
            ///

                if (syncData == true) {

                    //
                    // set complete to true if done is clicked
                    //
                        if (caller == "goOpenEndedDone") {
                            // determine if fileInstance is online or offline
                            var fileInst;
                            if (App.isClientId(fileInstanceId)) {
                                fileInst = self.fileInstColl.where({ id: fileInstanceId });
                            }
                            else {
                                fileInst = self.fileInstColl.where({ sid: parseInt(fileInstanceId) }); 
                            }

                            // save it
                            fileInst[0].save({
                                completed: true,
                                updated_at: (new Date()).toJSON()
                            });

                            App.syncSurvey(fileInstanceId);

                        }
                        else {
                            App.syncSurvey(fileInstanceId);
                        }

                }

            App.router.navigate(url, { trigger: true });

        },

        dispose: function () {


        }

    });

    return GoOpenEndedView;

});