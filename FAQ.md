#FAQ
###Setup/Getting Started
**I'm new to Office Add-ins, where do I start?**

If you have never developed an Office Web Add-in before we recommend you to visit our [Get Started](http://dev.office.com/getting-started/addins) experience to understand the basics. Afterwards you can then play with Add-in commands which is a new feature that is in preview currently by following the steps outlined in the [readme](https://github.com/OfficeDev/Office-Add-in-Commands-Samples/blob/master/README.md). 

**How do I get the latest Office build needed to try the feature?**

Please see the [readme](https://github.com/OfficeDev/Office-Add-in-Commands-Samples/blob/master/README.md). The very first step explains how to get the build and activate the feature. 

**Where can I find the manifest reference and samples?**

Please see the [readme](https://github.com/OfficeDev/Office-Add-in-Commands-Samples/blob/master/README.md).  


###Debug: Buttons not showing
**I'm using Visual Studio F5 to deploy my add-in but I don't see any buttons on the Ribbon, why?**

Deploying via Visual Studio F5 is not yet supported on the preview. You have to use a network share per instructions on the [readme](https://github.com/OfficeDev/Office-Add-in-Commands-Samples/blob/master/README.md). 

**I deployed the Add-in manifest using a SharePoint App Catalog, which shows as "My organization" in the insertion dialog and I don't see buttons on the Ribbon, Why?**

During the preview only Network share (which appears as "Shared Folder") is supported. Make sure to hit refresh to trigger loading of your Add-ins

**Its really hard to debug why a button doesn't show up, what can I do?**

1. Start with samples
1. Do small tweaks and validate you manifest using the [XSDs](https://github.com/OfficeDev/Office-Add-in-Commands-Samples/tree/master/Tools/XSD)
1. Double check the reference documentation.  
1. Verify that in your VersionOverrides you are targeting the correct host. Sometimes folks assume that the hosts declared on the top of the manifest
2. Verify that you are using the correct Tab element. OfficeTab is to add commands to an existing Office Tab and requires that you pass an existing Id. CustomTab is to create a new tab. Consult the reference documentation for more details. 

In the future we will have better tooling support

###Debug: ExecuteFunction not showing

**ExecuteFunction isn't working, what are the most common issues?**

1. Check that the FunctionFile is loading properly, use Fiddler to see if a network call is being issued. 
2. Ensure you are using HTTPS and that the certificate doesn't give any warnings as this would prevent the FunctionFile from loading. If you use a local server sometimes using the IP will warn but using localhost would work fine. 
3. Make sure you manifest has the correct resource ID and that the URL for your function file is correct
4. Ensure that the name of your FunctionFile in the manifest is the same as your function in javascript. 
5. Verify that the function is defined in the GLOBAL scope for javascript. A function defined inside a different scope won't work. 

###Debug: Misc

**Will users still have to go to the insertion dialog to make the add-ins show their buttons?**

After we GA the feature later this year, once your add-in is installed it will have its buttons permanently displayed on the Ribbon. We will have more documentation about deployment options for Add-ins which will include the public store and private catalogs for organizational scenarios. 

**I found an issue, I have a question or I have a feature request, where do I log that?**

During the preview, feel free to use the [Issues](https://github.com/OfficeDev/Office-Add-in-Commands-Samples/issues) of this repo to log. 

