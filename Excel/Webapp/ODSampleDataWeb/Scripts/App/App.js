var ODSampleData;
(function (ODSampleData) {
    ODSampleData.dataFeedManager;
    ODSampleData.hostType;
    ODSampleData.config;
    function onDocumentReady() {
        $.getJSON("../config.json", { DataFeedDefaultHeaders: [] }, function (config) {
            ODSampleData.config = config;
            if (window["Office"]) {
                Office.initialize = function (reason) {
                    $('body').append('<div id="notification-message">' +
                        '<div class="padding">' +
                        '<div id="notification-message-close"></div>' +
                        '<div id="notification-message-header"></div>' +
                        '<div id="notification-message-body"></div>' +
                        '</div>' +
                        '</div>');
                    $('#notification-message-close').click(function () {
                        $('#notification-message').hide();
                    });
                    PageMethods.GetHostType(function (value) { ODSampleData.hostType = value; onOfficeReady(); });
                };
            }
            else {
                PageMethods.GetHostType(function (value) { ODSampleData.hostType = value; onOfficeReady(); });
            }
        });
    }
    function onOfficeReady() {
        initialize();
    }
    ODSampleData.onOfficeReady = onOfficeReady;
    function initialize() {
        ODSampleData.dataFeedManager = new Model.DataManager();
        ODSampleData.ODataUX.initialize();
        ODSampleData.DataFeed.initializeAll(ODSampleData.ODataUX.onDataLoaded);
    }
    ODSampleData.initialize = initialize;
    function showNotification(header, text) {
        $('#notification-message-header').text(header);
        $('#notification-message-body').text(text);
        $('#notification-message').slideDown('fast');
    }
    ODSampleData.showNotification = showNotification;
    $(document).ready(onDocumentReady);
})(ODSampleData || (ODSampleData = {}));
//# sourceMappingURL=App.js.map