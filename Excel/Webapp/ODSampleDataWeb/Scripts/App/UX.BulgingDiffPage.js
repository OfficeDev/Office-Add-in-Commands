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
            var BulgingDiffPageDelegator = (function (_super) {
                __extends(BulgingDiffPageDelegator, _super);
                function BulgingDiffPageDelegator() {
                    _super.apply(this, arguments);
                }
                BulgingDiffPageDelegator.prototype.getHighlightedRecord = function () {
                    return this.virtual_getDiffRecords()[this.recordDiffList.getTargetBulgedDataIndex()];
                };
                BulgingDiffPageDelegator.prototype.openCellLevelDiffTable = function () {
                    this.cellDiffTableAnimater.markAsAutoOpen(true);
                };
                BulgingDiffPageDelegator.prototype.virtual_initialize = function () {
                    var _this = this;
                    var curveCalculator = new Animation.CosineCurveCalculator(1.5, 2);
                    this.recordDiffList = new RecordDiffList(curveCalculator);
                    this.cellDiffTableAnimater = new CellListPanelAnimater(this.recordDiffList);
                    $("#navigate-previous").click(function () {
                        var targetIndex = _this.recordDiffList.getTargetBulgedDataIndex();
                        var records = _this.virtual_getDiffRecords();
                        _this.highlightRecordPair(records[targetIndex - 1]);
                    });
                    $("#navigate-next").click(function () {
                        var targetIndex = _this.recordDiffList.getTargetBulgedDataIndex();
                        var records = _this.virtual_getDiffRecords();
                        _this.highlightRecordPair(records[targetIndex + 1]);
                    });
                    $(".non-bulging-list").remove();
                    UX.Helpers.occupiesLeftHeightOfParent($("#diff-page"));
                    UX.Helpers.occupiesLeftHeightOfParentAsMaxHeight($("#diff-section-card"));
                    UX.Helpers.occupiesLeftHeightOfParentAsMaxHeight($("#record-detail-list"));
                };
                BulgingDiffPageDelegator.prototype.virtual_beforeShowDiffPage = function () {
                    ODSampleData.DataFeed.ActiveDataFeed.addRecordPairObserver(this.recordDiffList);
                    this.recordDiffList.sortElementsImmediately();
                    this.recordDiffList.getBulgingAnimatingNumber().forceToValue(-2);
                };
                BulgingDiffPageDelegator.prototype.virtual_removeObservers = function () {
                    ODSampleData.DataFeed.ActiveDataFeed.removeRecordPairObserver(this.recordDiffList);
                };
                BulgingDiffPageDelegator.prototype.virtual_highlightRecordPairInRecordList = function (recordPair) {
                    this.recordDiffList.bulgeData(recordPair);
                };
                BulgingDiffPageDelegator.prototype.virtual_getDiffRecords = function () {
                    return this.recordDiffList.getDataObjects();
                };
                return BulgingDiffPageDelegator;
            })(DiffPage.DiffPageDelegator);
            DiffPage.BulgingDiffPageDelegator = BulgingDiffPageDelegator;
            var RecordDiffList = (function (_super) {
                __extends(RecordDiffList, _super);
                function RecordDiffList(curveCalculator) {
                    _super.call(this, curveCalculator, new Animation.JQueryAnimatingNumber(400), new RecordDiffDetailArtist(), $("#record-detail-list"), DiffPage.compareWithRowIdOrKeyValue);
                    this.setFilter(DiffPage.diffFilter);
                }
                RecordDiffList.prototype.ensureBulgedItemInView = function () {
                    var record = this.getDataObjects()[this.getTargetBulgedDataIndex()];
                    if (!this.hasScrollbar() || !record) {
                        return;
                    }
                    var item = this.getElementByData(record);
                    var top = item.position().top;
                    if (top < 0) {
                        this.JQElement.scrollTop(top + this.JQElement.scrollTop());
                    }
                    else {
                        var itemHeight = item.outerHeight();
                        var bottom = top + itemHeight;
                        var minParentTop = top + itemHeight - this.JQElement.height();
                        if (minParentTop > 0) {
                            this.JQElement.scrollTop(minParentTop + this.JQElement.scrollTop());
                        }
                    }
                };
                RecordDiffList.prototype.virtual_onRefresh = function () {
                    this.ensureBulgedItemInView();
                };
                RecordDiffList.prototype.hasScrollbar = function () {
                    var listElement = this.JQElement[0];
                    return listElement.scrollHeight > listElement.clientHeight;
                };
                return RecordDiffList;
            })(Animation.BulgingList);
            var RecordDiffDetailArtist = (function () {
                function RecordDiffDetailArtist() {
                }
                RecordDiffDetailArtist.prototype.newJQuery = function (recordPair) {
                    var newElement = UX.Helpers.getTemplateWithName("record-detail-list-item");
                    newElement.click(function () {
                        var delegator = DiffPage.DiffPageDelegator.Instance;
                        delegator.highlightRecordPair(recordPair);
                        delegator.openCellLevelDiffTable();
                    });
                    this.refresh(newElement, recordPair);
                    return newElement;
                };
                RecordDiffDetailArtist.prototype.refresh = function (jqElement, recordPair) {
                    jqElement.attr("data-applied", ODSampleData.RecordResolveStatus[recordPair.ResolveStatus]);
                    $("[name=title]", jqElement).text("Row " + (recordPair.RowIdInExcel < Number.MAX_VALUE ? (recordPair.RowIdInExcel + 2).toString() : "?"));
                    var explanationText;
                    switch (recordPair.DiffStatus) {
                        case ODSampleData.DiffStatus.OnlyOnOData:
                            explanationText = "This row only exists in OData.";
                            break;
                        case ODSampleData.DiffStatus.OnlyOnLocal:
                            explanationText = "This row only exists in Excel.";
                            break;
                        case ODSampleData.DiffStatus.Different:
                            {
                                var diffCellCount = recordPair.getAllCellDiffInfo().length;
                                if (diffCellCount <= 1) {
                                    explanationText = diffCellCount + " different cell in this row.";
                                }
                                else {
                                    explanationText = diffCellCount + " different cells in this row.";
                                }
                            }
                            break;
                    }
                    $("[name=explanation]", jqElement).text(explanationText);
                };
                return RecordDiffDetailArtist;
            })();
            var CellListPanelAnimater = (function () {
                function CellListPanelAnimater(recordDiffList) {
                    var _this = this;
                    this.recordDiffList = recordDiffList;
                    this.onRecordListAnimationDone = function () { return _this.startAnimate(); };
                    this.onHighlightedRecordChanged = function () {
                        if (!_this.autoOpen || _this.getActiveRecord() !== DiffPage.DiffPageDelegator.Instance.getHighlightedRecord()) {
                            _this.retract();
                        }
                    };
                    this.markAsAutoOpen(true);
                }
                CellListPanelAnimater.prototype.markAsAutoOpen = function (autoOpen) {
                    if (!this.autoOpen === !autoOpen) {
                        return;
                    }
                    this.autoOpen = !!autoOpen;
                    var recordListAnimatingNumber = this.recordDiffList.getBulgingAnimatingNumber();
                    if (autoOpen) {
                        recordListAnimatingNumber.addCallbackForTargetChanged(this.onHighlightedRecordChanged);
                        recordListAnimatingNumber.addCallbackForDone(this.onRecordListAnimationDone);
                    }
                    else {
                        recordListAnimatingNumber.removeCallbackForTargetChanged(this.onHighlightedRecordChanged);
                        recordListAnimatingNumber.removeCallbackForDone(this.onRecordListAnimationDone);
                        this.retract();
                    }
                };
                CellListPanelAnimater.prototype.getActiveRecord = function () {
                    if (this.cellDiffInfoList) {
                        return this.cellDiffInfoList.getCurrentRecord();
                    }
                };
                CellListPanelAnimater.prototype.retract = function () {
                    if (this.cellDiffInfoList) {
                        var cellDiffTable = this.cellDiffInfoList;
                        this.cellDiffInfoList = undefined;
                        cellDiffTable.JQElement.hide({
                            duration: 400,
                            done: function () {
                                cellDiffTable.JQElement.remove();
                                cellDiffTable.setRecordToDiff(undefined);
                            }
                        });
                    }
                };
                CellListPanelAnimater.prototype.startAnimate = function () {
                    var _this = this;
                    var highlightedRecord = DiffPage.DiffPageDelegator.Instance.getHighlightedRecord();
                    if (!this.autoOpen || this.getActiveRecord() === highlightedRecord) {
                        return;
                    }
                    this.retract();
                    if (!highlightedRecord) {
                        return;
                    }
                    this.cellDiffInfoList = new DiffPage.CellDiffInfoList(UX.Helpers.getTemplateWithName("cell-list"));
                    this.cellDiffInfoList.setRecordToDiff(highlightedRecord);
                    this.recordDiffList.getElementByData(highlightedRecord).append(this.cellDiffInfoList.JQElement);
                    this.cellDiffInfoList.JQElement.show({
                        duration: 400,
                        progress: function () {
                            _this.recordDiffList.ensureBulgedItemInView();
                        }
                    });
                };
                return CellListPanelAnimater;
            })();
        })(DiffPage = ODataUX.DiffPage || (ODataUX.DiffPage = {}));
    })(ODataUX = ODSampleData.ODataUX || (ODSampleData.ODataUX = {}));
})(ODSampleData || (ODSampleData = {}));
//# sourceMappingURL=UX.BulgingDiffPage.js.map