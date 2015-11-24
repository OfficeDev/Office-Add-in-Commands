module ODSampleData.ODataUX.DiffPage {
    export class DiffPageDelegator {
        private static instance: DiffPageDelegator;
        private recordListInfoUpdater: Model.ItemCounter;
        private excelRecordWriter: ExcelWriter.RecordWriter;

        public static get Instance() {
            return DiffPageDelegator.instance;
        }

        public static initialize() {
            if (!DiffPageDelegator.instance) {
                DiffPageDelegator.instance = ODSampleData.config.UseBulgingList ? new DiffPage.BulgingDiffPageDelegator() : new NativeDelegator();
                DiffPageDelegator.instance.initialize();
            }
        }

        protected initialize() {
            this.recordListInfoUpdater = new Model.ItemCounter(diffFilter, DiffPageDelegator.onDiffListItemCountChanged);
            this.excelRecordWriter = new ExcelWriter.RecordWriter();
            this.initializeButtons();

            this.virtual_initialize();
        }

        public showDiffPage() {
            Diff.differentiate(DataFeed.ActiveDataFeed);
            DataFeed.ActiveDataFeed.addRecordPairObserver(this.excelRecordWriter);
            DataFeed.ActiveDataFeed.addRecordPairObserver(this.recordListInfoUpdater);

            this.virtual_beforeShowDiffPage();
            this.highlightRecordPair(this.virtual_getDiffRecords()[0]);

            $("#data-feed-name").text(DataFeed.ActiveDataFeed.Name);
            $("#data-feed-last-sync-time").text(DataFeed.ActiveDataFeed.LastSyncTime.toLocaleString());
            UX.Helpers.switchToMode("mode-diff");
        }

        public hideDiffPage() {
            if (DataFeed.ActiveDataFeed) {
                DataFeed.ActiveDataFeed.removeRecordPairObserver(this.excelRecordWriter);
                DataFeed.ActiveDataFeed.removeRecordPairObserver(this.recordListInfoUpdater);

                // remove table color format
                var format = [{ cells: Office.Table.All, format: { backgroundColor: "none" } }];
                ODSampleData.DataHelper.SetTableFormat(DataFeed.ActiveDataFeed.Name, format);

                this.virtual_removeObservers();
            }
        }

        public highlightRecordPair(record: RecordPair) {
            if (record && this.getHighlightedRecord() !== record) {
                this.virtual_highlightRecordPairInRecordList(record);

                // goto location by id
                // add the RowIdInExcel by 2 since the table starts from A1
                if (record.RowIdInExcel < Number.MAX_VALUE) {
                    ODSampleData.DataHelper.GotoLocation(record.RowIdInExcel + 2, 1);
                }
            }
        }

        public getHighlightedRecord(): RecordPair {
            throw Error("To be overrided.");
        }

        protected virtual_initialize() {
            throw Error("To be overrided.");
        }

        protected virtual_beforeShowDiffPage() {
            throw Error("To be overrided.");
        }

        protected virtual_removeObservers() {
            throw Error("To be overrided.");
        }

        protected virtual_highlightRecordPairInRecordList(recordPair: RecordPair) {
            throw Error("To be overrided.");
        }

        protected virtual_getDiffRecords(): RecordPair[] {
            throw Error("To be overrided.");
        }

        private initializeButtons() {
            //$("#back-to-detail").click(DataFeedDetailPage.switchToDetailPage);

            $(".resolve-all-row-to-excel").click(() => {
                this.virtual_getDiffRecords().forEach(
                    recordPair => {
                        recordPair.getAllCellDiffInfo().forEach(cellDiffInfo => cellDiffInfo.UsingODataValue = false)
                    });
            });

            $(".resolve-all-row-to-OData").click(() => {
                this.virtual_getDiffRecords().forEach(
                    recordPair => {
                        recordPair.getAllCellDiffInfo().forEach(cellDiffInfo => cellDiffInfo.UsingODataValue = true)
                    });
            });

            $("#upload-data-feed").click(() => {
                //$("#upload-data-feed").prop("disabled", true);
                //ODSampleData.uploadChangeToOData(DataFeedDetailPage.switchToDetailPage);
                DataFeed.ActiveDataFeed.readExcelData(() => {
                    DataFeed.ActiveDataFeed.readODataDataFromServer(() => {
                        DiffPage.DiffPageDelegator.Instance.showDiffPage();
                        DataFeedDetailPage.enableMainButtons();
                    }, DataFeedDetailPage.enableMainButtons);
                }, DataFeedDetailPage.enableMainButtons);
            });
        }

        private static onDiffListItemCountChanged(count: number) {
            $("#diff-row-count").text(count.toString());
            if (count > 1) {
                $("#record-list-title").text("Rows with Differences");
            } else {
                $("#record-list-title").text("Row with Differences");
            }

            $(".with-diff").prop("hidden", count === 0);
            $(".without-diff").prop("hidden", count > 0);
            $("#upload-data-feed").prop("disabled", false);
        }
    }

    class NativeDelegator extends DiffPageDelegator {
        private recordDiffInfoList: RecordDiffInfoList;
        private cellDiffInfoList: CellDiffInfoList;

        public getHighlightedRecord(): RecordPair {
            return this.cellDiffInfoList.getCurrentRecord();
        }

        protected virtual_initialize() {
            this.recordDiffInfoList = new RecordDiffInfoList();
            this.cellDiffInfoList = new CellDiffInfoList($("#cell-list"));

            UX.Helpers.occupiesLeftWidthOfParent($("#cell-list-title-container"));
            $(".bulging-list").remove();
        }

        protected virtual_beforeShowDiffPage() {
            DataFeed.ActiveDataFeed.addRecordPairObserver(this.recordDiffInfoList);
            this.recordDiffInfoList.sortElementsImmediately();
            var allDiffRecordPairs = this.recordDiffInfoList.getDataObjects();
            this.highlightRecordPair(allDiffRecordPairs[0]);
        }

        protected virtual_removeObservers() {
            DataFeed.ActiveDataFeed.removeRecordPairObserver(this.recordDiffInfoList);
        }

        protected virtual_highlightRecordPairInRecordList(recordPair: RecordPair) {
            this.cellDiffInfoList.setRecordToDiff(recordPair);
            this.updateCellListTitle();
        }

        protected virtual_getDiffRecords(): RecordPair[] {
            return this.recordDiffInfoList.getDataObjects();
        }

        private updateCellListTitle() {
            var rowId = this.getHighlightedRecord().RowIdInExcel;

            var title = "Row ?";
            if (rowId < Number.MAX_VALUE) {
                title = "Row " + (rowId + 2) + " Details";
            }

            $("#cell-list-title").text(title);
        }
    }

    export function compareWithRowIdOrKeyValue(a: RecordPair, b: RecordPair) {
        if (a.RowIdInExcel !== b.RowIdInExcel) {
            return a.RowIdInExcel - b.RowIdInExcel;
        } else if (a.Id < b.Id) {
            return -1;
        } else {
            return 1;
        }
    }

    export function diffFilter(recordPair: RecordPair) {
        switch (recordPair.DiffStatus) {
            case DiffStatus.WaitingForCompare:
            case DiffStatus.NoData:
            case DiffStatus.NoDiff:
                return false;
        }

        return true;
    }

    class RecordDiffInfoList extends UX.List<RecordPair> {
        constructor() {
            super(
                new RecordDiffInfoArtist(),
                $("#record-list"),
                compareWithRowIdOrKeyValue);

            this.setFilter(diffFilter);
        }

    }

    class RecordDiffInfoArtist implements UX.IListItemArtist<RecordPair> {
        newJQuery(recordPair: RecordPair): JQuery {
            var newElement = UX.Helpers.getTemplateWithName("record-list-row");

            newElement.click(() => {
                DiffPageDelegator.Instance.highlightRecordPair(recordPair);
            });

            this.refresh(newElement, recordPair);
            return newElement;
        }

        refresh(jqElement: JQuery, recordPair: RecordPair) {
            var namedElements = UX.Helpers.getNamedElementMapOf(jqElement);
            namedElements["row-id"].text(recordPair.RowIdInExcel < Number.MAX_VALUE ? (recordPair.RowIdInExcel + 2).toString() : "?");
            namedElements["resolved-as"].text(RecordDiffInfoArtist.getUxStringForResolveStatus(recordPair.ResolveStatus));

            if (recordPair === DiffPageDelegator.Instance.getHighlightedRecord()) {
                jqElement.addClass("highlighted");
            } else {
                jqElement.removeClass("highlighted");
            }
        }

        private static getUxStringForDiffStatus(diffStatus: DiffStatus): string {
            switch (diffStatus) {
                case DiffStatus.Different:
                    return "Excel/OData";
                case DiffStatus.OnlyOnLocal:
                    return "Only In Excel";
                case DiffStatus.OnlyOnOData:
                    return "Only In OData";
            }
        }

        private static getUxStringForResolveStatus(resolveStatus: RecordResolveStatus): string {
            switch (resolveStatus) {
                case RecordResolveStatus.Excel:
                    return "Excel";
                case RecordResolveStatus.Mixed:
                    return "Mixed";
                case RecordResolveStatus.OData:
                    return "OData";
            }
        }
    }

    export class CellDiffInfoList extends UX.List<CellDiffInfo> {
        private currentRecord: RecordPair;

        constructor(jqElement: JQuery) {
            super(new CellDiffInfoArtist(), jqElement, CellDiffInfoList.compareWithHearderOrder);
            this.setFilter(() => true);

            $(".resolve-all-to-excel", jqElement).click(() => {
                if (this.currentRecord) {
                    this.currentRecord.getAllCellDiffInfo().forEach((cellDiffInfo: CellDiffInfo) => {
                        cellDiffInfo.UsingODataValue = false;
                    });
                }
            });

            $(".resolve-all-to-OData", jqElement).click(() => {
                if (this.currentRecord) {
                    this.currentRecord.getAllCellDiffInfo().forEach((cellDiffInfo: CellDiffInfo) => {
                        cellDiffInfo.UsingODataValue = true;
                    });
                }
            });
        }

        public onObserved(cellDiffInfo: CellDiffInfo) {
            super.onObserved(cellDiffInfo);
            this.updateHeader();
        }

        public onUpdated(cellDiffInfo: CellDiffInfo) {
            super.onUpdated(cellDiffInfo);
            this.updateHeader();
        }

        public onUnobserved(cellDiffInfo: CellDiffInfo) {
            super.onUnobserved(cellDiffInfo);
            this.updateHeader();
        }

        public getCurrentRecord(): RecordPair {
            return this.currentRecord;
        }

        public setRecordToDiff(record: RecordPair) {
            if (this.currentRecord) {
                this.currentRecord.removeObserverForCellDiffInfo(this);
                this.currentRecord.notifyUpdateLater();
            }
            this.currentRecord = record;
            if (record) {
                record.addObserverForCellDiffInfo(this);
                record.notifyUpdateLater();
            }
        }

        private static compareWithHearderOrder(a: CellDiffInfo, b: CellDiffInfo) {
            var headers = DataFeed.ActiveDataFeed.Headers;
            return headers.indexOf(a.ColumnName) - headers.indexOf(b.ColumnName);
        }

        private updateHeader() {
            if (this.currentRecord) {
                var recordResolveStatus = this.currentRecord.ResolveStatus;
                $("[name=all-using-excel]", this.JQElement).prop("checked", recordResolveStatus === RecordResolveStatus.Excel);
                $("[name=all-using-OData]", this.JQElement).prop("checked", recordResolveStatus === RecordResolveStatus.OData);
            }
        }
    }

    class CellDiffInfoArtist implements UX.IListItemArtist<CellDiffInfo> {
        newJQuery(cellDiffInfo: CellDiffInfo): JQuery {
            var newElement = UX.Helpers.getTemplateWithName("cell-list-row");

            var namedElements = UX.Helpers.getNamedElementMapOf(newElement);
            namedElements["excel-data-block"].click(() => {
                cellDiffInfo.UsingODataValue = false;
            });

            namedElements["OData-data-block"].click(() => {
                cellDiffInfo.UsingODataValue = true;
            });

            this.refresh(newElement, cellDiffInfo);
            return newElement;
        }

        refresh(jqElement: JQuery, cellDiffInfo: CellDiffInfo) {
            var namedElements = UX.Helpers.getNamedElementMapOf(jqElement);
            if (cellDiffInfo.UsingODataValue) {
                namedElements["using-excel"].prop("checked", false);
                namedElements["using-OData"].prop("checked", true);
            } else {
                namedElements["using-excel"].prop("checked", true);
                namedElements["using-OData"].prop("checked", false);
            }

            var columnName = namedElements["column-name"];
            var excelValue: string | RecordItem;
            var oDataValue: string | RecordItem;

            if (cellDiffInfo.ColumnName === CellDiffInfo.ColumnNameForWholeRow) {
                columnName.text("All Columns");

                excelValue = cellDiffInfo.RecordPair.ExcelRowData;
                oDataValue = cellDiffInfo.RecordPair.ODataRowData;
            } else {
                columnName.text(cellDiffInfo.ColumnName);
                columnName.attr("title", cellDiffInfo.ColumnName);

                excelValue = (cellDiffInfo.ExcelValueSnapshot);
                oDataValue = (cellDiffInfo.ODataValue);
            }

            this.setValueToCell(
                excelValue,
                namedElements["excel-data"],
                namedElements["excel-data-block"]);

            this.setValueToCell(
                oDataValue,
                namedElements["OData-data"],
                namedElements["OData-data-block"]);
        }

        private setValueToCell(value: string | RecordItem, cell: JQuery, tooltipElement: JQuery) {
            if (!value) {
                cell.html("<i>No Data</i>");
                tooltipElement.removeAttr("title");
            } else if (typeof (value) === "string") {
                cell.text(<string>value);
                tooltipElement.attr("title", <string>value);
            } else {
                cell.html("<i>Details</i>");

                var tooltipText = DataFeed.ActiveDataFeed.Headers
                    .map(columnName => columnName + ": " + value[columnName])
                    .join("\n");
                tooltipElement.attr("title", tooltipText);
            }
        }
    }
}