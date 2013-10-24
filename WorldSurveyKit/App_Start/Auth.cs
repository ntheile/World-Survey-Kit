using WorldSurveyKit.Models;
using Facebook;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Principal;
using System.Threading;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;

namespace WorldSurveyKit.App_Start
{

    /// <summary>
    /// 
    ///     [Auth.FB] - checks if fb identity is accurate and gets authorations roles from 
    ///     our database based on the fb user id, also checks if api token is valid
    /// 
    ///     Must pass these headers: ApiToken, FbToken
    /// 
    ///     POST http://localhost:800/api/values HTTP/1.1
    ///     User-Agent: Fiddler
    ///     content-type: application/json
    ///     Host: localhost:44951
    ///     ApiToken:saO1zbN6K1l9WjQiDKpZ
    ///     FbToken:[....]
    ///     
    /// </summary>
    public class Auth
    {

        private static string _fbUserid = "";
        private static int _userId;
        private static string[] _roles;
        private static string _fbToken = "";

        // Extend the AuthorizeAttribute and add custom Auth Handling Here. 
        public class FB : System.Web.Http.AuthorizeAttribute
        {

            public FB() { }

            private bool _isAuth = false;
            private string _apiTokenSecret = "saO1zbN6K1l9WjQiDKpZ";
            private string _apiToken;


            public override void OnAuthorization(HttpActionContext actionContext)
            {

                MyDatabase db = new MyDatabase();

                try
                {
                    // get api token from the user header ApiToken
                    IEnumerable<string> token = actionContext.Request.Headers.GetValues("ApiToken");
                    _apiToken = token.First();

                    // get facebook credential based on fb token passed in
                    IEnumerable<string> fbToken = actionContext.Request.Headers.GetValues("FbToken");
                    Debug.Write(fbToken.First());
                    _fbToken = fbToken.First();

                    // Check is user is Legit
                    // authenicated
                    if (_apiToken == _apiTokenSecret)
                    {
                        // the api token is good, is the facebook token valid ? and who are you ?
                        var client = new FacebookClient(_fbToken);
                        dynamic result = client.Get("me", new { fields = "name,id" });
                        // set the users identity
                        _fbUserid = result.id;
                        var _fbName = result.name;

                        if (_fbUserid != "")
                        {

                            // get the userid (internal id ) from the db -  user.Id
                            var user = db.Users.Where(u => u.fbUserId == _fbUserid).FirstOrDefault();

                            // Brand new user to add
                            if (user == null)
                            {
                                //_isAuth = false;
                                // add user to db
                                Users newUser = new Users();
                                var now = DateTime.Now.ToString("O");
                                newUser.defaultOrg = 1;
                                newUser.fbUserId = _fbUserid;
                                newUser.created_at = now;
                                newUser.isSystemAdmin = false;
                                newUser.updated_at = now;
                                newUser.name = _fbName;

                                db.Users.Add(newUser);
                                db.SaveChanges();


                                // add the user to an org with there name as the orgName
                                Orgs newOrg = new Orgs();
                                newOrg.created_at = now;
                                newOrg.orgName = _fbName;
                                newOrg.updated_at = now;

                                // save new org to the Org DB
                                db.Orgs.Add(newOrg);
                                db.SaveChanges();

                                // Map user to the org that was just created and make him the admin
                                db.OrgUserMappings.Add(new OrgUserMappings { usersId = newUser.id, isOrgAdmin = true, orgsId = newOrg.id});
                                db.SaveChanges();

                                // set the default org for the user
                                newUser.defaultOrg = newOrg.id;
                                db.SaveChanges();



                                _userId = newUser.id;

                                // Set up the identity object that our Controllers can use
                                GenericIdentity identity = new GenericIdentity(_fbUserid);
                                System.Threading.Thread.CurrentPrincipal =
                                    new GenericPrincipal(identity, _roles);

                                _isAuth = true;


                            }
                            else
                            {
                                _userId = user.id;

                                // Set up the identity object that our Controllers can use
                                GenericIdentity identity = new GenericIdentity(_fbUserid);
                                System.Threading.Thread.CurrentPrincipal =
                                    new GenericPrincipal(identity, _roles);

                                _isAuth = true;

                            }

                           
                        }
                        else
                        {
                            _isAuth = false;
                        }

                    }
                    // not authenicated
                    else
                    {
                        _isAuth = false;
                    }


                    //authenicated
                    if (_isAuth)
                    {
                        Debug.WriteLine("You're authenicated");

                    }
                    // not authenicated
                    else
                    {
                        // 417 - so we can specify a message
                        actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.ExpectationFailed);
                        actionContext.Response.ReasonPhrase = "Invalid token";
                        actionContext.Response.Content = new StringContent("Invalid token");

                    }
                }
                catch (FacebookOAuthException e)
                {
                    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.ExpectationFailed);
                    actionContext.Response.ReasonPhrase = e.Message;
                    actionContext.Response.Content = new StringContent(e.InnerException.ToString());
                }
                catch (FacebookApiLimitException e)
                {
                    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.ExpectationFailed);
                    actionContext.Response.ReasonPhrase = e.Message;
                    actionContext.Response.Content = new StringContent(e.InnerException.ToString());

                }
                catch (FacebookApiException e)
                {
                    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.ExpectationFailed);
                    actionContext.Response.ReasonPhrase = e.Message;
                    actionContext.Response.Content = new StringContent(e.InnerException.ToString());
                }
                catch (Exception e)
                {
                    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.ExpectationFailed);
                    actionContext.Response.ReasonPhrase = e.Message;
                    actionContext.Response.Content = new StringContent(e.InnerException.ToString());
                }
                finally
                {
                    db.Dispose();
                }

            }

            public class HandleExceptionAttribute : ExceptionFilterAttribute
            {
                public override void OnException(HttpActionExecutedContext actionExecutedContext)
                {
                    if (actionExecutedContext.Exception != null)
                    {
                        var exception = actionExecutedContext.Exception;
                        var response = new HttpResponseMessage();
                        response.StatusCode = HttpStatusCode.InternalServerError;
                        response.ReasonPhrase = exception.Message;
                        actionExecutedContext.Response = response;
                    }
                }
            }








            #region Custom Authorization Logic

            public static int GetUserId()
            {

                return _userId;

            }

            public static string GetFbId()
            {
                return _fbUserid;
            }

            public static bool IsOrgAdmin()
            {

                MyDatabase db = new MyDatabase();

                bool isOrgAdmin = false;

                // system admins are admins for any org
                if (IsSystemAdmin())
                {
                    isOrgAdmin = true;
                }
                else
                {
                    var orgMap = db.OrgUserMappings.Include("Orgs");
                    foreach (var o in orgMap)
                    {

                        if (o.usersId == _userId && o.isOrgAdmin == true)
                        {
                            isOrgAdmin = true;
                            break;
                        }

                    }
                }

                db.Dispose();

                return isOrgAdmin;
            }

            public static bool IsOrgAdmin(string org)
            {
                MyDatabase db = new MyDatabase();

                bool isOrgAdmin = false;

                // system admins are admins for any org
                if (IsSystemAdmin())
                {
                    isOrgAdmin = true;
                }
                else
                {
                    var orgMap = db.OrgUserMappings.Include("Orgs").Where(o => o.Orgs.orgName == org);
                    foreach (var o in orgMap)
                    {

                        if (o.usersId == _userId && o.isOrgAdmin == true)
                        {
                            isOrgAdmin = true;
                            break;
                        }

                    }
                }

                db.Dispose();

                return isOrgAdmin;
            }

            public static bool IsOrgAdmin(int org)
            {

                MyDatabase db = new MyDatabase();

                bool isOrgAdmin = false;

                // system admins are admins for any org
                if (IsSystemAdmin())
                {
                    isOrgAdmin = true;
                }
                else
                {
                    var orgMap = db.OrgUserMappings.Include("Orgs").Where(o => o.orgsId == org);
                    foreach (var o in orgMap)
                    {

                        if (o.usersId == _userId && o.isOrgAdmin == true)
                        {
                            isOrgAdmin = true;
                            break;
                        }

                    }
                }

                db.Dispose();

                return isOrgAdmin;
            }

            public static bool IsOrgUser(int org)
            {

                MyDatabase db = new MyDatabase();

                bool isOrgUser = false;

                // system admins are automatically an org user
                if (IsSystemAdmin())
                {
                    isOrgUser = true;
                }
                else
                {
                    var orgMap = db.OrgUserMappings.Include("Orgs").Where(o => o.orgsId == org);
                    foreach (var o in orgMap)
                    {

                        if (o.usersId == _userId)
                        {
                            isOrgUser = true;
                            break;
                        }

                    }
                }

                db.Dispose();

                return isOrgUser;
            }

            public static bool IsSystemAdmin()
            {
                MyDatabase db = new MyDatabase();

                bool isSysAdmin = false;

                var a = db.Users.Find(_userId);

                if (a.isSystemAdmin)
                {
                    isSysAdmin = true;
                }

                db.Dispose();

                return isSysAdmin;
            }

            // does the user have access to a file ?
            public static bool HasFileAccess(int fileId)
            {
                MyDatabase db = new MyDatabase();

                bool hasFileAccess = false;

                if (IsSystemAdmin()) // yes, if you are a sys admin
                {
                    hasFileAccess = true;
                }
                else
                {
                    // What org does the file belong to?
                    File f = db.File.Find(fileId);
                    int FilesOrg = f.orgsId;

                    // Does the user belong to this org?
                    IEnumerable<OrgUserMappings> u = db.OrgUserMappings.Where(m => m.usersId == _userId && m.orgsId == FilesOrg);
                    if (u.Count() > 0)
                    {
                        hasFileAccess = true;
                    }
                }

                db.Dispose();

                return hasFileAccess;
            }

            // does the user have access to a file instance (i.e his own file) ?
            public static bool HasFileInstanceAccess(NewFileInstance newfileinstance)
            {

                MyDatabase db = new MyDatabase();

                bool hasAccess = false;

                if (IsSystemAdmin()) //yes if you are a sys admin
                {
                    hasAccess = true;
                }
                else
                {

                    // yes if your userId is on the file
                    if (newfileinstance.userId == _userId)
                    {
                        hasAccess = true;
                    }
                    // yes if you are an orgAdmin
                    else
                    {
                        // What org does the fileInstance belong to?
                        File f = db.File.Find(newfileinstance.fileId);
                        int FilesOrg = f.orgsId;

                        // Is the user an admin of this org?
                        IEnumerable<OrgUserMappings> org = db.OrgUserMappings.Where(m => m.usersId == _userId && m.orgsId == FilesOrg && m.isOrgAdmin == true);
                        if (org.Count() > 0)
                        {
                            hasAccess = true;
                        }
                    }

                }

                db.Dispose();

                return hasAccess;
            }

            // does the user have access to a file instance (i.e his own file) by fileInstId ?
            public static bool HasFileInstanceAccess(int fileInstId)
            {

                MyDatabase db = new MyDatabase();

                bool hasAccess = false;

                NewFileInstance newfileinstance = db.NewFileInstance.Find(fileInstId);

                if (IsSystemAdmin()) //yes if you are a sys admin
                {
                    hasAccess = true;
                }
                else
                {

                    // yes if your userId is on the file
                    if (newfileinstance.userId == _userId)
                    {
                        hasAccess = true;
                    }
                    // yes if you are an orgAdmin
                    else
                    {
                        // What org does the fileInstance belong to?
                        File f = db.File.Find(newfileinstance.fileId);
                        int FilesOrg = f.orgsId;

                        // Is the user an admin of this org?
                        IEnumerable<OrgUserMappings> org = db.OrgUserMappings.Where(m => m.usersId == _userId && m.orgsId == FilesOrg && m.isOrgAdmin == true);
                        if (org.Count() > 0)
                        {
                            hasAccess = true;
                        }
                    }

                }

                db.Dispose();

                return hasAccess;
            }

            // does the user have access to a question ?
            public static bool HasQuestionAccess(int questionId)
            {

                MyDatabase db = new MyDatabase();

                bool hasQuestionAccess = false;

                if (IsSystemAdmin()) // yes, if you are a sys admin
                {
                    hasQuestionAccess = true;
                }
                else
                {
                    // What file does the question belong to?
                    Questions q = db.Questions.Find(questionId);

                    // if you have access to the file, then you have access to the question
                    if (HasFileAccess(q.fileId))
                    {
                        hasQuestionAccess = true;
                    }

                }

                db.Dispose();

                return hasQuestionAccess;
            }

            // does the user have access to a response ?
            // you must be the user who created the response, or the orgAdmin, or the Sysadmin
            public static bool HasResponseAccess(int responseId)
            {
                MyDatabase db = new MyDatabase();

                bool hasResponseAccess = false;

                if (IsSystemAdmin()) // yes, if you are a sys admin
                {
                    hasResponseAccess = true;
                }
                else
                {

                    Responses responseSecurityCheck = db.Responses.Include("NewFileInstance").SingleOrDefault(r => r.id == responseId);

                    if (HasFileInstanceAccess(responseSecurityCheck.NewFileInstance))
                    {
                        hasResponseAccess = true;
                    }

                }

                db.Dispose();

                return hasResponseAccess;
            }

            public static string GetFBToken()
            {
                return _fbToken;
            }

            #endregion


        }

    }

}
