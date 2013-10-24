World Survey Kit
===================
-------------------

App Introduction
================
World Survey Kit revolves around collecting data in survey's called a kit. It is driven by questions, answers, surveys and data. Once you join an organization 
you can distribute your kit via email, or the World Survey Kit app.
If you are an organization you can even lock down certain kits to employees only.
            
Kits can be used by any industry:
            
* Education
	* Quizzes
	* Homework
	* Surveys
* Small Business
	* Client Satisfaction Surveys
	* Work order signatures and agreements
* Enterprise
	* Surveys to customers 
	* Market research
* Non Profit
	* GPS to gather global data
* Government
	* Signatures
	* Petitions
	* Polls
                
           
No problem is too big for World Survey Kit to solve. View kit results in beautiful tables and list views. Filter and 
print the data.

An organization has the ability to run their business on the platform.  It enables them to gather data based on a
variety of inputs including single answer, multiple choice, signature, GPS, open ended and more [More types coming soon...]. 
This will enable Organizations and NGO’s to solve some of the world’s most pressing problems. Where on earth 
do people need clean water? How can we make money off our sustainable solutions? How do I gather a signature 
to sell to a carbon credit broker in remote locations in Africa? etc...
                      
World survey kit is a cross-platform mobile and web application that works offline. With the rise of social
networks and big data the World Survey Kit combines the best of both worlds. World Survey Kit 
will enable organizations to gather valuable data, graph the results and help save lives and bring 
awareness to their cause while running their business. 


Architecture
=============

The World Survey Kit source code is composed of an ASP.NET MVC web api project (Backend) with static HTML5 files and Javascript files (Frontend). It's wrapped up in PhoneGap 
and deployed to Android and other mobile platforms (Phonegap Build). 


Authentication
===============

Authentication is implemented in the `App_Start\Auth.cs` using Facebook as the OAuth Provider and using `view\AuthView.js` as a helper. 
This can be extended for other authentication mechanisms. 
See this article http://www.codeproject.com/Tips/376810/ASP-NET-WEB-API-Custom-Authorize-and-Exception-Han


MVC (Model View Controller)
===========================

MVC design patterns are used on the client and server side using Backbone.js and ASP.NET MVC 4 Web Api (C#). 

Server Side
------------

The backend controllers are in the `controllers` folder. This is where you can extend and integrate with other 
backend systems. http://www.asp.net/web-api 

Client Side
------------
The client side source is contained in the `index.html` file and `js` folder. This single page application uses HTML5 and the 
PhoneGap Framework to accomplish one code base that works as native Android and iPhone (windows phone, blackberry etc..) apps as 
well as a web application.

These popular frameworks are used in the project (It's worth it to take some time to understand the frameworks):

* jQuery http://jquery.com/ - Powerful Javascript productivity framework
* jQueryMobile http://jquerymobile.com/ - Mobile UI styling
* RequireJS http://requirejs.org/ - AMD module loading 
* backbone http://backbonejs.org/ - Client side MVC framework
* underscore http://underscorejs.org/ - Backbone helper framework
* text http://requirejs.org/docs/api.html#text
* backbone.offline https://github.com/ask11/backbone-offline - Offline localStorage REST sync framework
* Phonegap (Cordova) http://phonegap.com/ - Wrap HTML5 to make native mobile applications
* SignaturePad http://thomasjbradley.ca/lab/signature-pad/ - Signature to JSON framework
* Backstretch https://github.com/srobbin/jquery-backstretch - UI background image
* DataTables https://datatables.net/ - Tables
* Sly http://darsa.in/sly/ - Slider menu
* Modernizr http://modernizr.com/ - Feature detection library
* Polyfiller http://afarkas.github.io/webshim/demos/ - Makes HTML5 code work in older browsers using web shims

Much of the code is written using jQuery Mobile, Javascript and Backbone. When the index.html page is visited on first load 
the main.js file is loaded and is the entry point for loading the javascript files. Next the platfrom specific code is ran from the js/device/*.js. 
After that auth.js is called which authenicates the user, if successful the router.js is loaded and hash routing is started. The required 
Backbone collections are loaded into localStorage on initialization of the router so the application can be used offline when no 
internet connectivity is available. When a user visits, for example, http://localhost:800/#home
the home function is called. Javascript files are loaded on demand using RequireJS.

Database
=========
The entity framework code first approach is used when creating Models. The database is located at `App_Data\database.mdf` 
http://msdn.microsoft.com/en-us/data/jj193542

Cross Platform Mobile Application
=================================

If you have platform specific phonegap code add it to the `js\device` folder

Config for different Devices

If you want to port to other platforms simply add device specific code to the `device/NAMEOFDEVICE.js` file to your project then wrap 
it up with with Phonegap Build. https://build.phonegap.com/

`config.js`

```
App.platform = "NAMEOFDEVICE";
```

The above can be applied to other platforms, such as Windows Phone, Blackberry etc...

Installation
=============
-------------

For Local Debugging
--------------------
* Unzip the project
* Open the solution in Visual Studio
* Debug in Visual Studio with IIS express and LocalDB
* Database is located at App_Data\database.mdf
* Edit the dbo.Users table and add your name, facebook id and make yourself system admin
* If needed configure ports in Project Properties > web

Facebook App
-------------
A Facebook app must be created for authenication to work 
(This can be disabled by some re-work and editing Auth.cs and changing the [Auth.FB] data attributes in the c# controller code )

1. Create a Facebook app here: https://developers.facebook.com/apps
2. Set the "App Domains" to localhost
3. Click "Website with Facebook Login" and set to http://localhost:800/
4. Copy the app id from facebook and set App.fbid in the `config.js` file


Configuration
==============
There are several configuration files in this application.

1. `js\main.js`
----------------
Main config file for the application and bootstrapping. This is the applications entry point.

2. `js\config.js` 
--------------------
Main global configuration file:

* `App.platform` =  iPhone, Android, or Web
* `App.rootUrl` = root url for the backend api, for Web this can be left blank
* `App.fbid` = id of app from facebook

3. `device\web.js`
---------------------
Config when App.platform = Web

4. `device\android.js`
------------------------
Config when App.platform = Android

5. `device\iphone.js`
------------------------
Config when App.platform = iPhone

6. `confg.xml`
---------------------------
This is used for PhoneGap build configuration




Deployment
===========

For deployment to Azure
------------------------
1. Goto https://manage.windowsazure.com/#Workspaces/WebsiteExtension/websites
2. New > compute > web site > custom create
3. Fill in inputs:
	* URL: YOURSITENAME
	* REGION: YOUR CLOSEST REGION
	* DATABASE: Create a free 20 MB SQL database
	* DB CONNECTION STRING Name: MyDatabase
4. Fill in database settings
	* NAME: YOURDATABASENAME
	* SERVER: New Sql Database Server
	* SERVER LOGIN NAME: YOURLOGINNAME
	* SERVER LOGIN PASSWORD: YOURPASSWORD
	* REGION: YOUR CLOSEST REGION
5. Complete
6. It will take a few minutes for the site and database to deploy
7. Deploy the project via source control or FTP
8. To deploy via FTP go to the Visual Studio Project
9. Make sure to configure js/config.js before you deploy to azure
	* App.platform =  "Web";
	* App.rootUrl = "";
	* App.fbid = "YOURFACEBOOKAPPID";
10. Make sure to configure your Facebook App for production deployment (You might want to create one for local development and one for production)
	* Goto your facebook app: https://developers.facebook.com/apps
	* Set the "App Domains" to YOUAZURESITE.azurewebsites.net
	* Click "Website with Facebook Login" and set to http://YOUAZURESITE.azurewebsites.net/
	* Click "App on facebook" and set canvas url to http://YOUAZURESITE.azurewebsites.net/ and 
		secure canvas url to https://YOUAZURESITE.azurewebsites.net/
11. In the azure portal goto your website and download your publish profile on the dashboard
12. In visual studio goto Build > Publish xxx > Import > publish
13. You can view the progress in the output window
14. A few minutes later your project should be deployed to azure
15. Now you must seed some initial data into the database to get access.
16. Connect to your Sql Azure Database server using SQL Server management studio
and run the following SQL (Substitute YOUR_FACEBOOK_ID and YOUR NAME. To lookup what your facebook is
go to this site http://findmyfacebookid.com/)



INSERT INTO [dbo].[QuestionTypeLookup]([type]) VALUES('OpenEnded')
INSERT INTO [dbo].[QuestionTypeLookup]([type]) VALUES('Gps')
INSERT INTO [dbo].[QuestionTypeLookup]([type]) VALUES('SingleAnswer')
INSERT INTO [dbo].[QuestionTypeLookup]([type]) VALUES('MultipleChoice')
INSERT INTO [dbo].[QuestionTypeLookup]([type]) VALUES('Signature')

INSERT INTO [dbo].[Orgs]([orgName]) VALUES('World Survey Kit')

INSERT INTO [dbo].[Users]([fbUserId],[name],[isSystemAdmin],[defaultOrg])
VALUES('YOUR_FACEBOOK_ID', 'YOUR NAME', 1, 1)
           
INSERT INTO [dbo].[OrgUserMappings]([isOrgAdmin],[orgsId],[usersId]) VALUES(1,1,1)





For deployment to Phonegap Build (iPhone, Android)
--------------------------------------------------
1. Before you deploy the HTML5, CSS, and Javascript to PhoneGap build, make sure you have your config.js configured
properly. You will have to create separate PhoneGap Build projects for each platform.

2. Your config.js file should look similar to this below (Substitute SITENAME for the name of your site and 123456789 for your Facebook app id):

	*For Android Deployments*
	App.platform =  "Android";
	App.rootUrl = "http://SITENAME.azurewebsites.net";
	App.fbid = "123456789";

	*For iPhone Deployments*
	App.platform =  "iPhone";
	App.rootUrl = "http://SITENAME.azurewebsites.net";
	App.fbid = "123456789";

3. You may need to configure a few more things for Facebook integration. 
Refer to this link to set up Facebook integrations and certificates https://github.com/phonegap-build/FacebookConnect
Remember to click "native android app" and input package (com.DOMAIN.APPNAME) , class (com.DOMAIN.APPNAME.MainActivity), and key hashes, enable facebook login

Edit the following in the config.xml to get facebook login and PhoneGap to work with your values.

<widget xmlns     = "http://www.w3.org/ns/widgets"
        xmlns:gap = "http://phonegap.com/ns/1.0"
        id        = "com.YOURAPPNAME"
        version   = "1.0.0">

<gap:plugin name="com.phonegap.plugins.facebookconnect">
      <param name="APP_ID" value="123456789" />
      <param name="APP_NAME" value="YOURFACEBOOKAPPNAME" />
</gap:plugin>



4. The next steps show how to package a Phonegap app then upload your web assets - a ZIP file of HTML, CSS and JavaScript files 
to PhoneGap Build. PhoneGap will compile and package the app for you. 
In minutes, you’ll receive the download URLs for all mobile platforms. Remember this PhoneGap build will only 
work for the platform you specified in config.js. To target other mobile platforms this process must be repeated
and a separate PhoneGap Build App created. (You could always change this and configure App.platform by "User Agent String
Sniffing", but that could be difficult and messy to do)

Create a folder called assets on your desktop, within that folder create the following folder structure. Include a copy of all the 
files below where you see the *

<pre>
```
|_assets 
  |_src 
  | |_android 
  | | |_ConnectPlugin.java 
  | | |_facebook/*
  | |_ios 
  |   |_FacebookConnectPlugin.m 
  |   |_FacebookConnectPlugin.h 
  |   |_facebook/*
  |_www 
  |  |_index.html 
  |  |_js/* 
  |  |_css/* 
  |  |_images/* 
  |  |_src/* 
  |  |_config.xml 	
```
</pre>

5. Zip the asset folder and upload to https://build.phonegap.com/apps
6. Download your PhoneGap Build app from the website and enjoy!
7. You may need to have a key created for your app to deploy and work with Facebook authentication. 
Use these instructions on creating a key for your specific platform https://build.phonegap.com/docs/config-signing-android.

* For example this is how you would create a key in Android (Substitute YOURAPPNAME for your phonegap app name it should be like com.YOURAPPNAME):
	* keytool -genkey -v -keystore MYKEY.keystore -alias YOURAPPNAME -keyalg RSA -keysize 2048 -validity 10000

* Remember to copy your key to your facebook app for your specific platform. For example, Android:
	* Package Name: com.YOURAPPNAME
	* Class Name: com.YOURAPPNAME.MainActivity
	* Key Hashes: YOURFACEBOOKKEYHASH
	* Facebook Login: Enabled
	* Deep Linking: Enabled

YOURFACEBOOKKEYHASH above can be created in android like this:
	* keytool -exportcert -alias YOURAPPNAME -keystore MYKEY.keystore | openssl sha1 -binary | openssl base64


Misc.
======

Hidden routes in the web application:

* http://localhost:800/index.html#admin - system admin page to add organizations and delete users, locked down to system admins
* http://localhost:800/index.html#coll - shows a view of the HTML5 localStorage
* http://localhost:800/help API documentation




TODO - Short Term
=================
* change the system admins to only be changeable by me
* create a first time logged in tutorial
* add a share via email, link, embed


TODO - Long Term
================		
* Make everything pageable and odata queryable
* Change the authenication model for a survey
	* anonymous, facebook authenicated, pin
* Make charting, graphing and analytics using d3.js http://d3js.org/ 
* Share via qr code
* Add user dropdown, ajax autocomplete
* fix the mobile export to excel link
* fix signature pad on tablet (onclick it disappears but still records)



Completed
=========
* 7/30/2013 - fixed the senerio when you go back to survey history and edit an already filled out survey it 
should auto sync when you click save and finish later.
* added import functionality
* fixed paging issue #home view survey history, show 25, then page the rest
* fixed edit issue added ?edit to every row, so you are actually loading and editing server data
	* make all online report edit goto ?edit and in ?edit make sure updated_at field is changed
		* go to all Go* views and add updated_at field on save to current datetime
* fixed the edge case when you uncheck everything in a response and post back, nothing actaully posts back to clear out response
	* added previousResponse bool to the GoOptionsView
* fixed very first load of page issue (update history count and history page when data finally becomes available)
	* home route is being launched way too early home view is corrupt, why does FileInstace deferrerd seem not to work? Because its a Backbone Offline Fetch and return success instantly
	Change to check for App.fileInstanceCollection.deferred (A Server side traditional backbone fetch) on first load ever
* fixed duplicate App.orgName in the config.js file to App.organizationsName since we use App.orgName elsewhere in the app
* fixed the pagination issues in the history page

* open to all facebook users
	1. Hit Auth Filter
		- if FB Auth
			- if in db contine
			- else add to db, add to an org called by there name





