module ODSampleData.ODataUX.DiffPage {
    export class BulgingDiffPageDelegator extends DiffPageDelegator {
        private recordDiffList: RecordDiffList;
        private cellDiffTableAnimater: CellListPanelAnimater;

        public getHighlightedRecord(): RecordPair {
            return this.virtual_getDiffRecords()[this.recordDiffList.getTargetBulgedDataIndex()];
        }

        public openCellLevelDiffTable() {
            this.cellDiffTableAnimater.markAsAutoOpen(true);
        }

        protected virtual_initialize() {
            var curveCalculator = new Animation.CosineCurveCalculator(1.5, 2);
            this.recordDiffList = new RecordDiffList(curveCalculator);
            this.cellDiffTableAnimater = new CellListPanelAnimater(this.recordDiffList);

            $("#navigate-previous").click(() => {
                var targetIndex = this.recordDiffList.getTargetBulgedDataIndex();
                var records = this.virtual_getDiffRecords();
                this.highlightRecordPair(records[targetIndex - 1]);
            });

            $("#navigate-next").click(() => {
                var targetIndex = this.recordDiffList.getTargetBulgedDataIndex();
                var records = this.virtual_getDiffRecords();
                this.highlightRecordPair(records[targetIndex + 1]);
            });

            $(".non-bulging-list").remove();

            UX.Helpers.occupiesLeftHeightOfParent($("#diff-page"));
            UX.Helpers.occupiesLeftHeightOfParentAsMaxHeight($("#diff-section-card"));
            UX.Helpers.occupiesLeftHeightOfParentAsMaxHeight($("#record-detail-list"));
        }

        protected virtual_beforeShowDiffPage() {
            DataFeed.ActiveDataFeed.addRecordPairObserver(this.recordDiffList);

            this.recordDiffList.sortElementsImmediately();
            this.recordDiffList.getBulgingAnimatingNumber().forceToValue(-2);
        }

        protected virtual_removeObservers() {
            DataFeed.ActiveDataFeed.removeRecordPairObserver(this.recordDiffList);
        }

        protected virtual_highlightRecordPairInRecordList(recordPair: RecordPair) {
            this.recordDiffList.bulgeData(recordPair);
        }

        protected virtual_getDiffRecords(): RecordPair[] {
            return this.recordDiffList.getDataObjects();
        }
    }

    class RecordDiffList extends Animation.BulgingList<RecordPair> {
        constructor(curveCalculator: Animation.CosineCurveCalculator) {
            super(
                curveCalculator,
                new Animation.JQueryAnimatingNumber(400),
                new RecordDiffDetailArtist(),
                $("#record-detail-list"),
                compareWithRowIdOrKeyValue);

            this.setFilter(diffFilter);
        }

        public ensureBulgedItemInView() {
            var record = this.getDataObjects()[this.getTargetBulgedDataIndex()];
            if (!this.hasScrollbar() || !record) {
                return;
            }

            var item = this.getElementByData(record);

            var top = item.position().top;

            if (top < 0) {
                this.JQElement.scrollTop(top + this.JQElement.scrollTop());
            } else {
                var itemHeight = item.outerHeight();
                var bottom = top + itemHeight;
                var minParentTop = top + itemHeight - this.JQElement.height();
                if (minParentTop > 0) {
                    this.JQElement.scrollTop(minParentTop + this.JQElement.scrollTop());
                }
            }
        }

        protected virtual_onRefresh() {
            this.ensureBulgedItemInView();
        }

        private hasScrollbar() {
            var listElement = this.JQElement[0];
            return listElement.scrollHeight > listElement.clientHeight;
        }
    }

    class RecordDiffDetailArtist implements UX.IListItemArtist<RecordPair> {
        newJQuery(recordPair: RecordPair): JQuery {
            var newElement = UX.Helpers.getTemplateWithName("record-detail-list-item");
            newElement.click(() => {
                var delegator = <BulgingDiffPageDelegator>DiffPageDelegator.Instance;
                delegator.highlightRecordPair(recordPair)
                delegator.openCellLevelDiffTable();
            });

            this.refresh(newElement, recordPair);
            return newElement;
        }

        refresh(jqElement: JQuery, recordPair: RecordPair) {
            jqElement.attr("data-applied", RecordResolveStatus[recordPair.ResolveStatus]);
            $("[name=title]", jqElement).text("Row " + (recordPair.RowIdInExcel < Number.MAX_VALUE ? (recordPair.RowIdInExcel + 2).toString() : "?"));

            var explanationText: string;
            switch (recordPair.DiffStatus) {
                case DiffStatus.OnlyOnOData:
                    explanationText = "This row only exists in OData."
                    break;
                case DiffStatus.OnlyOnLocal:
                    explanationText = "This row only exists in Excel."
                    break;
                case DiffStatus.Different:
                    {
                        var diffCellCount = recordPair.getAllCellDiffInfo().length;
                        if (diffCellCount <= 1) {
                            explanationText = diffCellCount + " different cell in this row."
                        } else {
                            explanationText = diffCellCount + " different cells in this row."
                        }
                    }
                    break;
            }

            $("[name=explanation]", jqElement).text(explanationText);
        }
    }

    class CellListPanelAnimater {
        private recordDiffList: RecordDiffList;

        private cellDiffInfoList: CellDiffInfoList;

        private onHighlightedRecordChanged: () => void;
        private onRecordListAnimationDone: () => void;
        private autoOpen: boolean;

        constructor(recordDiffList: RecordDiffList) {
            this.recordDiffList = recordDiffList;
            this.onRecordListAnimationDone = () => this.startAnimate();
            this.onHighlightedRecordChanged = () => {
                if (!this.autoOpen || this.getActiveRecord() !== DiffPageDelegator.Instance.getHighlightedRecord()) {
                    this.retract();
                }
            };

            this.markAsAutoOpen(true);
        }

        public markAsAutoOpen(autoOpen: boolean) {
            if (!this.autoOpen === !autoOpen) {
                return;
            }

            this.autoOpen = !!autoOpen;

            var recordListAnimatingNumber = this.recordDiffList.getBulgingAnimatingNumber();
            if (autoOpen) {
                recordListAnimatingNumber.addCallbackForTargetChanged(this.onHighlightedRecordChanged);
                recordListAnimatingNumber.addCallbackForDone(this.onRecordListAnimationDone);
            } else {
                recordListAnimatingNumber.removeCallbackForTargetChanged(this.onHighlightedRecordChanged);
                recordListAnimatingNumber.removeCallbackForDone(this.onRecordListAnimationDone);
                this.retract();
            }
        }

        private getActiveRecord() {
            if (this.cellDiffInfoList) {
                return this.cellDiffInfoList.getCurrentRecord();
            }
        }

        private retract() {
            if (this.cellDiffInfoList) {
                var cellDiffTable = this.cellDiffInfoList;
                this.cellDiffInfoList = undefined;

                cellDiffTable.JQElement.hide({
                    duration: 400,
                    done: () => {
                        cellDiffTable.JQElement.remove();
                        cellDiffTable.setRecordToDiff(undefined);
                    }
                });
            }
        }

        private startAnimate() {
            var highlightedRecord = DiffPageDelegator.Instance.getHighlightedRecord();
            if (!this.autoOpen || this.getActiveRecord() === highlightedRecord) {
                return;
            }
            this.retract();

            if (!highlightedRecord) {
                return;
            }

            this.cellDiffInfoList = new CellDiffInfoList(UX.Helpers.getTemplateWithName("cell-list"));
            this.cellDiffInfoList.setRecordToDiff(highlightedRecord);
            this.recordDiffList.getElementByData(highlightedRecord).append(this.cellDiffInfoList.JQElement);
            this.cellDiffInfoList.JQElement.show({
                duration: 400,
                progress: () => {
                    this.recordDiffList.ensureBulgedItemInView();
                }
            });
        }
    }
}