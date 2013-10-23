md -Path ~\Desktop\PhoneGapBuildApp
md -Path ~\Desktop\PhoneGapBuildApp\src
md -Path ~\Desktop\PhoneGapBuildApp\www\js
md -Path ~\Desktop\PhoneGapBuildApp\www\css
md -Path ~\Desktop\PhoneGapBuildApp\www\images
Copy-Item ..\..\src\* ~\Desktop\PhoneGapBuildApp\src -recurse
Copy-Item ..\..\index.html ~\Desktop\PhoneGapBuildApp\www
Copy-Item ..\..\config.xml ~\Desktop\PhoneGapBuildApp\www
Copy-Item ..\..\js ~\Desktop\PhoneGapBuildApp\www -recurse
Copy-Item ..\..\css ~\Desktop\PhoneGapBuildApp\www -recurse
Copy-Item ..\..\images ~\Desktop\PhoneGapBuildApp\www -recurse
Copy-Item config.js ~\Desktop\PhoneGapBuildApp\www\js