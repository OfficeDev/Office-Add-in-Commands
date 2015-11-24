module ODSampleData.ODataUX {
    export function initialize() {
        UX.Helpers.occupiesLeftHeightOfParent($(".panel-body"));

        DataFeedListPage.initialize();
        DataFeedDetailPage.initialize();
        DiffPage.DiffPageDelegator.initialize();
    }
    export var buttonId = 0;
    export function onDataLoaded() {
        checkExistingTable(() => {
            $(".loading").hide();
        });

        detailProductsDataFeed();
        var url = window.location.toString();
        if (url.charAt(url.indexOf('?') + 1) == '1') {
            if (buttonId == 1) {
                DataFeed.ActiveDataFeed.importToExcelAsync(() => {
                });
            }
            else if (buttonId == 2) {
                DataFeed.ActiveDataFeed.readODataDataFromServer(() => {
                    DataFeed.ActiveDataFeed.readExcelData(() => {
                        Diff.differentiate(DataFeed.ActiveDataFeed);
                        ODSampleData.uploadChangeToOData(DataFeedDetailPage.enableMainButtons);
                    }, DataFeedDetailPage.enableMainButtons);
                }, DataFeedDetailPage.enableMainButtons);
                DiffPage.DiffPageDelegator.Instance.hideDiffPage();
            }
        }
        else {
            $(".panel-heading").hide();
            $(".loading").hide();
            $("#list-page").hide();
            $("#detail-page").hide();
            DataFeed.ActiveDataFeed.readExcelData(() => {
                DataFeed.ActiveDataFeed.readODataDataFromServer(() => {
                    DiffPage.DiffPageDelegator.Instance.showDiffPage();
                    DataFeedDetailPage.enableMainButtons();
                }, DataFeedDetailPage.enableMainButtons);
            }, DataFeedDetailPage.enableMainButtons);
        }
    }

    function detailProductsDataFeed() {
        var list = (<DataFeed[]>dataFeedManager.getAllData()).filter(dataFeed => dataFeed.Name === "Products");
        if (list.length > 0) {
            list[0].markAsActive();
        }
    }

    function checkExistingTable(callback: () => void) {
        if (window["Office"]) {
            ODSampleData.DataHelper.GetExistingTables(result => {
                var list = (<DataFeed[]>dataFeedManager.getAllData()).filter(dataFeed => dataFeed.Name === result[0]);
                if (list.length > 0) {
                    list[0].markAsActive();
                }

                callback();
            });
        } else {
            callback();
        }
    }

    module DataFeedListPage {
        var dataFeedList: DataFeedList;

        export function initialize() {
            dataFeedList = new DataFeedList();
            dataFeedManager.addObserver(dataFeedList);
            Search.initialize();

            addCatalogButton("Favorites", () => true).addClass("active");

            addCatalogButtonWithNames(
                "Contract",
                [
                    "PersonDetails",
                    "Persons",
                ]);

            addCatalogButtonWithNames(
                "Forecast",
                [
                    "Advertisements",
                    "Categories",
                    "ProductDetails",
                    "Products",
                    "Suppliers",
                ]);

            dataFeedList.setFilter(() => true);
            dataFeedManager.updateObserver(dataFeedList);

            initializeConnectButton();

            UX.Helpers.occupiesLeftHeightOfParent($("#data-source-list"));
        }

        export function switchToDataListPage() {
            DiffPage.DiffPageDelegator.Instance.hideDiffPage();
            UX.Helpers.switchToMode("mode-list");
        }

        function addCatalogButtonWithNames(innerText: string, feedNames: string[]) {
            return addCatalogButton(
                innerText,
                (dataFeed: DataFeed) => {
                    return 0 <= feedNames.indexOf(dataFeed.Name);
                });
        }

        function addCatalogButton(innerText: string, filter: (dataFeed: DataFeed) => boolean) {
            var container = $("#catalog-button-container");
            var newButton = $('<button type="button" class="catalog-button text-size-middle link-button"></button>');
            newButton.text(innerText);
            container.append(newButton);

            newButton.click(() => {
                Search.stop();
                dataFeedList.setFilter(filter);
                dataFeedManager.updateObserver(dataFeedList);
                container.children().removeClass("active");
                newButton.addClass("active");
            });

            var counter = new Model.ItemCounter(filter, (count: number) => {
                if (count > 0) {
                    newButton.show();
                } else {
                    newButton.hide();
                }
                $(window).resize();
            });
            dataFeedManager.addObserver(counter);

            return newButton;
        }

        function initializeConnectButton() {
            var connectButton = $("#connect-data-feed");
            connectButton.click(() => {
                DataFeed.ActiveDataFeed.importToExcelAsync(() => {
                    DataFeedDetailPage.switchToDetailPage();
                });
            });

            var selectedCounter = new Model.ItemCounter(
                (sourceFeed: DataFeed) => sourceFeed.Active,
                (count: number) => {
                    connectButton.prop("disabled", count !== 1);
                });
            dataFeedManager.addObserver(selectedCounter);
        }

        module Search {
            var timeoutId: number;
            var lastCatalogFilter: (data: DataFeed) => boolean;
            var lastSearchFilter: (data: DataFeed) => boolean;

            export function initialize() {
                var search = $("#search");

                search.on("keydown past input", () => {
                    clearTimeout(timeoutId);
                    timeoutId = setTimeout(doSearch, 500);
                });

                search.keydown((event: JQueryKeyEventObject) => {
                    if (event.keyCode === 27) {
                        stop();
                    }
                });
            }

            export function stop() {
                $("#search").val("");
                doSearch();
            }

            function doSearch() {
                var search = $("#search");
                var lastFilter = dataFeedList.getFilter();
                var text: string = search.val();
                text = text.trim().toLocaleLowerCase();

                if (!text) {
                    if (lastCatalogFilter) {
                        dataFeedList.setFilter(lastCatalogFilter);
                        dataFeedManager.updateObserver(dataFeedList);
                        lastCatalogFilter = undefined;
                        $("#catalog-button-container").show();
                    }
                } else {
                    if (lastSearchFilter !== lastFilter) {
                        lastCatalogFilter = lastFilter;
                    }

                    lastSearchFilter = (dataFeed: DataFeed) => {
                        return 0 <= dataFeed.Name.toLocaleLowerCase().indexOf(text);
                    };

                    dataFeedList.setFilter(lastSearchFilter);
                    dataFeedManager.updateObserver(dataFeedList);
                    $("#catalog-button-container").hide();
                }

                $(window).resize();
                clearTimeout(timeoutId);
            }
        }

        class DataFeedList extends UX.List<DataFeed> {
            constructor() {
                super(new DataFeedArtist(),
                    $("#data-source-list"),
                    (a: DataFeed, b: DataFeed) => a.Name.localeCompare(b.Name));
            }

            public onUnobserved(dataFeed: DataFeed) {
                if (dataFeed) {
                    dataFeed.markAsUnactive();
                    super.onUnobserved(dataFeed);
                }
            }
        }

        class DataFeedArtist implements UX.IListItemArtist<DataFeed> {
            newJQuery(dataFeed: DataFeed): JQuery {
                var newElement = UX.Helpers.getTemplateWithName("data-feed-card");

                newElement.click((event: JQueryEventObject) => {
                    dataFeed.markAsActive();
                });

                var namedElements = UX.Helpers.getNamedElementMapOf(newElement);
                var detail = namedElements["detail"];
                var detailButton = namedElements["detail-button"];
                var detailButtonText = namedElements["detail-button-text"];
                var detailButtonIcon = namedElements["detail-button-icon"];
                var detailButtonBehavior: () => void;

                var hideDetail = () => {
                    detail.hide(0.4);

                    detailButtonText.text("Show more");
                    detailButtonIcon.addClass("glyphicon-menu-down");
                    detailButtonIcon.removeClass("glyphicon-menu-up");
                    detailButtonBehavior = showDetail;
                };

                var showDetail = () => {
                    detail.show(0.4);

                    detailButtonText.text("Show less");
                    detailButtonIcon.addClass("glyphicon-menu-up");
                    detailButtonIcon.removeClass("glyphicon-menu-down");
                    detailButtonBehavior = hideDetail;
                }

                hideDetail();

                detailButton.click((event: JQueryEventObject) => {
                    detailButtonBehavior();
                    event.stopImmediatePropagation();
                });

                this.refresh(newElement, dataFeed);
                return newElement;
            }

            refresh(jqElement: JQuery, dataFeed: DataFeed) {
                if (dataFeed.Active) {
                    jqElement.addClass("active");
                } else {
                    jqElement.removeClass("active");
                }

                var namedElements = UX.Helpers.getNamedElementMapOf(jqElement);
                namedElements["name"].text(dataFeed.Name);
                if (!dataFeed.LastSyncTime) {
                    namedElements["last-sync-time"].text("Not synced");
                } else if (dataFeed.LastSyncTime.toDateString() === new Date().toDateString()) {
                    namedElements["last-sync-time"].text(dataFeed.LastSyncTime.toLocaleTimeString());
                } else {
                    namedElements["last-sync-time"].text(dataFeed.LastSyncTime.toLocaleDateString());
                }

                var columns = namedElements["columns"];
                columns.html("");
                dataFeed.Columns.forEach(column => {
                    var container = $('<span class="column-name"/>');
                    container.click((event: JQueryEventObject) => {
                        column.ShowInExcel = !column.ShowInExcel;
                    });

                    var checkbox = $('<input type="checkbox" onclick="return false;" />');
                    checkbox.prop("checked", column.ShowInExcel);

                    var span = $("<span/>");
                    span.text(column.Name);

                    container.append(checkbox, span);
                    columns.append(container);
                });
            }
        }
    }

    export module DataFeedDetailPage {
        export function initialize() {
            $("#import-data-feed").click(() => {
                disableMainButtons();
                DataFeed.ActiveDataFeed.importToExcelAsync(enableMainButtons);
            });

            $("#save-to-odata").click(() => {
                disableMainButtons();
                DataFeed.ActiveDataFeed.readODataDataFromServer(() => {
                    DataFeed.ActiveDataFeed.readExcelData(() => {
                        Diff.differentiate(DataFeed.ActiveDataFeed);
                        ODSampleData.uploadChangeToOData(enableMainButtons);
                    }, enableMainButtons);
                }, enableMainButtons);
            });

            $("#diff-data-feed").click(() => {
                disableMainButtons();
                DataFeed.ActiveDataFeed.readExcelData(() => {
                    DataFeed.ActiveDataFeed.readODataDataFromServer(() => {
                        DiffPage.DiffPageDelegator.Instance.showDiffPage();
                        enableMainButtons();
                    }, enableMainButtons);
                }, enableMainButtons);
            });
        }

        export function switchToDetailPage() {
            DiffPage.DiffPageDelegator.Instance.hideDiffPage();

            $("#detail-source-name").text(DataFeed.ActiveDataFeed.Name);

            var lastSyncTime = (DataFeed.ActiveDataFeed.LastSyncTime === undefined) ? "Unknown" : DataFeed.ActiveDataFeed.LastSyncTime.toLocaleString()
            $("#detail-source-last-sync-time").text(lastSyncTime);

            ODSampleData.DataHelper.EnsureEventHandlerToBinding(DataFeed.ActiveDataFeed.Name, Office.EventType.BindingSelectionChanged, ODSampleData.ExtendTable.ExpandTableButtonHandler);

            UX.Helpers.switchToMode("mode-detail");
        }

        export function enableMainButtons() {
            $("#import-data-feed").prop("disabled", false);
            $("#save-to-odata").prop("disabled", false);
            $("#diff-data-feed").prop("disabled", false);
        }

        export function disableMainButtons() {
            $("#import-data-feed").prop("disabled", true);
            $("#save-to-odata").prop("disabled", true);
            $("#diff-data-feed").prop("disabled", true);
        }
    }

    // 1. This UILess function can be triggered by 'GetData' button (id=Contoso.Button1Id1) or context menu 'GetData' button (id=Contoso.TestMenu1)
    // 2. The first clicking for any UILess function bound ribbon button or context menu item triggers office's initialize() firstly. Other clickings including other buttons don't trigger the initialize() again.
    // 3. The UILess processing is invoked when the user clicks the bound ribbon button or context menu item 
    // 4. args.completed() is needed at the time the UILess processing is completed, otherwise the other UILess processing would not be invoked until 300s timeout.
    // 5. These UILess processings include all other buttons/contextmenus bound processings.
    export function getButton(args) {
        if (buttonId != 0) {
            buttonId = 1;
            ODSampleData.onOfficeReady();
        }
        buttonId = 1;

        args.completed();
    }

    // 1. This UILess function can be triggered by 'SaveData' button (id=Contoso.Button2Id1)
	// 2. The other comments are same as getButton function
    export function saveButton(args) {
        if (buttonId != 0) {
            buttonId = 2;
            ODSampleData.onOfficeReady();
        }
        buttonId = 2;

        args.completed();
    }
}

