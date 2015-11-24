var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ODSampleData;
(function (ODSampleData) {
    var ODataUX;
    (function (ODataUX) {
        function initialize() {
            UX.Helpers.occupiesLeftHeightOfParent($(".panel-body"));
            DataFeedListPage.initialize();
            DataFeedDetailPage.initialize();
            ODataUX.DiffPage.DiffPageDelegator.initialize();
        }
        ODataUX.initialize = initialize;
        ODataUX.buttonId = 0;
        function onDataLoaded() {
            checkExistingTable(function () {
                $(".loading").hide();
            });
            detailProductsDataFeed();
            var url = window.location.toString();
            if (url.charAt(url.indexOf('?') + 1) == '1') {
                if (ODataUX.buttonId == 1) {
                    ODSampleData.DataFeed.ActiveDataFeed.importToExcelAsync(function () {
                    });
                }
                else if (ODataUX.buttonId == 2) {
                    ODSampleData.DataFeed.ActiveDataFeed.readODataDataFromServer(function () {
                        ODSampleData.DataFeed.ActiveDataFeed.readExcelData(function () {
                            ODSampleData.Diff.differentiate(ODSampleData.DataFeed.ActiveDataFeed);
                            ODSampleData.uploadChangeToOData(DataFeedDetailPage.enableMainButtons);
                        }, DataFeedDetailPage.enableMainButtons);
                    }, DataFeedDetailPage.enableMainButtons);
                    ODataUX.DiffPage.DiffPageDelegator.Instance.hideDiffPage();
                }
            }
            else {
                $(".panel-heading").hide();
                $(".loading").hide();
                $("#list-page").hide();
                $("#detail-page").hide();
                ODSampleData.DataFeed.ActiveDataFeed.readExcelData(function () {
                    ODSampleData.DataFeed.ActiveDataFeed.readODataDataFromServer(function () {
                        ODataUX.DiffPage.DiffPageDelegator.Instance.showDiffPage();
                        DataFeedDetailPage.enableMainButtons();
                    }, DataFeedDetailPage.enableMainButtons);
                }, DataFeedDetailPage.enableMainButtons);
            }
        }
        ODataUX.onDataLoaded = onDataLoaded;
        function detailProductsDataFeed() {
            var list = ODSampleData.dataFeedManager.getAllData().filter(function (dataFeed) { return dataFeed.Name === "Products"; });
            if (list.length > 0) {
                list[0].markAsActive();
            }
        }
        function checkExistingTable(callback) {
            if (window["Office"]) {
                ODSampleData.DataHelper.GetExistingTables(function (result) {
                    var list = ODSampleData.dataFeedManager.getAllData().filter(function (dataFeed) { return dataFeed.Name === result[0]; });
                    if (list.length > 0) {
                        list[0].markAsActive();
                    }
                    callback();
                });
            }
            else {
                callback();
            }
        }
        var DataFeedListPage;
        (function (DataFeedListPage) {
            var dataFeedList;
            function initialize() {
                dataFeedList = new DataFeedList();
                ODSampleData.dataFeedManager.addObserver(dataFeedList);
                Search.initialize();
                addCatalogButton("Favorites", function () { return true; }).addClass("active");
                addCatalogButtonWithNames("Contract", [
                    "PersonDetails",
                    "Persons",
                ]);
                addCatalogButtonWithNames("Forecast", [
                    "Advertisements",
                    "Categories",
                    "ProductDetails",
                    "Products",
                    "Suppliers",
                ]);
                dataFeedList.setFilter(function () { return true; });
                ODSampleData.dataFeedManager.updateObserver(dataFeedList);
                initializeConnectButton();
                UX.Helpers.occupiesLeftHeightOfParent($("#data-source-list"));
            }
            DataFeedListPage.initialize = initialize;
            function switchToDataListPage() {
                ODataUX.DiffPage.DiffPageDelegator.Instance.hideDiffPage();
                UX.Helpers.switchToMode("mode-list");
            }
            DataFeedListPage.switchToDataListPage = switchToDataListPage;
            function addCatalogButtonWithNames(innerText, feedNames) {
                return addCatalogButton(innerText, function (dataFeed) {
                    return 0 <= feedNames.indexOf(dataFeed.Name);
                });
            }
            function addCatalogButton(innerText, filter) {
                var container = $("#catalog-button-container");
                var newButton = $('<button type="button" class="catalog-button text-size-middle link-button"></button>');
                newButton.text(innerText);
                container.append(newButton);
                newButton.click(function () {
                    Search.stop();
                    dataFeedList.setFilter(filter);
                    ODSampleData.dataFeedManager.updateObserver(dataFeedList);
                    container.children().removeClass("active");
                    newButton.addClass("active");
                });
                var counter = new Model.ItemCounter(filter, function (count) {
                    if (count > 0) {
                        newButton.show();
                    }
                    else {
                        newButton.hide();
                    }
                    $(window).resize();
                });
                ODSampleData.dataFeedManager.addObserver(counter);
                return newButton;
            }
            function initializeConnectButton() {
                var connectButton = $("#connect-data-feed");
                connectButton.click(function () {
                    ODSampleData.DataFeed.ActiveDataFeed.importToExcelAsync(function () {
                        DataFeedDetailPage.switchToDetailPage();
                    });
                });
                var selectedCounter = new Model.ItemCounter(function (sourceFeed) { return sourceFeed.Active; }, function (count) {
                    connectButton.prop("disabled", count !== 1);
                });
                ODSampleData.dataFeedManager.addObserver(selectedCounter);
            }
            var Search;
            (function (Search) {
                var timeoutId;
                var lastCatalogFilter;
                var lastSearchFilter;
                function initialize() {
                    var search = $("#search");
                    search.on("keydown past input", function () {
                        clearTimeout(timeoutId);
                        timeoutId = setTimeout(doSearch, 500);
                    });
                    search.keydown(function (event) {
                        if (event.keyCode === 27) {
                            stop();
                        }
                    });
                }
                Search.initialize = initialize;
                function stop() {
                    $("#search").val("");
                    doSearch();
                }
                Search.stop = stop;
                function doSearch() {
                    var search = $("#search");
                    var lastFilter = dataFeedList.getFilter();
                    var text = search.val();
                    text = text.trim().toLocaleLowerCase();
                    if (!text) {
                        if (lastCatalogFilter) {
                            dataFeedList.setFilter(lastCatalogFilter);
                            ODSampleData.dataFeedManager.updateObserver(dataFeedList);
                            lastCatalogFilter = undefined;
                            $("#catalog-button-container").show();
                        }
                    }
                    else {
                        if (lastSearchFilter !== lastFilter) {
                            lastCatalogFilter = lastFilter;
                        }
                        lastSearchFilter = function (dataFeed) {
                            return 0 <= dataFeed.Name.toLocaleLowerCase().indexOf(text);
                        };
                        dataFeedList.setFilter(lastSearchFilter);
                        ODSampleData.dataFeedManager.updateObserver(dataFeedList);
                        $("#catalog-button-container").hide();
                    }
                    $(window).resize();
                    clearTimeout(timeoutId);
                }
            })(Search || (Search = {}));
            var DataFeedList = (function (_super) {
                __extends(DataFeedList, _super);
                function DataFeedList() {
                    _super.call(this, new DataFeedArtist(), $("#data-source-list"), function (a, b) { return a.Name.localeCompare(b.Name); });
                }
                DataFeedList.prototype.onUnobserved = function (dataFeed) {
                    if (dataFeed) {
                        dataFeed.markAsUnactive();
                        _super.prototype.onUnobserved.call(this, dataFeed);
                    }
                };
                return DataFeedList;
            })(UX.List);
            var DataFeedArtist = (function () {
                function DataFeedArtist() {
                }
                DataFeedArtist.prototype.newJQuery = function (dataFeed) {
                    var newElement = UX.Helpers.getTemplateWithName("data-feed-card");
                    newElement.click(function (event) {
                        dataFeed.markAsActive();
                    });
                    var namedElements = UX.Helpers.getNamedElementMapOf(newElement);
                    var detail = namedElements["detail"];
                    var detailButton = namedElements["detail-button"];
                    var detailButtonText = namedElements["detail-button-text"];
                    var detailButtonIcon = namedElements["detail-button-icon"];
                    var detailButtonBehavior;
                    var hideDetail = function () {
                        detail.hide(0.4);
                        detailButtonText.text("Show more");
                        detailButtonIcon.addClass("glyphicon-menu-down");
                        detailButtonIcon.removeClass("glyphicon-menu-up");
                        detailButtonBehavior = showDetail;
                    };
                    var showDetail = function () {
                        detail.show(0.4);
                        detailButtonText.text("Show less");
                        detailButtonIcon.addClass("glyphicon-menu-up");
                        detailButtonIcon.removeClass("glyphicon-menu-down");
                        detailButtonBehavior = hideDetail;
                    };
                    hideDetail();
                    detailButton.click(function (event) {
                        detailButtonBehavior();
                        event.stopImmediatePropagation();
                    });
                    this.refresh(newElement, dataFeed);
                    return newElement;
                };
                DataFeedArtist.prototype.refresh = function (jqElement, dataFeed) {
                    if (dataFeed.Active) {
                        jqElement.addClass("active");
                    }
                    else {
                        jqElement.removeClass("active");
                    }
                    var namedElements = UX.Helpers.getNamedElementMapOf(jqElement);
                    namedElements["name"].text(dataFeed.Name);
                    if (!dataFeed.LastSyncTime) {
                        namedElements["last-sync-time"].text("Not synced");
                    }
                    else if (dataFeed.LastSyncTime.toDateString() === new Date().toDateString()) {
                        namedElements["last-sync-time"].text(dataFeed.LastSyncTime.toLocaleTimeString());
                    }
                    else {
                        namedElements["last-sync-time"].text(dataFeed.LastSyncTime.toLocaleDateString());
                    }
                    var columns = namedElements["columns"];
                    columns.html("");
                    dataFeed.Columns.forEach(function (column) {
                        var container = $('<span class="column-name"/>');
                        container.click(function (event) {
                            column.ShowInExcel = !column.ShowInExcel;
                        });
                        var checkbox = $('<input type="checkbox" onclick="return false;" />');
                        checkbox.prop("checked", column.ShowInExcel);
                        var span = $("<span/>");
                        span.text(column.Name);
                        container.append(checkbox, span);
                        columns.append(container);
                    });
                };
                return DataFeedArtist;
            })();
        })(DataFeedListPage || (DataFeedListPage = {}));
        var DataFeedDetailPage;
        (function (DataFeedDetailPage) {
            function initialize() {
                $("#import-data-feed").click(function () {
                    disableMainButtons();
                    ODSampleData.DataFeed.ActiveDataFeed.importToExcelAsync(enableMainButtons);
                });
                $("#save-to-odata").click(function () {
                    disableMainButtons();
                    ODSampleData.DataFeed.ActiveDataFeed.readODataDataFromServer(function () {
                        ODSampleData.DataFeed.ActiveDataFeed.readExcelData(function () {
                            ODSampleData.Diff.differentiate(ODSampleData.DataFeed.ActiveDataFeed);
                            ODSampleData.uploadChangeToOData(enableMainButtons);
                        }, enableMainButtons);
                    }, enableMainButtons);
                });
                $("#diff-data-feed").click(function () {
                    disableMainButtons();
                    ODSampleData.DataFeed.ActiveDataFeed.readExcelData(function () {
                        ODSampleData.DataFeed.ActiveDataFeed.readODataDataFromServer(function () {
                            ODataUX.DiffPage.DiffPageDelegator.Instance.showDiffPage();
                            enableMainButtons();
                        }, enableMainButtons);
                    }, enableMainButtons);
                });
            }
            DataFeedDetailPage.initialize = initialize;
            function switchToDetailPage() {
                ODataUX.DiffPage.DiffPageDelegator.Instance.hideDiffPage();
                $("#detail-source-name").text(ODSampleData.DataFeed.ActiveDataFeed.Name);
                var lastSyncTime = (ODSampleData.DataFeed.ActiveDataFeed.LastSyncTime === undefined) ? "Unknown" : ODSampleData.DataFeed.ActiveDataFeed.LastSyncTime.toLocaleString();
                $("#detail-source-last-sync-time").text(lastSyncTime);
                ODSampleData.DataHelper.EnsureEventHandlerToBinding(ODSampleData.DataFeed.ActiveDataFeed.Name, Office.EventType.BindingSelectionChanged, ODSampleData.ExtendTable.ExpandTableButtonHandler);
                UX.Helpers.switchToMode("mode-detail");
            }
            DataFeedDetailPage.switchToDetailPage = switchToDetailPage;
            function enableMainButtons() {
                $("#import-data-feed").prop("disabled", false);
                $("#save-to-odata").prop("disabled", false);
                $("#diff-data-feed").prop("disabled", false);
            }
            DataFeedDetailPage.enableMainButtons = enableMainButtons;
            function disableMainButtons() {
                $("#import-data-feed").prop("disabled", true);
                $("#save-to-odata").prop("disabled", true);
                $("#diff-data-feed").prop("disabled", true);
            }
            DataFeedDetailPage.disableMainButtons = disableMainButtons;
        })(DataFeedDetailPage = ODataUX.DataFeedDetailPage || (ODataUX.DataFeedDetailPage = {}));
        // 1. This UILess function can be triggered by 'GetData' button (id=Contoso.Button1Id1) or context menu 'GetData' button (id=Contoso.TestMenu1)
        // 2. The first clicking for any UILess function bound ribbon button or context menu item triggers office's initialize() firstly. Other clickings including other buttons don't trigger the initialize() again.
        // 3. The UILess processing is invoked when the user clicks the bound ribbon button or context menu item 
        // 4. args.completed() is needed at the time the UILess processing is completed, otherwise the other UILess processing would not be invoked until 300s timeout.
        // 5. These UILess processings include all other buttons/contextmenus bound processings.
        function getButton(args) {
            if (ODataUX.buttonId != 0) {
                ODataUX.buttonId = 1;
                ODSampleData.onOfficeReady();
            }
            ODataUX.buttonId = 1;
            args.completed();
        }
        ODataUX.getButton = getButton;
        // 1. This UILess function can be triggered by 'SaveData' button (id=Contoso.Button2Id1)
        // 2. The other comments are same as getButton function
        function saveButton(args) {
            if (ODataUX.buttonId != 0) {
                ODataUX.buttonId = 2;
                ODSampleData.onOfficeReady();
            }
            ODataUX.buttonId = 2;
            args.completed();
        }
        ODataUX.saveButton = saveButton;
    })(ODataUX = ODSampleData.ODataUX || (ODSampleData.ODataUX = {}));
})(ODSampleData || (ODSampleData = {}));
//# sourceMappingURL=UX.js.map