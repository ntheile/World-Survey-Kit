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

namespace WorldSurveyKit.Controllers
{
    public class QuestionTypeLookupController : ApiController
    {
        private MyDatabase db = new MyDatabase();

        // GET api/QuestionTypeLookup
        public IEnumerable<QuestionTypeLookup> GetQuestionTypeLookups()
        {
            return db.QuestionTypeLookup.AsEnumerable();
        }

        // GET api/QuestionTypeLookup/5
        public QuestionTypeLookup GetQuestionTypeLookup(string id)
        {
            QuestionTypeLookup questiontypelookup = db.QuestionTypeLookup.Find(id);
            if (questiontypelookup == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return questiontypelookup;
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}