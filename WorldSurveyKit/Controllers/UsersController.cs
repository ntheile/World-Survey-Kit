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
using System.Web.Http.OData;

namespace WorldSurveyKit.Controllers
{
    [Auth.FB]
    public class UsersController : ApiController
    {
        private MyDatabase db = new MyDatabase();
        private int uId = Auth.FB.GetUserId();

        /// GET api/Users
        /// <summary>
        /// GET's all of the users in the system
        /// </summary>
        public IEnumerable<Users> GetUsers()
        {

            if (Auth.FB.IsOrgAdmin())
            {
                return db.Users.AsEnumerable();
            }
            else
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            }

        }


        /// GET api/Users/5
        /// <summary>
        /// GET's all the information about a user by ID
        /// </summary>
        public Users GetUsers(int id)
        {
            Users users = db.Users.Find(id);
            if (users == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            if (Auth.FB.IsOrgAdmin() || users.id == uId)
            {
                return users;
            }
            else
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            }

        }

        /// PUT api/Users/5
        /// <summary>
        /// UPDATE's user information like the users Name, defaultOrg, and isSystemAdmin
        /// You must be a system administrator to use this 
        /// </summary>
        public HttpResponseMessage PutUsers(int id, Users users)
        {
            // You must be a system admin to perform these actions
            if (Auth.FB.IsSystemAdmin())
            {

                if (ModelState.IsValid)
                {

                    db.Entry(users).State = EntityState.Modified;

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
                else
                {
                    return Request.CreateResponse(HttpStatusCode.BadRequest);
                }

            }
            else
            {
                return Request.CreateResponse(HttpStatusCode.Unauthorized);
            }

        }


        /// POST api/Users
        /// <summary>
        /// CREATE's a new user
        /// </summary>
        public HttpResponseMessage PostUsers(Users users)
        {
            if (Auth.FB.IsOrgAdmin())
            {
                if (ModelState.IsValid)
                {
                    //Check to see FB ID already exists

                    var existingUser = db.Users.Where(u => u.fbUserId == users.fbUserId).Count();
                    if (existingUser == 0)
                    {
                        // make the default org 1 if none is passed in
                        int defaultOrgId = users.defaultOrg;
                        if (defaultOrgId == 0)
                        {
                            users.defaultOrg = 1;
                        }

                        db.Users.Add(users);
                        db.SaveChanges();

                        HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, users);
                        response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = users.id }));
                        return response;
                    }
                    else
                    {
                        throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.BadRequest));
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

        /// DELETE api/Users/5
        /// /// <summary>
        /// DELETE's a user entirely from the system
        /// </summary>
        public HttpResponseMessage DeleteUsers(int id)
        {

            if (Auth.FB.IsSystemAdmin())
            {
                Users users = db.Users.Find(id);
                if (users == null)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }

                db.Users.Remove(users);

                try
                {
                    db.SaveChanges();
                }
                catch (DbUpdateConcurrencyException)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }

                return Request.CreateResponse(HttpStatusCode.OK, users);
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
    public class WhoAmIController : ApiController
    {
        private MyDatabase db = new MyDatabase();


        /// GET api/whomai
        /// <summary>
        /// Gets the users ID , FB ID, and user's orgs
        /// </summary>
        [HttpGet]
        public HttpResponseMessage GetWhoAmI()
        {
            // wait for FB to replicate your FBToken
            System.Threading.Thread.Sleep(500);
            int uId = Auth.FB.GetUserId();
            string fbId = Auth.FB.GetFbId();


            try
            {
                // are you either a System admin or an admin of at least one org?
                bool isAdmin = false;
                if (Auth.FB.IsSystemAdmin())
                {
                    isAdmin = true;
                }
                else
                {
                    if (Auth.FB.IsOrgAdmin())
                    {
                        isAdmin = true;
                    }
                }

                // what are the orgs you are a member of?
                var myOrgs = db.OrgUserMappings.Include(oo => oo.Orgs).Where(o => o.usersId == uId);

                Users u = db.Users.Find(uId);
                Orgs org = db.Orgs.Find(u.defaultOrg);


                return this.Request.CreateResponse(HttpStatusCode.OK, new
                {
                    Id = uId,
                    FbUserId = fbId,
                    IsAdmin = isAdmin,
                    org = myOrgs,
                    defaultOrg = u.defaultOrg,
                    defaultOrgName = org.orgName,
                    isSystemAdmin = u.isSystemAdmin
                });
            }
            catch (Exception ex)
            {

                return this.Request.CreateResponse(HttpStatusCode.OK, new
                {
                    error = ex
                });

            }

        }

        /// PUT api/whomai
        /// <summary>
        /// Updates the defaultOrg for the user
        /// </summary>
        [HttpPut]
        public HttpResponseMessage PutWhoAmI(int id, Users users)
        {
            int uId = Auth.FB.GetUserId();
            string fbId = Auth.FB.GetFbId();

            Users _users = db.Users.Find(id);
            if (_users == null) return Request.CreateResponse(HttpStatusCode.NotFound);

            // You must be the user
            if (_users.id == uId)
            {

                //update only the defaultOrg field
                _users.defaultOrg = users.defaultOrg;

                db.Entry(_users).State = EntityState.Modified;

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
            else
            {
                return Request.CreateResponse(HttpStatusCode.Unauthorized);
            }

        }

    }

}