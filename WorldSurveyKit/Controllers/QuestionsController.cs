using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using WorldSurveyKit.Models;
using WorldSurveyKit.App_Start;

namespace WorldSurveyKit.Controllers
{
    [Auth.FB]
    public class QuestionsController : ApiController
    {
        private MyDatabase db = new MyDatabase();

        /// GET api/Questions/id
        /// <summary>
        /// GET the data about a question by id
        /// </summary>
        public HttpResponseMessage GetQuestions(int id)
        {
            if (Auth.FB.HasQuestionAccess(id))
            {

                var questions = db.Questions.Find(id);
                if (questions == null)
                {
                    throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
                }

                return this.Request.CreateResponse(HttpStatusCode.OK, questions);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.Unauthorized);
            }

        }



        /// PUT api/Questions/questionId
        /// <summary>
        ///     UPDATE's a question. 
        ///     Order logic: -1 = make order first, -2 = no change in order, -3 = make order last,
        ///     Anything else is the questionId the current question should go after
        /// </summary>
        public HttpResponseMessage PutQuestions(int id, Questions questions)
        {

            // figure out the org's ID based up the fileId passed in 
            var orgsFile = db.File.FirstOrDefault(f => f.id == questions.fileId);
            File orgsFileParsed = (File)orgsFile;
            db.Entry(orgsFile).State = EntityState.Detached;

            // org Id
            int orgsId = orgsFileParsed.orgsId;

            if (Auth.FB.IsOrgAdmin(orgsId))
            {

                if (ModelState.IsValid)
                {

                    // order logic 
                    int currentPosition = 0;

                    // make order first, then save the question
                    if (questions.order == -1)
                    {


                        Questions currentQuestion = db.Questions.Find(id);
                        currentPosition = currentQuestion.order;
                        db.Entry(currentQuestion).State = EntityState.Detached;

                        // for each question in the collection up to the current postion, increment 1 then save to the db
                        IEnumerable<Questions> questionCollection = db.Questions.Where(q => q.fileId == questions.fileId).OrderBy(o => o.order);
                        Questions tempQuestion;
                        for (int i = 0; i < currentPosition - 1; i++)
                        {

                            // increment by 1
                            tempQuestion = questionCollection.ElementAt(i);
                            tempQuestion.order = tempQuestion.order + 1;

                            // save db
                            //db.Entry(tempQuestion).State = EntityState.Modified;
                            db.Entry(tempQuestion).CurrentValues.SetValues(tempQuestion);

                            db.SaveChanges();

                            db.Entry(tempQuestion).State = EntityState.Detached;

                        }

                        // set the new position for the question passed in
                        questions.order = 1;

                        db.Entry(questions).State = EntityState.Modified;

                        try
                        {
                            db.SaveChanges();
                        }
                        catch (DbUpdateConcurrencyException)
                        {
                            return Request.CreateResponse(HttpStatusCode.NotFound);
                        }

                        return Request.CreateResponse(HttpStatusCode.OK);


                    }
                    // do not change order, then save to the database
                    else if (questions.order == -2)
                    {

                        Questions q = db.Questions.Find(id);
                        questions.order = q.order;
                        db.Entry(q).State = EntityState.Detached;

                        db.Entry(questions).State = EntityState.Modified;

                        try
                        {
                            db.SaveChanges();
                        }
                        catch (DbUpdateConcurrencyException)
                        {
                            return Request.CreateResponse(HttpStatusCode.NotFound);
                        }

                        return Request.CreateResponse(HttpStatusCode.OK);


                    }
                    // make order last, then save the question to the database
                    else if (questions.order == -3)
                    {

                        // Get the current position of the question
                        Questions currentQuestion = db.Questions.Find(id);
                        currentPosition = currentQuestion.order;
                        db.Entry(currentQuestion).State = EntityState.Detached;

                        // for each question in the collection from the current postion (plus one) to the last position, decrement 1 then save to the db
                        IEnumerable<Questions> questionCollection = db.Questions.Where(q => q.fileId == questions.fileId).OrderBy(o => o.order);
                        Questions tempQuestion;
                        int lastPosition = questionCollection.Last().order;
                        for (int i = currentPosition; i < lastPosition; i++) // currentPostion is a zero based array on the questionsCollection
                        {

                            // decrement by 1
                            tempQuestion = questionCollection.ElementAt(i);
                            tempQuestion.order = tempQuestion.order - 1;

                            // save db
                            db.Entry(tempQuestion).CurrentValues.SetValues(tempQuestion);
                            db.SaveChanges();
                            db.Entry(tempQuestion).State = EntityState.Detached;
                        }

                        // make order last
                        tempQuestion = questionCollection.Where(qu => qu.id == questions.id).First();
                        tempQuestion.order = lastPosition;
                        tempQuestion.created_at = questions.created_at;
                        tempQuestion.updated_at = questions.updated_at;
                        tempQuestion.question = questions.question;


                        // save db
                        db.Entry(tempQuestion).CurrentValues.SetValues(tempQuestion);
                        try
                        {
                            db.SaveChanges();
                        }
                        catch (DbUpdateConcurrencyException)
                        {
                            return Request.CreateResponse(HttpStatusCode.NotFound);
                        }

                        return Request.CreateResponse(HttpStatusCode.OK);

                    }
                    // make an order swap, then save to the database
                    else
                    {

                        // The passed in questions.order is really the questionId where the current question should go after

                        // Get the current position of the question
                        Questions currentQuestion = db.Questions.Find(id);
                        currentPosition = currentQuestion.order;
                        db.Entry(currentQuestion).State = EntityState.Detached;

                        // for each question in the collection from the current postion (plus one) to the last position, decrement 1 then save to the db
                        IEnumerable<Questions> questionCollection = db.Questions.Where(q => q.fileId == questions.fileId).OrderBy(o => o.order);
                        Questions tempQuestion;

                        // Get the newPosition for the question to go after
                        int newPosition = questionCollection.Where(qq => qq.id == questions.order).First().order;

                        // Sort Logic for the swap

                        // question is being moved down the stack then save to db
                        if (currentPosition < newPosition)
                        {

                            for (int i = currentPosition; i < newPosition; i++) // currentPostion is a one-based array compared to questionsCollection which is a zero-based array
                            {

                                // decrement by 1
                                tempQuestion = questionCollection.ElementAt(i);
                                tempQuestion.order = tempQuestion.order - 1;

                                // save db
                                db.Entry(tempQuestion).CurrentValues.SetValues(tempQuestion);
                                db.SaveChanges();
                                db.Entry(tempQuestion).State = EntityState.Detached;
                            }

                            // put current question in it's new position
                            tempQuestion = questionCollection.Where(qu => qu.id == questions.id).First();
                            tempQuestion.order = newPosition;
                            tempQuestion.created_at = questions.created_at;
                            tempQuestion.updated_at = questions.updated_at;
                            tempQuestion.question = questions.question;


                            // save db
                            db.Entry(tempQuestion).CurrentValues.SetValues(tempQuestion);
                            try
                            {
                                db.SaveChanges();
                            }
                            catch (DbUpdateConcurrencyException)
                            {
                                return Request.CreateResponse(HttpStatusCode.NotFound);
                            }

                            return Request.CreateResponse(HttpStatusCode.OK);


                        }
                        // question is being moved up the stack, then save to db
                        else if (newPosition < currentPosition)
                        {

                            for (int i = newPosition; i < currentPosition - 1; i++) // currentPostion is a one-based array compared to questionsCollection which is a zero-based array
                            {

                                // increment by 1
                                tempQuestion = questionCollection.ElementAt(i);
                                tempQuestion.order = tempQuestion.order + 1;

                                // save db
                                db.Entry(tempQuestion).CurrentValues.SetValues(tempQuestion);
                                db.SaveChanges();
                                db.Entry(tempQuestion).State = EntityState.Detached;
                            }

                            // put current question in it's new position
                            tempQuestion = questionCollection.Where(qu => qu.id == questions.id).First();
                            tempQuestion.order = newPosition + 1;
                            tempQuestion.created_at = questions.created_at;
                            tempQuestion.updated_at = questions.updated_at;
                            tempQuestion.question = questions.question;


                            // save db
                            db.Entry(tempQuestion).CurrentValues.SetValues(tempQuestion);
                            try
                            {
                                db.SaveChanges();
                            }
                            catch (DbUpdateConcurrencyException)
                            {
                                return Request.CreateResponse(HttpStatusCode.NotFound);
                            }

                            return Request.CreateResponse(HttpStatusCode.OK);
                        }
                        // no order change, but save db
                        else
                        {
                            // put current question in it's new position
                            tempQuestion = questionCollection.Where(qu => qu.id == questions.id).First();
                            tempQuestion.created_at = questions.created_at;
                            tempQuestion.updated_at = questions.updated_at;
                            tempQuestion.question = questions.question;


                            // save db
                            db.Entry(tempQuestion).CurrentValues.SetValues(tempQuestion);
                            try
                            {
                                db.SaveChanges();
                            }
                            catch (DbUpdateConcurrencyException)
                            {
                                return Request.CreateResponse(HttpStatusCode.NotFound);
                            }

                            return Request.CreateResponse(HttpStatusCode.OK);
                        }

                    }



                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest);
                }

            }
            else
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            }

        }

        /// POST api/Questions
        /// <summary>
        /// CREATE's a new question
        /// </summary>
        public HttpResponseMessage PostQuestions(Questions questions)
        {
            // figure out the org's ID based up the fileId passed in 
            var orgsFile = db.File.FirstOrDefault(f => f.id == questions.fileId);
            File orgsFileParsed = (File)orgsFile;
            // org Id
            int orgsId = orgsFileParsed.orgsId;

            if (Auth.FB.IsOrgAdmin(orgsId))
            {

                try
                {
                    // Order Logic
                    Questions lastQuestion = db.Questions.Where(q => q.fileId == questions.fileId).OrderByDescending(o => o.order).FirstOrDefault();
                    if (lastQuestion != null) // add 1 for last question
                    {
                        questions.order = lastQuestion.order + 1;
                    }
                    else // this is the first question in the file
                    {
                        questions.order = 1;
                    }


                    if (ModelState.IsValid)
                    {
                        db.Questions.Add(questions);
                        db.SaveChanges();

                        HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, questions);
                        response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = questions.id }));
                        return response;
                    }
                    else
                    {
                        return Request.CreateResponse(HttpStatusCode.BadRequest);
                    }
                }
                catch (Exception e)
                {
                    throw e;
                }


            }
            else
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            }

        }

        // DELETE api/Questions/5
        /// <summary>
        /// Delete's a question from a file, re-orders all the questions in a file
        /// it also does a manual cascade and deletes all responses related to this question
        /// </summary>
        public HttpResponseMessage DeleteQuestions(int id)
        {

            // must be org admin
            Questions questions = db.Questions.Find(id);
            if (questions == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            // figure out the org's ID based up the fileId passed in 
            var orgsFile = db.File.FirstOrDefault(f => f.id == questions.fileId);
            File orgsFileParsed = (File)orgsFile;
            // org Id
            int orgsId = orgsFileParsed.orgsId;

            if (Auth.FB.IsOrgAdmin(orgsId))
            {

                ///
                /// First make the question last to handle re-ordering of the other questions in the file
                /// 
                // Get the current position of the question
                int currentPosition = questions.order;
                //db.Entry(questions).State = EntityState.Detached;

                // for each question in the collection from the current postion (plus one) to the last position, decrement 1 then save to the db
                IEnumerable<Questions> questionCollection = db.Questions.Where(q => q.fileId == questions.fileId).OrderBy(o => o.order);
                Questions tempQuestion;
                int lastPosition = questionCollection.Last().order;
                for (int i = currentPosition; i < lastPosition; i++) // currentPostion is a zero based array on the questionsCollection
                {

                    // decrement by 1
                    tempQuestion = questionCollection.ElementAt(i);
                    tempQuestion.order = tempQuestion.order - 1;

                    // save db
                    db.Entry(tempQuestion).CurrentValues.SetValues(tempQuestion);
                    db.SaveChanges();
                    db.Entry(tempQuestion).State = EntityState.Detached;
                }

                // make order last
                tempQuestion = questionCollection.Where(qu => qu.id == questions.id).First();
                tempQuestion.order = lastPosition;
                tempQuestion.created_at = questions.created_at;
                tempQuestion.updated_at = questions.updated_at;
                tempQuestion.question = questions.question;

                // save db
                db.Entry(tempQuestion).CurrentValues.SetValues(tempQuestion);
                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }

                ///
                /// Second delete any reponse dependencies this question has 
                ///
                var responseDependentCollection = db.Responses.Where(r => r.questionsId == id);

                foreach (Responses response in responseDependentCollection)
                {
                    db.Responses.Remove(response);
                }


                ///
                /// Last delete the question
                /// 
                db.Questions.Remove(questions);

                try
                {
                    db.SaveChanges();

                }
                catch (DbUpdateConcurrencyException)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }

                return Request.CreateResponse(HttpStatusCode.OK, questions);
            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.Unauthorized);
            }

        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }

    }


    [Auth.FB]
    public class QuestionCollectionController : ApiController
    {
        private MyDatabase db = new MyDatabase();

        /// GET api/QuestionCollection/fileId
        /// <summary>
        /// GET's all the questions in a file, must be org user
        /// </summary>
        public HttpResponseMessage GetQuestionCollection(int id)
        {
            if (Auth.FB.HasFileAccess(id))
            {
                var questions = db.Questions.Where(q => q.fileId == id);
                if (questions == null)
                {
                    throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
                }

                return this.Request.CreateResponse(HttpStatusCode.OK, questions);
            }
            else
            {
                return this.Request.CreateResponse(HttpStatusCode.Unauthorized);
            }

        }

    }


    [Auth.FB]
    public class UQuestionCollectionController : ApiController
    {
        private MyDatabase db = new MyDatabase();

        /// GET api/UQuestionCollection/OrgId
        /// <summary>
        /// GET's all the questions in all the files in an org, must be org user
        /// </summary>
        public HttpResponseMessage GetUQuestionCollection(int id)
        {

            if (Auth.FB.IsOrgUser(id))
            {
                var questions = db.Questions.Where(q => q.File.orgsId == id);
                if (questions == null)
                {
                    throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
                }

                return this.Request.CreateResponse(HttpStatusCode.OK, questions);
            }
            else
            {
                return this.Request.CreateResponse(HttpStatusCode.Unauthorized);
            }

        }

    }

    [Auth.FB]
    public class QuestionLookupController : ApiController
    {
        private MyDatabase db = new MyDatabase();

        /// GET api/QuestionLookup/questionId
        /// <summary>
        /// Pass in the question ID, get the file Id that it belongs to
        /// </summary>
        public HttpResponseMessage GetQuestionLookup(int id)
        {
            var questions = db.Questions.Include("File").Where(q => q.id == id);

            if (questions == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return this.Request.CreateResponse(HttpStatusCode.OK, questions.First());
        }

    }

}