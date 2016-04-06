# Visual Studio F5 Workaround for Commands Cache #

Builds 16.0.6769.0000 and older of Word, Excel and PowerPoint have a bug that prevents changes on the manifest to properly propagate to the Office clients. For example, changing the label of a button or adding new buttons on the manifest is not reflected when developers use F5. 

To workaround this issue follow these steps on each add-in project you work on:


1. Open your Project Properties, **Right click on the Project>Project properties>Build Events** in your Add-in project
2. Include this command line in the **Pre-build event** command line:
`del %LOCALAPPDATA%\Microsoft\Office\16.0\Wef\AppCommands /q`
![](http://i.imgur.com/05I2bAv.png)
1. Run F5. Changes will now be reflected. 

**Important**: The command line will remove any commands from the Ribbon, even those commands for add-ins that you installed from the store. Only use it on development environments. 
