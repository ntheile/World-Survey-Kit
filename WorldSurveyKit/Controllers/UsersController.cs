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
        /// If the user passes in api/whoami?s=343 a s or new survey id then one is created if credentials check out
        /// </summary>
        [HttpGet]
        public HttpResponseMessage GetWhoAmI(int ? s = 0)
        {
            // wait for FB to replicate your FBToken
            System.Threading.Thread.Sleep(500);
            int uId = Auth.FB.GetUserId();
            string fbId = Auth.FB.GetFbId(); 

            try
            {

                // what are the orgs you are a member of?
                var myOrgs = db.OrgUserMappings.Include(oo => oo.Orgs).Where(o => o.usersId == uId);

                Users u = db.Users.Find(uId);
                Orgs org = db.Orgs.Find(u.defaultOrg);

                // are you either a System admin or an admin of at least one org?
                bool isAdmin = false;
                if (Auth.FB.IsSystemAdmin())
                {
                    isAdmin = true;
                }
                else
                {
                    // determine if the user is an admin of his default org

                    if (Auth.FB.IsOrgAdmin(u.defaultOrg))
                    {
                        isAdmin = true;
                    }
                }


                // if a newFileId is passed in and the user is a member of that org then create a fileInstance, 
                //      set the files org as the user deafult org and send back a url #go?file{fileInstId}
                string referrerUrl = "";
                // is new file passed in
                if (s != 0 ) {
                    
                    // is user a member of the org?
                    File fileDetails = db.File.FirstOrDefault(ff => ff.id == s);
                    int orgsId = fileDetails.id;
                    if (Auth.FB.IsOrgUser(orgsId))
                    {
                        int myId = Auth.FB.GetUserId();
                        
                        
                        // create the file instance
                        NewFileInstance n = new NewFileInstance();
                        n.fileId = fileDetails.id;
                        n.userId = u.id;
                        n.name = fileDetails.fileName + " - " + u.name + " " + DateTime.Now.ToString("O");
                        n.created_at = DateTime.Now.ToString("O");

                        NewFileInstance newFileInst = db.NewFileInstance.Add(n);
                        db.SaveChanges();
                        

                        //Update the Users default org
                        u.defaultOrg = fileDetails.orgsId;
                        db.Entry(u).State = EntityState.Modified;
                        db.SaveChanges();

                        // get the first question for url
                        Questions q = db.Questions.FirstOrDefault(dd => dd.fileId == fileDetails.id && dd.order == 1);

                        // pass back file location
                        referrerUrl = "#go?file" + newFileInst.id + "?q" + q.id;

                        isAdmin = Auth.FB.IsOrgAdmin(u.defaultOrg);

                    }
                    else
                    {
                        referrerUrl = "";
                    }

                }
                else{
                    referrerUrl = "";
                }


                return this.Request.CreateResponse(HttpStatusCode.OK, new
                {
                    Id = uId,
                    FbUserId = fbId,
                    IsAdmin = isAdmin,
                    org = myOrgs,
                    defaultOrg = u.defaultOrg,
                    defaultOrgName = org.orgName,
                    isSystemAdmin = u.isSystemAdmin,
                    referrerUrl = referrerUrl
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



    [Auth.FB]
    public class FBUsersController : ApiController
    {
        private MyDatabase db = new MyDatabase();


        /// POST api/FBUsers
        /// <summary>
        /// Adds a Fb user to an org , if the fb user does not yet exists then an accont is created for them
        /// </summary>
        [HttpPost]
        public HttpResponseMessage PostFBUsers(IEnumerable<Users> usr)
        {
           
                //if (ModelState.IsValid)
                //{
                    // loop users
                    foreach (Users users in usr)
                    {
                        if (Auth.FB.IsOrgAdmin(users.defaultOrg))
                        {

                            //Check to see FB ID already exists
                            Users existingUser = db.Users.FirstOrDefault(u => u.fbUserId == users.fbUserId);
                            if (existingUser == null)
                            {
                                // new user
                                // create account
                                Users newUser = new Users();
                                var now = DateTime.Now.ToString("O");
                                newUser.defaultOrg = 1;
                                newUser.fbUserId = users.fbUserId;
                                newUser.created_at = now;
                                newUser.isSystemAdmin = false;
                                newUser.updated_at = now;
                                newUser.name = users.name;

                                db.Users.Add(newUser);
                                db.SaveChanges();


                                // add the user to an org with there name as the orgName
                                Orgs newOrg = new Orgs();
                                newOrg.created_at = now;
                                newOrg.orgName = users.name;
                                newOrg.updated_at = now;

                                // save new org to the Org DB
                                db.Orgs.Add(newOrg);
                                db.SaveChanges();

                                // Map user to the org that was just created and make him the admin
                                db.OrgUserMappings.Add(new OrgUserMappings { usersId = newUser.id, isOrgAdmin = true, orgsId = newOrg.id });

                                // add an org user mapping
                                db.OrgUserMappings.Add(new OrgUserMappings { usersId = newUser.id, isOrgAdmin = users.isSystemAdmin, orgsId = users.defaultOrg });

                                db.SaveChanges();

                                // set the default org for the user
                                newUser.defaultOrg = newOrg.id;
                                db.Entry(newUser).State = EntityState.Modified;
                                db.SaveChanges();
                            }
                            else
                            {
                                // if usr exists
                                // add an org user mapping, if one does not already exist
                                OrgUserMappings existingMapping = db.OrgUserMappings.FirstOrDefault(ou => ou.orgsId == users.defaultOrg && ou.usersId == existingUser.id);
                                if (existingMapping != null)
                                {
                                    // update mapping
                                    existingMapping.isOrgAdmin = users.isSystemAdmin;
                                    db.Entry(existingMapping).State = EntityState.Modified;
                                }
                                else
                                {
                                    // create mapping
                                    db.OrgUserMappings.Add(new OrgUserMappings { isOrgAdmin = users.isSystemAdmin, orgsId = users.defaultOrg, usersId = existingUser.id });
                                }

                                db.SaveChanges();



                            }
                         }
                        
                    }
                    
                    return Request.CreateResponse(HttpStatusCode.OK);

                //}
                //else
                //{
                //    return Request.CreateResponse(HttpStatusCode.BadRequest);
                //}
            
            //else
            //{
            //    throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.Unauthorized));
            //}

        }


    }

}