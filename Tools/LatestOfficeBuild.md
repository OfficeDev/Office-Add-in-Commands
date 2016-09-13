# Install the latest version of Office 2016 applications #

New developer features, including those still in preview, are delivered first to subscribers that opt-in to get the latest builds of Office. Here are the steps to follow according to your subscription. 



Office 365 Home, Personal and University Subscribers:[Insiders Program](https://products.office.com/en-us/office-insider)

Office 365 Commercial customers: [First Release Build](https://support.office.com/en-us/article/Install-the-First-Release-build-for-Office-365-for-business-customers-4dd8ba40-73c0-4468-b778-c7b744d03ead?ui=en-US&rs=en-US&ad=US)

For either program, the build is the same. To deploy it **follow these simplified steps**: 

1.	Download the [Office 2016 Deployment Tool](http://www.microsoft.com/en-us/download/details.aspx?id=49117). 
2.	Run the tool, this will extract 2 files. **Setup.exe** and **configuration.xml**.
3.	Replace the configuration file with this [First Release Configuration File](https://raw.githubusercontent.com/OfficeDev/Office-Add-in-Commands-Samples/master/Tools/FirstReleaseConfig/configuration.xml). If you really want to be on the bleeding age set the channel to "InsidersFast". Make sure you read the details of the program on the links above.
4.	From an elevated command prompt (Run as admin) run:
    `setup.exe /configure configuration.xml`

Once the installation process completes you will have the latest Office 2016 applications installed. You can verify the build installed by going to File>Account from any of the Office applications. 
