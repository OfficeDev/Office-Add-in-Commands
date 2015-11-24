var ODSampleData;
(function (ODSampleData) {
    var Diff;
    (function (Diff) {
        function differentiate(dataFeed) {
            dataFeed.getAllRecordPairs().filter(isWaitingForCompare).forEach(differentiateRecordPair);
        }
        Diff.differentiate = differentiate;
        function isWaitingForCompare(recordPair) {
            return (recordPair.DiffStatus === ODSampleData.DiffStatus.WaitingForCompare);
        }
        function differentiateRecordPair(recordPair) {
            var diff = false;
            recordPair.clearAllCellDiffInfo();
            if (recordPair.ExcelRowData && recordPair.ODataRowData) {
                recordPair.DataFeed.Headers.forEach(function (columnName) {
                    if (recordPair.ExcelRowData[columnName] != recordPair.ODataRowData[columnName]) {
                        diff = true;
                        recordPair.setCellDiffInfo(new ODSampleData.CellDiffInfo(recordPair, columnName));
                    }
                });
                recordPair.DiffStatus = diff ? ODSampleData.DiffStatus.Different : ODSampleData.DiffStatus.NoDiff;
            }
            else if (recordPair.ExcelRowData) {
                recordPair.setCellDiffInfo(new ODSampleData.CellDiffInfo(recordPair, ODSampleData.CellDiffInfo.ColumnNameForWholeRow));
                recordPair.DiffStatus = ODSampleData.DiffStatus.OnlyOnLocal;
            }
            else if (recordPair.ODataRowData) {
                recordPair.setCellDiffInfo(new ODSampleData.CellDiffInfo(recordPair, ODSampleData.CellDiffInfo.ColumnNameForWholeRow));
                recordPair.DiffStatus = ODSampleData.DiffStatus.OnlyOnOData;
            }
            else {
                recordPair.DiffStatus = ODSampleData.DiffStatus.NoData;
            }
        }
    })(Diff = ODSampleData.Diff || (ODSampleData.Diff = {}));
})(ODSampleData || (ODSampleData = {}));
//# sourceMappingURL=Diff.js.map