/// <reference path="/Scripts/FabricUI/MessageBanner.js" />


(function () {
    "use strict";

    var messageBanner;

    // The initialize function must be run each time a new page is loaded.
    Office.initialize = function (reason) {
        $(document).ready(function () {
            // Initialize the FabricUI notification mechanism and hide it
            var element = document.querySelector('.ms-MessageBanner');
            messageBanner = new fabric.MessageBanner(element);
            messageBanner.hideBanner();

            // If not using Word 2016, use fallback logic.
            if (!Office.context.requirements.isSetSupported('WordApi', '1.1')) {
                $("#template-description").text("This sample displays the selected text.");
                $('#button-text').text("Display!");
                $('#button-desc').text("Display the selected text");
                
                $('#highlight-button').click(
                    displaySelectedText);
                return;
            }

            $("#template-description").text("This sample show how to tag a document programmatically to auto-open a taskpane");

            $('#set-auto-open-text').text("Set auto-open ON");
            $('#set-auto-open-desc').text("Set auto-open setting ON");

            $('#set-auto-open-off-text').text("Set auto-open OFF");
            $('#set-auto-open-off-desc').text("Set auto-open setting OFF");
            

            $('#set-auto-open').click(
               setAutoOpenOn);

            $('#set-auto-open-off').click(
              setAutoOpenOff);
        });

    };

    function setAutoOpenOn()
    {
        Office.context.document.settings.set("Office.AutoShowTaskpaneWithDocument", true);     
        Office.context.document.settings.saveAsync();
        showNotification("Auto-open ON", "The auto-open setting has been set to ON on this document");
    }

    function setAutoOpenOff() {

        Office.context.document.settings.remove("Office.AutoShowTaskpaneWithDocument");
        Office.context.document.settings.saveAsync();
        showNotification("Auto-open OFF", "The auto-open setting has been set to OFF on this document");
    }


    // Helper function for displaying notifications
    function showNotification(header, content) {
        $("#notificationHeader").text(header);
        $("#notificationBody").text(content);
        messageBanner.showBanner();
        messageBanner.toggleExpansion();
    }
})();
