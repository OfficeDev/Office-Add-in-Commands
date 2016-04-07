
# Office Add-in Commands Samples 

##Overview
Add-in commands enable developers to extend the Office user interface such as the Office Ribbon to create awesome, efficient to use add-ins. Watch this [channel9 video](https://channel9.msdn.com/Events/Visual-Studio/Connect-event-2015/316) for a complete overview. The examples in this repo show you how to use add-in commands in Excel, Word and PowerPoint add-ins. If you are looking for information about commands for **Outlook** head to [http://dev.outlook.com](http://dev.outlook.com)
 
Here is how the samples look when running: 

###Custom Tab (Simple Example)
![](https://i.imgur.com/HRCbRFO.png)

###Excel
![](http://i.imgur.com/OsRIk5E.png)

###Word
Existing Tab
![](http://i.imgur.com/wrA6R3T.png)

###PowerPoint
![](http://i.imgur.com/jwkkNsQ.png)


## Quick Start
### Step 1. Setup your environment


- **Office Desktop**: Ensure that you have the latest version of Office installed. Add-in commands require build **16.0.6769.0000** or higher. Learn how to [Install the latest version of Office applications](http://aka.ms/latestoffice). 
 
- **Office Online**: There is no additional setup. 

### Step 2. Create and validate your manifest
We strongly recommend you to use one of our sample manifests as a starting point, the [Simple example](https://github.com/OfficeDev/Office-Add-in-Commands-Samples/tree/master/Simple) is a good one to get going. Once you make it work then you can start making small modifications and test your changes often. If you make modifications, use the [Manifest reference](https://msdn.microsoft.com/en-us/library/mt621545) as a guide. You can also validate your xml using the following **[XSDs](https://github.com/OfficeDev/Office-Add-in-Commands-Samples/tree/master/Tools/XSD)**

You can also use the latest Visual Studio Tools to create and debug your add-in. See next step. 

### Step 3. Deploy add-in manifest and test the add-in
To test your add-in you must register it with Office. Two methods are currently supported
####Sideload directly to the client
- **Office Desktop**. Sideload you add-in via a [network share](https://msdn.microsoft.com/EN-US/library/office/fp123503.aspx). 
	- Once side loaded you have to go to `Insert>My Add-ins>Shared Folder` and click the `Refresh` button to ensure the Add-in shows. Do this any time you need to refresh your Ribbon.
- **Office Online**. Open the Add-ins dialog via `Insert>Office Add-ins` then select `[Manage My Add-ins]>Upload My Add-in` and upload the manifest file you want to test. To remove a sideloaded add-in you have to [clear your HTML LocalStorage](http://superuser.com/questions/519628/clear-html5-local-storage-on-a-specific-page) 

####Visual Studio F5 (Preview)
Support for Visual Studio F5 is in preview. Follow these steps to enable it. 

-  Make sure you have the latest [Visual Studio tools](https://www.visualstudio.com/en-us/features/office-tools-vs.aspx) 
- Enable F5 support for commands by running this [registry key](https://github.com/OfficeDev/Office-Add-in-Commands-Samples/blob/master/Tools/AddInCommandsUndark/EnableCmds_F5_VS.zip?raw=true)
- Apply this [workaround](tools/VSCacheWorkaround.md) to fix an issue with commands caching


## Documentation
- [FAQ](https://github.com/OfficeDev/Office-Add-in-Commands-Samples/blob/master/FAQ.md)
- [Manifest reference](https://msdn.microsoft.com/en-us/library/mt621545)



        
    
