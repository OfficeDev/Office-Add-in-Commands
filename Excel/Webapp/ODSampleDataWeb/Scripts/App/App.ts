
module ODSampleData {
    export var dataFeedManager: Model.DataManager;
    export var hostType: string;
    export var config: Configuration;

    function onDocumentReady() {
        $.getJSON("../config.json", { DataFeedDefaultHeaders: [] }, config => {
            ODSampleData.config = config;

            if (window["Office"]) {
                Office.initialize = function (reason) {
                    $('body').append(
                        '<div id="notification-message">' +
                        '<div class="padding">' +
                        '<div id="notification-message-close"></div>' +
                        '<div id="notification-message-header"></div>' +
                        '<div id="notification-message-body"></div>' +
                        '</div>' +
                        '</div>');

                    $('#notification-message-close').click(function () {
                        $('#notification-message').hide();
                    });

                    PageMethods.GetHostType((value) => { hostType = value; onOfficeReady(); });
                };
            } else {
                PageMethods.GetHostType((value) => { hostType = value; onOfficeReady(); });
            }
        });
    }

    export function onOfficeReady() {
        initialize();
    }

    export function initialize() {
        dataFeedManager = new Model.DataManager();

        ODataUX.initialize();
        DataFeed.initializeAll(ODataUX.onDataLoaded);
        
    }

    export function showNotification(header, text) {
        $('#notification-message-header').text(header);
        $('#notification-message-body').text(text);
        $('#notification-message').slideDown('fast');
    }

    $(document).ready(onDocumentReady);
}
