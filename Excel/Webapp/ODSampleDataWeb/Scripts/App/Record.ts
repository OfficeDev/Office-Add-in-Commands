module ODSampleData {
    export class RecordItem extends Utility.StringMap<any> {
    }

    export class RecordPair extends Model.DataItem {
        private dataFeed: DataFeed;
        private id: any;
        private rowIdInExcel: number = Number.MAX_VALUE;
        private excelRowData: RecordItem;
        private oDataRowData: RecordItem;

        private cellDiffInfoManager: Model.DataManager;
        private rowDiffTable: Utility.StringMap<CellDiffInfo> = {};

        private rowDiffStatus: DiffStatus;
        private resolveStatus: RecordResolveStatus = RecordResolveStatus.NoDiff;

        constructor(dataFeed: DataFeed, id: any) {
            super();
            this.dataFeed = dataFeed;
            this.id = id;

            this.cellDiffInfoManager = new Model.DataManager();
            this.cellDiffInfoManager.addObserver(
                new Model.OnChanged(
                    () => true,
                    () => this.updateResolveStatus()));
        }

        public get DataFeed(): DataFeed {
            return this.dataFeed;
        }

        public get Id(): any {
            return this.id;
        }

        public get RowIdInExcel(): number {
            return this.rowIdInExcel;
        }

        public set RowIdInExcel(value: number) {
            if (this.rowIdInExcel !== value) {
                this.rowIdInExcel = value;

                this.notifyUpdateLater();
                this.getAllCellDiffInfo().forEach((cellDiffInfo: CellDiffInfo) => {
                    cellDiffInfo.notifyUpdateLater();
                });
            }
        }

        public get ExcelRowData(): RecordItem {
            return this.excelRowData;
        }

        public set ExcelRowData(value: RecordItem) {
            if (value !== this.excelRowData) {
                this.excelRowData = value;
                this.rowDiffStatus = DiffStatus.WaitingForCompare;
                this.notifyUpdateLater();
            }
        }

        public get ODataRowData(): RecordItem {
            return this.oDataRowData;
        }

        public set ODataRowData(value: RecordItem) {
            if (value !== this.oDataRowData) {
                this.oDataRowData = value;
                this.rowDiffStatus = DiffStatus.WaitingForCompare;
                this.notifyUpdateLater();
            }
        }

        public get DiffStatus(): DiffStatus {
            return this.rowDiffStatus;
        }

        public set DiffStatus(value: DiffStatus) {
            if (value !== this.rowDiffStatus) {
                this.rowDiffStatus = value;
                this.notifyUpdateLater();
            }
        }

        public get ResolveStatus() {
            return this.resolveStatus;
        }

        public get RowDiffTable(): Utility.StringMap<CellDiffInfo> {
            return this.rowDiffTable;
        }

        public getCellDiffInfo(key: string): CellDiffInfo {
            return this.rowDiffTable[key];
        }

        public getAllCellDiffInfo(): CellDiffInfo[] {
            return Utility.MapEx.toArray(this.rowDiffTable);
        }

        public setCellDiffInfo(value: CellDiffInfo) {
            var columnName = value.ColumnName;
            if (this.rowDiffTable[columnName] !== value) {
                if (this.rowDiffTable[columnName]) {
                    this.cellDiffInfoManager.removeData(this.rowDiffTable[columnName]);
                }

                if (value) {
                    this.rowDiffTable[columnName] = value;
                    this.cellDiffInfoManager.addData(value);
                } else {
                    delete this.rowDiffTable[columnName];
                }

                this.updateResolveStatus();
                this.notifyUpdateLater();
            }
        }

        public clearAllCellDiffInfo() {
            var allCellDiffInfo = this.getAllCellDiffInfo();

            if (allCellDiffInfo.length > 0) {

                allCellDiffInfo.forEach((cellDiffInfo: CellDiffInfo) => {
                    this.cellDiffInfoManager.removeData(cellDiffInfo);
                });

                this.rowDiffTable = {};
                this.updateResolveStatus();
                this.notifyUpdateLater();
            }
        }

        public addObserverForCellDiffInfo(observer: Model.IObserver) {
            this.cellDiffInfoManager.addObserver(observer);
        }

        public removeObserverForCellDiffInfo(observer: Model.IObserver) {
            this.cellDiffInfoManager.removeObserver(observer);
        }

        public get Format() {
            if (this.getAllCellDiffInfo().length === 0) {
                return undefined;
            }

            var rowId = this.RowIdInExcel;
            var format = [{ cells: { row: rowId }, format: { backgroundColor: "#FFFACD" } }];

            this.DataFeed.Headers.forEach((header, index) => {
                var cell = this.rowDiffTable[header];
                if (cell) {
                    format.push({ cells: { row: rowId, column: index }, format: { backgroundColor: cell.UsingODataValue ? "#9dcbeb" : "#c6efce" } });
                }
            });

            return format;
        }

        private updateResolveStatus() {
            var resolveStatus = this.getCurrentResolveStatus();
            if (this.resolveStatus !== resolveStatus) {
                this.resolveStatus = resolveStatus;
                this.notifyUpdateLater();
            }
        }

        private getCurrentResolveStatus(): RecordResolveStatus {
            var usingODataValueInEachCell = this.getAllCellDiffInfo().map(cellDiff => cellDiff.UsingODataValue);

            var resolveStatus = RecordResolveStatus.Mixed;
            if (usingODataValueInEachCell.every(usingOData => !usingOData)) {
                resolveStatus = RecordResolveStatus.Excel;
            } else if (usingODataValueInEachCell.every(usingOData => usingOData)) {
                resolveStatus = RecordResolveStatus.OData;
            }

            return resolveStatus;
        } 
    }

    export enum DiffStatus {
        WaitingForCompare,
        NoDiff,
        NoData,
        OnlyOnLocal,
        OnlyOnOData,
        Different,
    }

    export enum RecordResolveStatus {
        NoDiff,
        Mixed,
        Excel,
        OData,
    }

    export class CellDiffInfo extends Model.DataItem {
        private recordPair: RecordPair;
        private columnName: string;
        private excelValueSnapshot: any;
        private oDataValue: any;
        private usingODataValue: boolean = false;

        constructor(recordPair: RecordPair, columnName: string) {
            super();

            this.recordPair = recordPair;
            this.columnName = columnName;

            if (columnName === CellDiffInfo.ColumnNameForWholeRow) {
                this.excelValueSnapshot = !!recordPair.ExcelRowData;
                this.oDataValue = !!recordPair.ODataRowData;
            } else {
                this.excelValueSnapshot = recordPair.ExcelRowData[columnName];
                this.oDataValue = recordPair.ODataRowData[columnName];
            }
        }

        public static get ColumnNameForWholeRow() {
            return "{971FDA3B-423A-40B1-A854-F501CC5460B3}";
        }

        public get RecordPair(): RecordPair {
            return this.recordPair;
        }

        public get ExcelValueSnapshot(): any {
            return this.excelValueSnapshot;
        }

        public get ODataValue(): any {
            return this.oDataValue;
        }

        public get ColumnName(): string {
            return this.columnName;
        }

        public get UsingODataValue(): boolean {
            return !!this.usingODataValue;
        }

        public set UsingODataValue(value: boolean) {
            if (!this.usingODataValue !== !value) {
                this.usingODataValue = value;
                this.notifyUpdateLater();
            }
        }
    }
}
