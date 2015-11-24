var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var UT;
(function (UT) {
    var Helpers;
    (function (Helpers) {
        var Observer = (function (_super) {
            __extends(Observer, _super);
            function Observer(filter) {
                _super.call(this);
                this.innerFilter = filter;
            }
            Observer.prototype.filter = function (data) {
                return this.innerFilter(data);
            };
            Observer.prototype.onObserved = function (data) { };
            Observer.prototype.onUpdated = function (data) { };
            Observer.prototype.onUnobserved = function (data) { };
            Observer.prototype.setDataItemSetObject = function (dataItemSetObject) { };
            return Observer;
        })(Utility.ObjectBase);
        Helpers.Observer = Observer;
        var Data = (function (_super) {
            __extends(Data, _super);
            function Data(value) {
                _super.call(this);
                this.value = value;
            }
            return Data;
        })(Model.DataItem);
        Helpers.Data = Data;
        var NumberData = (function (_super) {
            __extends(NumberData, _super);
            function NumberData() {
                _super.apply(this, arguments);
            }
            return NumberData;
        })(Data);
        Helpers.NumberData = NumberData;
        ;
        var StringData = (function (_super) {
            __extends(StringData, _super);
            function StringData() {
                _super.apply(this, arguments);
            }
            return StringData;
        })(Data);
        Helpers.StringData = StringData;
        ;
    })(Helpers = UT.Helpers || (UT.Helpers = {}));
})(UT || (UT = {}));
//# sourceMappingURL=ut_helpers.js.map