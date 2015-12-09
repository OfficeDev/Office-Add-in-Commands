
# Office Add-in Commands Samples 

##Overview
Add-in commands enable developers to extend the Office user interface such as the Office Ribbon to create awesome, efficient to use add-ins. Watch this [channel9 video](https://channel9.msdn.com/Events/Visual-Studio/Connect-event-2015/316) for a complete overview. The examples in this repo show you how to use add-in commands in Excel and Word add-ins. 

**Important**: Add-in commands are currently in **developer preview** for **Excel** and **Word** with PowerPoint coming next year. If you are looking for information about the already released Add-in commands for **Outlook** head to [http://dev.outlook.com](http://dev.outlook.com)
 
Here is how the samples look when running: 


###Excel
![](http://i.imgur.com/OsRIk5E.png)

###Word
![](http://i.imgur.com/wrA6R3T.png)



## Step by step instructions
### Step 1. Setup your environment


- **Office Desktop**: Ensure that you have the latest version of Office installed. Add-in commands requires build **16.0.6366.0000** or higher. Learn how to [Install the latest version of Office applications](http://aka.ms/latestoffice). 
	- Once you have the latest build installed make sure to download, unzip and run this [Registry key ](https://github.com/OfficeDev/Office-Add-in-Commands-Samples/raw/master/Tools/AddInCommandsUndark/EnableAppCmdXLWD.zip)on your machine to activate the feature. 
- Office Online (Coming soon...Excel Only at the moment): There is no additional setup. 

### Step 2. Create your manifest
We strongly recommend you to use one of our sample manifests as a starting point ([Excel](https://github.com/OfficeDev/Office-Add-in-Commands-Samples/blob/master/Excel/Manifest/ExcelAddinWithCommandsOnDataTab.xml), [Word](https://github.com/OfficeDev/Office-Add-in-Commands-Samples/blob/master/Word/manifest/CitationSample.xml)), make small modifications (e.g. make them point to your add-in instead, use your icons) and test often. 
 

### Step 3. Deploy add-in manifest and test the add-in
During the developer preview the only alternative to test your add-in is to sideload it.


- **Office Desktop**. Sideload you add-in via a [network share](https://msdn.microsoft.com/EN-US/library/office/fp123503.aspx). 
	- Once side loaded you have to go to `Insert>My Add-ins` and click the `Refresh` button to ensure the Add-in shows. Do this any time you need to refresh your Ribbon.
- Office Online clients (Coming soon). Simply go to `Insert Tab>Office Add-ins>Upload Add-in`. The add-in will be displayed for that session only. 

Full documentation and known issues are on the way and will be published soon.  



        
    
