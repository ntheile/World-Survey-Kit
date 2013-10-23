// Models
// ==============

define(["jquery", "backbone"], function ($, Backbone) {
   
    var Models = {};

	// TEST - The Model constructor
	Models.OpenEndedModel = Backbone.Model.extend({
		defaults: {
			id: '',
			questionId: '',
			question: 'Question Placeholder',
			created_at: new Date(),
			//updated_at: new Date().getTime(),
			userId: App.uid,
			response: 'This is the answer placeholder',
			responsedTo: false,
			newFileInstanceId: ''
		}
	});

	Models.CameraModel = Backbone.Model.extend({
	    defaults: {
	        id: '',
	        questionId: '',
	        question: 'Question Placeholder',
	        created_at: new Date(),
	        //updated_at: new Date().getTime(),
	        userId: App.uid,
	        response: 'Camera',
	        responsedTo: false,
	        newFileInstanceId: ''
	    }
	});

	Models.OrgModel = Backbone.Model.extend({
	    defaults: {
            //id: null,
	        //orgName: ''
	        created_at: new Date()
	        //updated_at: new Date().getTime()     
	    }
	});

	Models.OrgUsersModel = Backbone.Model.extend({
	    defaults: {
	        //id: null,
	        //isOrgAdmin: '',
	        //orgsId: '',
            //usersId: '',
	        created_at: new Date()
	        //updated_at: new Date().getTime()     
	    }
	});

	Models.FileModel = Backbone.Model.extend({
	    defaults: {
	        //id: null,
	        //fileName: '',
	        //orgsId: '',
	        created_at: new Date()
	        //updated_at: new Date().getTime() 
	    }
	});

	Models.QuestionModel = Backbone.Model.extend({
	    defaults: {
	        //id: null,
	        //question: '',
	        //order: '',
	        //type: '',
            //fileId: '',
	        created_at: new Date()
	        //updated_at: new Date().getTime()     
	    }
	});


	Models.QOpenEndedModel = Backbone.Model.extend({

	    defaults: {
	        //id: '',
	        //question: 'Question Placeholder',
            // order: '',
	        created_at: new Date(),
	        //updated_at: new Date().getTime(),
	        //type: '',
            //fileId: ''
	    },

	    url: function () {

	        return App.utils.urlify("Questions");

	    },

	    // override sync for GET
	    sync: function (method, model, options) {
	        options || (options = {});

	        // passing options.url will override 
	        // the default construction of the url in Backbone.sync
	        switch (method) {
	            case "read":
	                options.url = App.utils.urlify("Questions/" + App.questionId);
	                break;
	        }

	        if (options.url)
	            Backbone.sync.call(model, method, model, options);
	    }

	});

	Models.OptionModel = Backbone.Model.extend({
	    defaults: {
	        //id: null,
	        //option: '',
            //questionsId: '',
	        created_at: new Date()
	        //updated_at: new Date().getTime()     
	    }
	});


	return Models;

});