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
        var DiffPage;
        (function (DiffPage) {
            var DiffPageDelegator = (function () {
                function DiffPageDelegator() {
                }
                Object.defineProperty(DiffPageDelegator, "Instance", {
                    get: function () {
                        return DiffPageDelegator.instance;
                    },
                    enumerable: true,
                    configurable: true
                });
                DiffPageDelegator.initialize = function () {
                    if (!DiffPageDelegator.instance) {
                        DiffPageDelegator.instance = ODSampleData.config.UseBulgingList ? new DiffPage.BulgingDiffPageDelegator() : new NativeDelegator();
                        DiffPageDelegator.instance.initialize();
                    }
                };
                DiffPageDelegator.prototype.initialize = function () {
                    this.recordListInfoUpdater = new Model.ItemCounter(diffFilter, DiffPageDelegator.onDiffListItemCountChanged);
                    this.excelRecordWriter = new ODSampleData.ExcelWriter.RecordWriter();
                    this.initializeButtons();
                    this.virtual_initialize();
                };
                DiffPageDelegator.prototype.showDiffPage = function () {
                    ODSampleData.Diff.differentiate(ODSampleData.DataFeed.ActiveDataFeed);
                    ODSampleData.DataFeed.ActiveDataFeed.addRecordPairObserver(this.excelRecordWriter);
                    ODSampleData.DataFeed.ActiveDataFeed.addRecordPairObserver(this.recordListInfoUpdater);
                    this.virtual_beforeShowDiffPage();
                    this.highlightRecordPair(this.virtual_getDiffRecords()[0]);
                    $("#data-feed-name").text(ODSampleData.DataFeed.ActiveDataFeed.Name);
                    $("#data-feed-last-sync-time").text(ODSampleData.DataFeed.ActiveDataFeed.LastSyncTime.toLocaleString());
                    UX.Helpers.switchToMode("mode-diff");
                };
                DiffPageDelegator.prototype.hideDiffPage = function () {
                    if (ODSampleData.DataFeed.ActiveDataFeed) {
                        ODSampleData.DataFeed.ActiveDataFeed.removeRecordPairObserver(this.excelRecordWriter);
                        ODSampleData.DataFeed.ActiveDataFeed.removeRecordPairObserver(this.recordListInfoUpdater);
                        // remove table color format
                        var format = [{ cells: Office.Table.All, format: { backgroundColor: "none" } }];
                        ODSampleData.DataHelper.SetTableFormat(ODSampleData.DataFeed.ActiveDataFeed.Name, format);
                        this.virtual_removeObservers();
                    }
                };
                DiffPageDelegator.prototype.highlightRecordPair = function (record) {
                    if (record && this.getHighlightedRecord() !== record) {
                        this.virtual_highlightRecordPairInRecordList(record);
                        // goto location by id
                        // add the RowIdInExcel by 2 since the table starts from A1
                        if (record.RowIdInExcel < Number.MAX_VALUE) {
                            ODSampleData.DataHelper.GotoLocation(record.RowIdInExcel + 2, 1);
                        }
                    }
                };
                DiffPageDelegator.prototype.getHighlightedRecord = function () {
                    throw Error("To be overrided.");
                };
                DiffPageDelegator.prototype.virtual_initialize = function () {
                    throw Error("To be overrided.");
                };
                DiffPageDelegator.prototype.virtual_beforeShowDiffPage = function () {
                    throw Error("To be overrided.");
                };
                DiffPageDelegator.prototype.virtual_removeObservers = function () {
                    throw Error("To be overrided.");
                };
                DiffPageDelegator.prototype.virtual_highlightRecordPairInRecordList = function (recordPair) {
                    throw Error("To be overrided.");
                };
                DiffPageDelegator.prototype.virtual_getDiffRecords = function () {
                    throw Error("To be overrided.");
                };
                DiffPageDelegator.prototype.initializeButtons = function () {
                    //$("#back-to-detail").click(DataFeedDetailPage.switchToDetailPage);
                    var _this = this;
                    $(".resolve-all-row-to-excel").click(function () {
                        _this.virtual_getDiffRecords().forEach(function (recordPair) {
                            recordPair.getAllCellDiffInfo().forEach(function (cellDiffInfo) { return cellDiffInfo.UsingODataValue = false; });
                        });
                    });
                    $(".resolve-all-row-to-OData").click(function () {
                        _this.virtual_getDiffRecords().forEach(function (recordPair) {
                            recordPair.getAllCellDiffInfo().forEach(function (cellDiffInfo) { return cellDiffInfo.UsingODataValue = true; });
                        });
                    });
                    $("#upload-data-feed").click(function () {
                        //$("#upload-data-feed").prop("disabled", true);
                        //ODSampleData.uploadChangeToOData(DataFeedDetailPage.switchToDetailPage);
                        ODSampleData.DataFeed.ActiveDataFeed.readExcelData(function () {
                            ODSampleData.DataFeed.ActiveDataFeed.readODataDataFromServer(function () {
                                DiffPage.DiffPageDelegator.Instance.showDiffPage();
                                ODataUX.DataFeedDetailPage.enableMainButtons();
                            }, ODataUX.DataFeedDetailPage.enableMainButtons);
                        }, ODataUX.DataFeedDetailPage.enableMainButtons);
                    });
                };
                DiffPageDelegator.onDiffListItemCountChanged = function (count) {
                    $("#diff-row-count").text(count.toString());
                    if (count > 1) {
                        $("#record-list-title").text("Rows with Differences");
                    }
                    else {
                        $("#record-list-title").text("Row with Differences");
                    }
                    $(".with-diff").prop("hidden", count === 0);
                    $(".without-diff").prop("hidden", count > 0);
                    $("#upload-data-feed").prop("disabled", false);
                };
                return DiffPageDelegator;
            })();
            DiffPage.DiffPageDelegator = DiffPageDelegator;
            var NativeDelegator = (function (_super) {
                __extends(NativeDelegator, _super);
                function NativeDelegator() {
                    _super.apply(this, arguments);
                }
                NativeDelegator.prototype.getHighlightedRecord = function () {
                    return this.cellDiffInfoList.getCurrentRecord();
                };
                NativeDelegator.prototype.virtual_initialize = function () {
                    this.recordDiffInfoList = new RecordDiffInfoList();
                    this.cellDiffInfoList = new CellDiffInfoList($("#cell-list"));
                    UX.Helpers.occupiesLeftWidthOfParent($("#cell-list-title-container"));
                    $(".bulging-list").remove();
                };
                NativeDelegator.prototype.virtual_beforeShowDiffPage = function () {
                    ODSampleData.DataFeed.ActiveDataFeed.addRecordPairObserver(this.recordDiffInfoList);
                    this.recordDiffInfoList.sortElementsImmediately();
                    var allDiffRecordPairs = this.recordDiffInfoList.getDataObjects();
                    this.highlightRecordPair(allDiffRecordPairs[0]);
                };
                NativeDelegator.prototype.virtual_removeObservers = function () {
                    ODSampleData.DataFeed.ActiveDataFeed.removeRecordPairObserver(this.recordDiffInfoList);
                };
                NativeDelegator.prototype.virtual_highlightRecordPairInRecordList = function (recordPair) {
                    this.cellDiffInfoList.setRecordToDiff(recordPair);
                    this.updateCellListTitle();
                };
                NativeDelegator.prototype.virtual_getDiffRecords = function () {
                    return this.recordDiffInfoList.getDataObjects();
                };
                NativeDelegator.prototype.updateCellListTitle = function () {
                    var rowId = this.getHighlightedRecord().RowIdInExcel;
                    var title = "Row ?";
                    if (rowId < Number.MAX_VALUE) {
                        title = "Row " + (rowId + 2) + " Details";
                    }
                    $("#cell-list-title").text(title);
                };
                return NativeDelegator;
            })(DiffPageDelegator);
            function compareWithRowIdOrKeyValue(a, b) {
                if (a.RowIdInExcel !== b.RowIdInExcel) {
                    return a.RowIdInExcel - b.RowIdInExcel;
                }
                else if (a.Id < b.Id) {
                    return -1;
                }
                else {
                    return 1;
                }
            }
            DiffPage.compareWithRowIdOrKeyValue = compareWithRowIdOrKeyValue;
            function diffFilter(recordPair) {
                switch (recordPair.DiffStatus) {
                    case ODSampleData.DiffStatus.WaitingForCompare:
                    case ODSampleData.DiffStatus.NoData:
                    case ODSampleData.DiffStatus.NoDiff:
                        return false;
                }
                return true;
            }
            DiffPage.diffFilter = diffFilter;
            var RecordDiffInfoList = (function (_super) {
                __extends(RecordDiffInfoList, _super);
                function RecordDiffInfoList() {
                    _super.call(this, new RecordDiffInfoArtist(), $("#record-list"), compareWithRowIdOrKeyValue);
                    this.setFilter(diffFilter);
                }
                return RecordDiffInfoList;
            })(UX.List);
            var RecordDiffInfoArtist = (function () {
                function RecordDiffInfoArtist() {
                }
                RecordDiffInfoArtist.prototype.newJQuery = function (recordPair) {
                    var newElement = UX.Helpers.getTemplateWithName("record-list-row");
                    newElement.click(function () {
                        DiffPageDelegator.Instance.highlightRecordPair(recordPair);
                    });
                    this.refresh(newElement, recordPair);
                    return newElement;
                };
                RecordDiffInfoArtist.prototype.refresh = function (jqElement, recordPair) {
                    var namedElements = UX.Helpers.getNamedElementMapOf(jqElement);
                    namedElements["row-id"].text(recordPair.RowIdInExcel < Number.MAX_VALUE ? (recordPair.RowIdInExcel + 2).toString() : "?");
                    namedElements["resolved-as"].text(RecordDiffInfoArtist.getUxStringForResolveStatus(recordPair.ResolveStatus));
                    if (recordPair === DiffPageDelegator.Instance.getHighlightedRecord()) {
                        jqElement.addClass("highlighted");
                    }
                    else {
                        jqElement.removeClass("highlighted");
                    }
                };
                RecordDiffInfoArtist.getUxStringForDiffStatus = function (diffStatus) {
                    switch (diffStatus) {
                        case ODSampleData.DiffStatus.Different:
                            return "Excel/OData";
                        case ODSampleData.DiffStatus.OnlyOnLocal:
                            return "Only In Excel";
                        case ODSampleData.DiffStatus.OnlyOnOData:
                            return "Only In OData";
                    }
                };
                RecordDiffInfoArtist.getUxStringForResolveStatus = function (resolveStatus) {
                    switch (resolveStatus) {
                        case ODSampleData.RecordResolveStatus.Excel:
                            return "Excel";
                        case ODSampleData.RecordResolveStatus.Mixed:
                            return "Mixed";
                        case ODSampleData.RecordResolveStatus.OData:
                            return "OData";
                    }
                };
                return RecordDiffInfoArtist;
            })();
            var CellDiffInfoList = (function (_super) {
                __extends(CellDiffInfoList, _super);
                function CellDiffInfoList(jqElement) {
                    var _this = this;
                    _super.call(this, new CellDiffInfoArtist(), jqElement, CellDiffInfoList.compareWithHearderOrder);
                    this.setFilter(function () { return true; });
                    $(".resolve-all-to-excel", jqElement).click(function () {
                        if (_this.currentRecord) {
                            _this.currentRecord.getAllCellDiffInfo().forEach(function (cellDiffInfo) {
                                cellDiffInfo.UsingODataValue = false;
                            });
                        }
                    });
                    $(".resolve-all-to-OData", jqElement).click(function () {
                        if (_this.currentRecord) {
                            _this.currentRecord.getAllCellDiffInfo().forEach(function (cellDiffInfo) {
                                cellDiffInfo.UsingODataValue = true;
                            });
                        }
                    });
                }
                CellDiffInfoList.prototype.onObserved = function (cellDiffInfo) {
                    _super.prototype.onObserved.call(this, cellDiffInfo);
                    this.updateHeader();
                };
                CellDiffInfoList.prototype.onUpdated = function (cellDiffInfo) {
                    _super.prototype.onUpdated.call(this, cellDiffInfo);
                    this.updateHeader();
                };
                CellDiffInfoList.prototype.onUnobserved = function (cellDiffInfo) {
                    _super.prototype.onUnobserved.call(this, cellDiffInfo);
                    this.updateHeader();
                };
                CellDiffInfoList.prototype.getCurrentRecord = function () {
                    return this.currentRecord;
                };
                CellDiffInfoList.prototype.setRecordToDiff = function (record) {
                    if (this.currentRecord) {
                        this.currentRecord.removeObserverForCellDiffInfo(this);
                        this.currentRecord.notifyUpdateLater();
                    }
                    this.currentRecord = record;
                    if (record) {
                        record.addObserverForCellDiffInfo(this);
                        record.notifyUpdateLater();
                    }
                };
                CellDiffInfoList.compareWithHearderOrder = function (a, b) {
                    var headers = ODSampleData.DataFeed.ActiveDataFeed.Headers;
                    return headers.indexOf(a.ColumnName) - headers.indexOf(b.ColumnName);
                };
                CellDiffInfoList.prototype.updateHeader = function () {
                    if (this.currentRecord) {
                        var recordResolveStatus = this.currentRecord.ResolveStatus;
                        $("[name=all-using-excel]", this.JQElement).prop("checked", recordResolveStatus === ODSampleData.RecordResolveStatus.Excel);
                        $("[name=all-using-OData]", this.JQElement).prop("checked", recordResolveStatus === ODSampleData.RecordResolveStatus.OData);
                    }
                };
                return CellDiffInfoList;
            })(UX.List);
            DiffPage.CellDiffInfoList = CellDiffInfoList;
            var CellDiffInfoArtist = (function () {
                function CellDiffInfoArtist() {
                }
                CellDiffInfoArtist.prototype.newJQuery = function (cellDiffInfo) {
                    var newElement = UX.Helpers.getTemplateWithName("cell-list-row");
                    var namedElements = UX.Helpers.getNamedElementMapOf(newElement);
                    namedElements["excel-data-block"].click(function () {
                        cellDiffInfo.UsingODataValue = false;
                    });
                    namedElements["OData-data-block"].click(function () {
                        cellDiffInfo.UsingODataValue = true;
                    });
                    this.refresh(newElement, cellDiffInfo);
                    return newElement;
                };
                CellDiffInfoArtist.prototype.refresh = function (jqElement, cellDiffInfo) {
                    var namedElements = UX.Helpers.getNamedElementMapOf(jqElement);
                    if (cellDiffInfo.UsingODataValue) {
                        namedElements["using-excel"].prop("checked", false);
                        namedElements["using-OData"].prop("checked", true);
                    }
                    else {
                        namedElements["using-excel"].prop("checked", true);
                        namedElements["using-OData"].prop("checked", false);
                    }
                    var columnName = namedElements["column-name"];
                    var excelValue;
                    var oDataValue;
                    if (cellDiffInfo.ColumnName === ODSampleData.CellDiffInfo.ColumnNameForWholeRow) {
                        columnName.text("All Columns");
                        excelValue = cellDiffInfo.RecordPair.ExcelRowData;
                        oDataValue = cellDiffInfo.RecordPair.ODataRowData;
                    }
                    else {
                        columnName.text(cellDiffInfo.ColumnName);
                        columnName.attr("title", cellDiffInfo.ColumnName);
                        excelValue = (cellDiffInfo.ExcelValueSnapshot);
                        oDataValue = (cellDiffInfo.ODataValue);
                    }
                    this.setValueToCell(excelValue, namedElements["excel-data"], namedElements["excel-data-block"]);
                    this.setValueToCell(oDataValue, namedElements["OData-data"], namedElements["OData-data-block"]);
                };
                CellDiffInfoArtist.prototype.setValueToCell = function (value, cell, tooltipElement) {
                    if (!value) {
                        cell.html("<i>No Data</i>");
                        tooltipElement.removeAttr("title");
                    }
                    else if (typeof (value) === "string") {
                        cell.text(value);
                        tooltipElement.attr("title", value);
                    }
                    else {
                        cell.html("<i>Details</i>");
                        var tooltipText = ODSampleData.DataFeed.ActiveDataFeed.Headers
                            .map(function (columnName) { return columnName + ": " + value[columnName]; })
                            .join("\n");
                        tooltipElement.attr("title", tooltipText);
                    }
                };
                return CellDiffInfoArtist;
            })();
        })(DiffPage = ODataUX.DiffPage || (ODataUX.DiffPage = {}));
    })(ODataUX = ODSampleData.ODataUX || (ODSampleData.ODataUX = {}));
})(ODSampleData || (ODSampleData = {}));
//# sourceMappingURL=UX.DiffPage.js.map