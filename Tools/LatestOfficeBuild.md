# Install the latest version of Office 2016 applications #

New developer features, including those still in preview, are delivered first to subscribers that opt-in to get the latest builds of Office. Here are the steps to follow according to your subscription. 



Office 365 Home, Personal and University Subscribers, install the [Insiders Build](https://products.office.com/en-us/office-insider)

Office 365 Commercial customers, opt-in for First Release. The simplified steps to install the [First Release Build](http://aka.ms/froninsiders) are:

1.	Download the [Office 2016 Deployment Tool](http://www.microsoft.com/en-us/download/details.aspx?id=49117). 
2.	Run the tool, this will extract 2 files. **Setup.exe** and **configuration.xml**.
3.	Replace the configuration file with this [First Release Configuration File](https://raw.githubusercontent.com/OfficeDev/Office-Add-in-Commands-Samples/master/Tools/FirstReleaseConfig/configuration.xml).
4.	From an elevated command prompt (Run as admin) run:
    `setup.exe /configuration configuration.xml`

Once the installation process completes you will have the latest Office 2016 applications installed. You can verify the build installed by going to File>Account from any of the Office applications. 