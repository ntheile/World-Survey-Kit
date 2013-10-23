// Import View
// ==========================

define(["jquery", "backbone", "models/Models"], function ($, Backbone, Models) {

    // Extends Backbone.View
    var ImportView = Backbone.View.extend({

        el: "#importer .main-content",

        events: {
            "click #import-button": "import_ONCLICK"
        },

        initialize: function () {

            console.log("====> ImportView - init()");

            App.importer = App.importer || {};

        },

        render: function () {

            var self = this;

            this.dropdown_ONSELECT(this.qid);

            return this;

        },

        dropdown_ONSELECT: function (qid) {

            var self = this;


                $("#handson-wrapper").show();

                // populate the grid with the questions and validation
                require(["handsontable"], function () {

                    App.importer.surveyId = parseInt(qid, 10);

                    var table = [];
                    var row = [];
                    var headers = [];
                    App.importer.questionsIdMap = [];
                    var responseArray = [];
                    var validatorArray = [];

                    // get table data for each question in the survey
                    _.each(App.uQuestionCollection.where({ fileId: App.importer.surveyId }), function (question) {
                        // get current column heading
                        var q = question.get("question");
                        headers.push(q);
                        // get the id of the question
                        var qid = question.get("sid");
                        var type = question.get("type");
                        App.importer.questionsIdMap.push(qid.toString());

                        // validation
                        var validateObj = {};
                        validateObj.allowInvalid = true;
                        validateObj.type = {
                            renderer: function (instance, td, row, col, prop, value, cellProperties) {
                                var escaped = Handsontable.helper.stringify(value);
                                escaped = escaped.replace(/^\s+|\s+$/g, "");  // trims white space from begining and end of string
                                td.innerHTML = escaped;

                                var valid = false;
                                var message = "valid";



                                // test if valid against 5 types (every value must be equal to regular expression or blank)
                                if (type == "OpenEnded") {
                                    // valid - everything is valid
                                    valid = true;
                                    message = "Valid";
                                }
                                else if (type == "Gps") {
                                    // valid
                                    if (/{"latitude":"-?[0-9]+(?:\.[0-9]*)?","longitude":"-?[0-9]+(?:\.[0-9]*)?","desc":"+.+"}/.test(escaped) || escaped == "") {
                                        valid = true;
                                        message = "Valid<br/>Example:<br/> {\"latitude\":\"43.6298483\",\"longitude\":\"-84.1873382\",\"desc\":\"some description\"}";
                                    }
                                        //invalid
                                    else {
                                        valid = false;
                                        message = "Invalid<br/>Example:<br/> {\"latitude\":\"43.6298483\",\"longitude\":\"-84.1873382\",\"desc\":\"some description\"}";
                                    }
                                }
                                else if (type == "MultipleChoice") {
                                    //invalid - start off invalid
                                    valid = false;
                                    var blank = false;
                                    if (escaped == "") {
                                        blank = true;
                                    }
                                    message = "Example (Must contain one or more of the following, separated by two commas ,,):<br/>";

                                    // trim the value in the cell by ,,
                                    var valuesArrayWhiteSpace = escaped.split(",,");
                                    var valuesArray = [];
                                    // get the options for the questions to see if they match 
                                    _.each(valuesArrayWhiteSpace, function (val) {
                                        val = val.replace(/^\s+|\s+$/g, "");  // trims white space from begining and end of string
                                        valuesArray.push(val);
                                    });

                                    escaped = valuesArray.join();

                                    var optionsArray = [];
                                    // get the options for the questions to see if they match 
                                    _.each(App.uOptionCollection.where({ questionsId: qid }), function (opt) {
                                        var o = opt.get("option");
                                        o = o.replace(/^\s+|\s+$/g, "");  // trims white space from begining and end of string
                                        optionsArray.push(o);
                                        message = message + o + "<br />";
                                    });

                                    // valid
                                    // see if all values in valuesArray are in optionsArray
                                    function containsAll(needles, haystack) {
                                        for (var i = 0, len = needles.length; i < len; i++) {
                                            if ($.inArray(needles[i], haystack) == -1) return false;
                                        }
                                        return true;
                                    }

                                    valid = containsAll(valuesArray, optionsArray);

                                    if (valid == true || blank == true) {
                                        valid = true;
                                        message = "Valid<br/>".concat(message);
                                    }
                                    else {
                                        message = "Invalid<br/>".concat(message);
                                    }

                                }
                                else if (type == "SingleAnswer") {

                                    //invalid - start off invalid
                                    valid = false;
                                    message = "Example (Must be one of the following):<br/>";

                                    // get the options for the questions to see if they match 
                                    _.each(App.uOptionCollection.where({ questionsId: qid }), function (opt) {
                                        var o = opt.get("option");
                                        o = o.replace(/^\s+|\s+$/g, "");  // trims white space from begining and end of string
                                        // valid
                                        if (escaped == o || escaped == "") {
                                            valid = true;
                                        }
                                        message = message + o + "<br />";
                                    });

                                    if (valid == true) {
                                        message = "Valid<br/>".concat(message);
                                    }
                                    else {
                                        message = "Invalid<br/>".concat(message);
                                    }

                                }
                                else if (type == "Signature") {
                                    valid = true;
                                    message = "  * Signatures can not be imported. Leave this column blank.";
                                }
                                else {
                                    valid = true;
                                    message = "";
                                }

                                $(td).attr("data-qid", qid);

                                // style the validity and bind to click for invalid
                                if (valid == true) {
                                    $(td).removeClass("htInvalid");
                                    $(td).off("click");
                                    $(td).on("click", function (e) {
                                        $(td).addClass("htHoverOn");
                                        $("#tooltipdiv").html(message);
                                        $("#tooltipdiv").css("background-color", "green");
                                        $("#tooltipdiv").css("transition", "background 0.75s ease");
                                    });
                                }
                                else {
                                    $(td).addClass("htInvalid");
                                    $(td).off("click");
                                    $(td).on("click", function (e) {
                                        $(td).addClass("htHoverOn");
                                        $("#tooltipdiv").html("<p>" + message + "</p>");
                                        $("#tooltipdiv").css("background-color", "red");
                                        $("#tooltipdiv").css("transition", "background 0.75s ease");
                                    });
                                }
                                return td;
                            }
                        };

                        validatorArray.push(validateObj);

                    });


                    // handson table
                    $("#handson-table").handsontable({
                        data: [],
                        minCols: headers.length,
                        maxCols: headers.length,
                        colHeaders: headers,
                        minRows: 100,
                        currentRowClassName: 'currentRow',
                        currentColClassName: 'currentCol',
                        rowHeaders: true,
                        columns: validatorArray
                    });

                    App.importer.ht = $("#handson-table").handsontable('getInstance');


                });
            


        },

        import_ONCLICK: function (e) {

            // import if valid
            if (this.isTableValid(App.importer.ht)) {

                // turn our table data into a json object formatted like this
                //  { 
                //     file: fileId,
                //     fileName: name,
                //     questionsIdMap: ["34","35","36","37"}
                //     responses: [
                //        { 0: "q1a", 1: "q2a" },
                //        { 0: "q2a", 1: "q22a" },
                //        { 0: "q3a", 1: "q23a" },
                //        { 0: "q4a", 1: "q24a" }
                //     ]
                // 
                //  }

                var json = {};

                json.file = App.importer.surveyId.toString();  // file id
                json.fileName = $("#import-fileName").val();
                json.questionsIdMap = App.importer.questionsIdMap; // maps the columns number to a questions Id

                json.responses = [];
                // remove empty object from responses
                _.each(App.importer.ht.getData(), function (row) {
                    if (_.size(row) > 0) {
                        json.responses.push(row);
                    }
                });


                $("#importer-results-popup").popup('open');
                $("#importer-results").html('<img src="images/loadingLg.gif" />');

                $("#import-view-report").off("click");
                $("#import-view-report").on("click", { qid: App.importer.surveyId }, this.viewReport_ONCLICK);

                $.ajax({
                    type: "POST",
                    url: "/api/importer",
                    contentType: "application/json",
                    data: JSON.stringify(json)
                }).done(function (data) {

                    $("#importer-results").html('');

                    _.each(data.message, function (item) {
                        $("#importer-results").append(item + "<br/>");
                    });

                    // refresh the client history
                    App.uFileCollection.storage.sync.incremental({ url: App.utils.urlify("Files/" + App.defaultOrg) });
                    App.uFileInstanceCollection.storage.sync.incremental({ url: App.utils.urlify("FileInstances") });
                    App.uQuestionCollection.storage.sync.incremental({ url: App.utils.urlify("UQuestionCollection/" + App.defaultOrg) });
                    App.uOptionCollection.storage.sync.incremental({ url: App.utils.urlify("OptionCollection/" + App.defaultOrg) });


                }).fail(function (jqXHR, textStatus, errorThrown) {
                    $("#importer-results").html('');
                    $("#importer-results").append("Error<br/>" + errorThrown);
                });

            }
            else {
                alert("Invalid data, please fix the items highlighted in red on the table. Also make sure you fill in the survey name.");
            }

        },

        isTableValid: function (table) {

            if ($('#handson-table .htInvalid').length == 0 && $("#import-fileName").val() != "") {
                return true;
            }
            else {
                return false;
            }

        },

        viewReport_ONCLICK: function (e) {

            window.location.replace("#reports?" + e.data.qid);
            window.location.reload();

        }




    });

    return ImportView;

});