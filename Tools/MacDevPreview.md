# Developer Preview: Add-in commands for Word, Excel, and PowerPoint on Office for Mac

You can use add-in commands to extend the Office UI, for example by adding new buttons on the ribbon. For more information about add-in commands, see [Add-in commands for Word, Excel, and PowerPoint](https://dev.office.com/docs/add-ins/design/add-in-commands). 

![Add-in commands on Mac](http://i.imgur.com/BhoOt4v.png)

This document explains how you can try the developer preview of add-in commands for Office for Mac (Word, Excel, and PowerPoint). We've released this preview to enable you to try the feature and give us feedback. Please do not use this developer release for your production solutions. 

Note: If you are looking for information about add-in commands for Outlook for Mac see this [post](https://blogs.msdn.microsoft.com/outlookformac/2016/12/07/add-ins-for-outlook-2016-for-mac-now-in-insider-fast/). 
## Prerequisites

### Get the Office Insider Fast build
To develop add-in commands for Office for Mac, you'll need to be running an Office Insiders (it needs to be insiders right now) build **15.30(161213)** or later. To get access to that build, opt in to the **Office Insiders Fast** builds. For details, see [Office Insider Fast for Mac Insiders](http://answers.microsoft.com/en-us/msoffice/forum/msoffice_officeinsider-mso_mac/announcing-office-insider-fast-for-mac-insiders/de603f73-3405-49d4-a6ee-d017773cb8a0). 


### Enable the commands developer preview
After you install the latest insiders fast build, you need to explicitly turn on the add-in commands developer preview.

On a **Terminal window**, execute the following scripts by typing each line, followed by **Enter**:

- For Excel: `defaults write com.microsoft.Excel EnableAddinCommandsDeveloperPreview 'YES'`
- For Word: `defaults write com.microsoft.Word EnableAddinCommandsDeveloperPreview 'YES'`
- For PowerPoint `defaults write com.microsoft.Powerpoint EnableAddinCommandsDeveloperPreview 'YES'`
	


## Develop your add-in
For details about how to develop your add-in, see the [add-in commands documentation](https://dev.office.com/docs/add-ins/outlook/manifests/define-add-in-commands) and [samples](https://github.com/OfficeDev/Office-Add-in-Commands-Samples). Because add-ins are multiplatform, your add-in will work across Office for Windows, Office Online (web), and Office for Mac with a single manifest file. 

After you define your add-in commands in your manifest, you can test it in Office for Mac. 

## Test your add-in
During the developer preview, **only add-ins that are deployed via sideloading are supported**. Add-ins deployed via any other means, such as the Office Store, are not supported. 

To test your add-in, see [sideload Office Add-ins on iPad and Mac](https://dev.office.com/docs/add-ins/testing/sideload-an-office-add-in-on-ipad-and-mac). 

## Release information
We expect to make add-in commands for Office for Mac generally available in the first half of 2017. For more information about feature and API availability for Office hosts and platforms, see [Office Add-in availability](https://dev.office.com/add-in-availability) page. 

## Questions and feedback
- If you have questions about or feedback on the files and samples in this repo, please post them on the repo Issues tab. 
- If you have product bugs or product-related questions, you can post them on [StackOverflow (tag with **office-js**)](http://stackoverflow.com/questions/tagged/office-js).
