<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Home.aspx.cs" Inherits="ODSampleDataWeb.App.Home.Home" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <title>Home</title>
    <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.9.1.min.js" type="text/javascript"></script>
    <script src="https://ajax.aspnetcdn.com/ajax/bootstrap/3.3.4/bootstrap.min.js"></script>

    <script src="../Scripts/App/Utility.js" type="text/javascript"></script>
    <script src="../Scripts/App/Model.js" type="text/javascript"></script>
    <script src="../Scripts/App/UXList.js" type="text/javascript"></script>
    <script src="../Scripts/App/UXHelpers.js" type="text/javascript"></script>
    <script src="../Scripts/App/Record.js" type="text/javascript"></script>
    <script src="../Scripts/App/DataSource.js" type="text/javascript"></script>
    <script src="../Scripts/App/DataHelper.js" type="text/javascript"></script>
    <script src="../Scripts/App/Diff.js" type="text/javascript"></script>
    <script src="../Scripts/App/Uploader.js" type="text/javascript"></script>
    <script src="../Scripts/App/ExcelWriter.js" type="text/javascript"></script>
    <script src="../Scripts/App/ExtendTable.js" type="text/javascript"></script>
    <script src="../Scripts/App/Math_2d.js" type="text/javascript"></script>
    <script src="../Scripts/App/Animation.js" type="text/javascript"></script>
    <script src="../Scripts/App/UX.js" type="text/javascript"></script>
    <script src="../Scripts/App/UX.DiffPage.js" type="text/javascript"></script>
    <script src="../Scripts/App/UX.BulgingDiffPage.js" type="text/javascript"></script>
    <script src="../Scripts/App/App.js" type="text/javascript"></script>
    <script src="../Scripts/Office/1.1/office.debug.js" type="text/javascript"></script>

    <%--<script src="https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js" type="text/javascript"></script>--%>

    <link href="../Content/App.css" rel="stylesheet" type="text/css" />
    <link href="https://ajax.aspnetcdn.com/ajax/bootstrap/3.3.4/css/bootstrap.min.css" rel="stylesheet" />
    <link href="../Content/Office.css" rel="stylesheet" type="text/css" />
</head>
<body>
    <form id="form1" runat="server">
        <asp:ScriptManager ID="ScriptMgr" runat="server" EnablePageMethods="true"></asp:ScriptManager>
    </form>
    <div class="panel panel-default">
        <div class="panel-heading modes mode-list" style="display:none">
            <img alt="Brand" src="../../Images/odata_logo.png" />
        </div>
        <div class="loading" style="display:none">Loading...</div>
        <div class="panel-body loaded non-expandtable-area">
            <div id="list-page" class="modes mode-list" style="display: none">
                <div class="panel-title">Please select data you want to import</div>
                <div class="form-group">
                    <input id="search" type="text" class="form-control" placeholder="Search a data feed" />
                </div>
                <div id="catalog-button-container"></div>
                <div id="data-source-list"></div>
            </div>
            <div id="detail-page" class="modes mode-detail" style="display: none">
                <div class="section-card">
                    <div id="detail-source-name" class="font-size-18"></div>
                    <div class="font-size-12 gray"><span>Last Sync: </span><span id="detail-source-last-sync-time"></span></div>
                </div>
                <button id="import-data-feed" class="detail-button">
                    <div class="table-cell detail-button-image"></div>
                    <div class="table-cell detail-button-explanation">
                        <div class="title">Get from OData</div>
                        <div class="font-size-12">Get the latest data from OData. Please note the latest OData value will override all values in this Excel file.</div>
                    </div>
                </button>
                <button id="save-to-odata" class="detail-button">
                    <div class="table-cell detail-button-image"></div>
                    <div class="table-cell detail-button-explanation">
                        <div class="title">Save to OData</div>
                        <div class="font-size-12">Save all Excel values to OData. Please note the Excel data will override all values in OData.</div>
                    </div>
                </button>
                <button id="diff-data-feed" class="detail-button">
                    <div class="table-cell detail-button-image"></div>
                    <div class="table-cell detail-button-explanation">
                        <div class="title">Compare and Save</div>
                        <div class="font-size-12">Compare Excel values with latest OData values. You can save the data to OData after resolving differences.</div>
                    </div>
                </button>
                <button id="expandtable-button" class="detail-button">
                    <div class="table-cell detail-button-image"></div>
                    <div class="table-cell detail-button-explanation">
                        <div class="title">View Reference Data</div>
                        <div class="font-size-12">See the reference data of the selected cell.</div>
                    </div>
                </button>
            </div>
            <div id="diff-page" class="modes mode-diff" style="display: none">
                <input id="back-to-detail" type="image" src="../Images/back_button.png" />
                <div class="section-card non-bulging-list">
                    <div>
                        <span>Table name: </span>
                        <span id="data-feed-name"></span>
                    </div>
                    <div>
                        <span>Sync Time: </span>
                        <span id="data-feed-last-sync-time"></span>
                    </div>
                </div>
                <div class="section-card without-diff">
                    <div class="font-size-14 bold">No Differences</div>
                </div>
                <div id="diff-section-card" class="section-card with-diff">
                    <div class="list-title-container">
                        <div class="tabel-cell left-part">
                            <div id="diff-row-count" class="font-size-28 bold">#</div>
                        </div>
                        <div class="table-cell vertical-align-top">
                            <div id="record-list-title" class="font-size-14 bold">Row with Differences</div>
                            <div class="font-size-10">Select row to see details in the second table.</div>
                        </div>
                    </div>
                    <div id="record-detail-list" class="bulging-list record-list font-size-16"></div>
                    <div id="record-list" class="non-bulging-list">
                        <div class="list-header row">
                            <div class="col-xs-6">Row Number</div>
                            <div class="col-xs-6">Use Value From</div>
                        </div>
                    </div>
                </div>
                <div class="section-card non-bulging-list with-diff">
                    <div id="cell-list-title-bar">
                        <div id="cell-list-title-container" class="list-title-container">
                            <div id="cell-list-title" class="font-size-14 bold">Row # Details</div>
                            <div class="font-size-10">Choose which value to keep.</div>
                        </div>
                    </div>
                    <div id="cell-list" class="cell-list">
                        <div class="list-header row">
                            <div class="col-xs-4">Column</div>
                            <div class="resolve-all-to-excel col-xs-4 clickable cell-list-block">
                                <form>
                                    <input type="radio" name="all-using-excel" onclick="return false;" />
                                </form>
                                <div>Excel</div>
                            </div>
                            <div class="resolve-all-to-OData col-xs-4 clickable cell-list-block">
                                <form>
                                    <input type="radio" name="all-using-OData" onclick="return false;" />
                                </form>
                                <div>OData</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="section-card with-diff resolve-all-section">
                    <button type="button" class="resolve-all-row-to-excel resolve-button">
                        <img src="../Images/Use_Excel_for_all_icon_default.png" />
                        <span>Use Excel For All Differences</span>
                    </button>
                    <div></div>
                    <button type="button" class="resolve-all-row-to-OData resolve-button">
                        <img src="../Images/Use_OData_for_all_icon_default.png" />
                        <span>Use OData For All Differences</span>
                    </button>
                </div>
            </div>
        </div>
        <div class="panel-footer loaded non-expandtable-area modes mode-list mode-diff" style="display: none">
            <button id="connect-data-feed" type="button" class="btn btn-primary modes mode-list">Connect</button>
            <button id="upload-data-feed" type="button" class="btn btn-primary modes mode-diff" disabled="disabled">Again</button>
        </div>
        <div class="expandtable-area" style="display: none">
            <input id="back-to-detail-from-extandtable" type="image" src="../Images/back_button.png" />
            <div id="expandtable-message" class="font-size-21">Reference Data</div>
            <div id="expandtable-table">
                <div id="expandtable-name" class="font-size-18">Table Name</div>
                <table id="expandtable-datatable">
                </table>
            </div>
        </div>
    </div>
    <div id="templates" style="display: none;">
        <div class="template-data-feed-card data-feed-card section-card clickable">
            <div name="name" class="font-size-18">Purchase Order</div>
            <div class="font-size-12 gray">
                <span>Last Sync:</span>
                <span name="last-sync-time">2015/02/28 12:34:23</span>
                <button name="detail-button" type="button" class="data-feed-detail-button link-button">
                    <span name="detail-button-text">Show more</span>
                    <span name="detail-button-icon" class="glyphicon glyphicon-menu-down"></span>
                </button>
            </div>
            <div name="detail" class="data-feed-detail font-size-12" style="display: none;">
                <div>Column titles:</div>
                <div name="columns" class="columns"></div>
            </div>
        </div>
        <div class="template-record-list-row record-list-row row clickable">
            <div name="row-id" class="col-xs-6"></div>
            <div name="resolved-as" class="col-xs-6"></div>
        </div>
        <div class="template-record-detail-list-item" data-applied="Excel">
            <div class="transform-item data-color record-list-item">
                <div name="title" class="record-item-title">Row #</div>
                <div name="explanation" class="record-item-explanation font-size-14"></div>
            </div>
        </div>
        <div class="template-cell-list cell-list" style="display: none">
            <div class="list-header row">
                <div class="col-xs-4">Column</div>
                <div class="resolve-all-to-excel col-xs-4 clickable cell-list-block">
                    <form>
                        <input type="radio" name="all-using-excel" onclick="return false;" />
                    </form>
                    <div>Excel</div>
                </div>
                <div class="resolve-all-to-OData col-xs-4 clickable cell-list-block">
                    <form>
                        <input type="radio" name="all-using-OData" onclick="return false;" />
                    </form>
                    <div>OData</div>
                </div>
            </div>
        </div>
        <div class="template-cell-list-row cell-list-row row">
            <div name="column-name" class="col-xs-4"></div>
            <div name="excel-data-block" class="col-xs-4 clickable cell-list-block">
                <form>
                    <input type="radio" name="using-excel" onclick="return false" />
                </form>
                <div name="excel-data"></div>
            </div>
            <div name="OData-data-block" class="col-xs-4 clickable cell-list-block">
                <form>
                    <input type="radio" name="using-OData" onclick="return false" />
                </form>
                <div name="OData-data"></div>
            </div>
        </div>
    </div>

</body>
</html>
