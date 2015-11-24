module ODSampleData.Diff {
    export function differentiate(dataFeed: DataFeed) {
        dataFeed.getAllRecordPairs().filter(isWaitingForCompare).forEach(differentiateRecordPair);
    }

    function isWaitingForCompare(recordPair: RecordPair) {
        return (recordPair.DiffStatus === DiffStatus.WaitingForCompare);
    }

    function differentiateRecordPair(recordPair: RecordPair) {
        var diff = false;
        recordPair.clearAllCellDiffInfo();

        if (recordPair.ExcelRowData && recordPair.ODataRowData) {
            recordPair.DataFeed.Headers.forEach((columnName: string) => {
                if (recordPair.ExcelRowData[columnName] != recordPair.ODataRowData[columnName]) {
                    diff = true;
                    recordPair.setCellDiffInfo(new CellDiffInfo(recordPair, columnName));
                }
            });

            recordPair.DiffStatus = diff ? DiffStatus.Different : DiffStatus.NoDiff;
        } else if (recordPair.ExcelRowData) {
            recordPair.setCellDiffInfo(new CellDiffInfo(recordPair, CellDiffInfo.ColumnNameForWholeRow));
            recordPair.DiffStatus = DiffStatus.OnlyOnLocal;
        } else if (recordPair.ODataRowData) {
            recordPair.setCellDiffInfo(new CellDiffInfo(recordPair, CellDiffInfo.ColumnNameForWholeRow));
            recordPair.DiffStatus = DiffStatus.OnlyOnOData;
        } else {
            recordPair.DiffStatus = DiffStatus.NoData;
        }
    }
}