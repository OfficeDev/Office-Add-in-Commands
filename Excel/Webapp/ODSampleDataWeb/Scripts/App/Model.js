var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Model;
(function (Model) {
    var DataItem = (function (_super) {
        __extends(DataItem, _super);
        function DataItem() {
            var _this = this;
            _super.call(this);
            this._notifier = new Utility.CallLater(function () {
                _this.innerNotify();
            });
        }
        DataItem.prototype.setDataManager = function (newManager) {
            var originalManager = this._dataManager;
            if (originalManager === newManager) {
                return;
            }
            this.flushNotification();
            this._dataManager = newManager;
            if (originalManager) {
                originalManager.removeData(this);
            }
            if (newManager) {
                newManager.addData(this);
            }
        };
        DataItem.prototype.getDataManager = function () {
            return this._dataManager;
        };
        DataItem.prototype.notifyUpdateLater = function () {
            this._notifier.callOnceLater();
        };
        DataItem.prototype.flushNotification = function () {
            this._notifier.flush();
        };
        DataItem.prototype.notifyUpdateImmediately = function () {
            this._notifier.callImmediately();
        };
        DataItem.prototype.removeFromDataManager = function () {
            if (this._dataManager) {
                this.flushNotification();
                this._dataManager.removeData(this);
            }
        };
        DataItem.prototype.innerNotify = function () {
            if (this._dataManager) {
                this._dataManager.onDataUpdated(this);
            }
        };
        return DataItem;
    })(Utility.ObjectBase);
    Model.DataItem = DataItem;
    var DataManager = (function () {
        function DataManager() {
            this._dataSet = new Utility.ObjectSet();
            this._observerMap = {};
        }
        DataManager.prototype.getAllData = function () {
            return this._dataSet.toArray();
        };
        DataManager.prototype.addData = function (data) {
            if (!this._dataSet.has(data)) {
                this._dataSet.add(data);
                data.setDataManager(this);
                data.notifyUpdateLater();
            }
        };
        DataManager.prototype.removeData = function (data) {
            if (this._dataSet.has(data)) {
                this._dataSet.remove(data);
                this.forEachObserverHelper(function (helper) {
                    helper.unobserve(data);
                });
            }
        };
        DataManager.prototype.onDataUpdated = function (data) {
            if (this._dataSet.has(data)) {
                this.forEachObserverHelper(function (helper) {
                    helper.onUpdated(data);
                });
            }
        };
        DataManager.prototype.addObserver = function (observer) {
            if (!observer) {
                return;
            }
            var observerId = observer._getId();
            if (!this._observerMap[observerId]) {
                var helper = new ObserverHelper(observer);
                this._observerMap[observerId] = helper;
                this._dataSet.forEach(function (data) {
                    helper.observeIfAccepted(data);
                });
            }
        };
        DataManager.prototype.updateObserver = function (observer) {
            if (!observer) {
                return;
            }
            var observerId = observer._getId();
            var helper = this._observerMap[observerId];
            if (helper) {
                this._dataSet.forEach(function (data) {
                    helper.onUpdated(data);
                });
            }
        };
        DataManager.prototype.removeObserver = function (observer) {
            if (!observer) {
                return;
            }
            var observerId = observer._getId();
            var helper = this._observerMap[observerId];
            if (helper) {
                delete this._observerMap[observerId];
                helper.unobserveAll();
            }
        };
        DataManager.prototype.forEachObserverHelper = function (callback) {
            Utility.MapEx.forEach(this._observerMap, callback);
        };
        return DataManager;
    })();
    Model.DataManager = DataManager;
    var ObserverHelper = (function (_super) {
        __extends(ObserverHelper, _super);
        function ObserverHelper(observer) {
            _super.call(this);
            this.observer = observer;
            this.observedData = new Utility.ObjectSet();
            if (observer.setDataItemSetObject) {
                observer.setDataItemSetObject(this.observedData);
            }
        }
        ObserverHelper.prototype.observeIfAccepted = function (data) {
            if (data && !this.observedData.has(data) && this.observer.filter(data)) {
                this.innerObserve(data);
            }
        };
        ObserverHelper.prototype.unobserve = function (data) {
            if (this.observedData.has(data)) {
                this.innerUnobserve(data);
            }
        };
        ObserverHelper.prototype.unobserveAll = function () {
            var _this = this;
            this.observedData.forEach(function (data) {
                _this.innerUnobserve(data);
            });
        };
        ObserverHelper.prototype.onUpdated = function (data) {
            var hasBeenObserved = this.observedData.has(data);
            var needsToBeObserved = this.observer.filter(data);
            if (hasBeenObserved === needsToBeObserved) {
                if (hasBeenObserved && this.observer.onUpdated) {
                    this.observer.onUpdated(data);
                }
            }
            else if (needsToBeObserved) {
                this.innerObserve(data);
            }
            else {
                this.innerUnobserve(data);
            }
        };
        ObserverHelper.prototype.innerObserve = function (data) {
            this.observedData.add(data);
            if (this.observer.onObserved) {
                this.observer.onObserved(data);
            }
        };
        ObserverHelper.prototype.innerUnobserve = function (data) {
            this.observedData.remove(data);
            if (this.observer.onUnobserved) {
                this.observer.onUnobserved(data);
            }
        };
        return ObserverHelper;
    })(Utility.ObjectBase);
    var ItemCounter = (function (_super) {
        __extends(ItemCounter, _super);
        function ItemCounter(filter, callback) {
            _super.call(this);
            this.innerFilter = filter;
            this.callback = callback;
            this.callback(0);
        }
        ItemCounter.prototype.filter = function (data) {
            return this.innerFilter(data);
        };
        ItemCounter.prototype.onObserved = function (data) {
            this.callback(this.dataItemSet.Count);
        };
        ItemCounter.prototype.onUnobserved = function (data) {
            this.callback(this.dataItemSet.Count);
        };
        ItemCounter.prototype.setDataItemSetObject = function (dataItemSetObject) {
            this.dataItemSet = dataItemSetObject;
        };
        return ItemCounter;
    })(Utility.ObjectBase);
    Model.ItemCounter = ItemCounter;
    var OnNewOrChanged = (function (_super) {
        __extends(OnNewOrChanged, _super);
        function OnNewOrChanged(filter, callback) {
            _super.call(this);
            this.filter = filter;
            this.callback = callback;
        }
        OnNewOrChanged.prototype.onObserved = function (data) {
            this.callback(data);
        };
        OnNewOrChanged.prototype.onUpdated = function (data) {
            this.callback(data);
        };
        return OnNewOrChanged;
    })(Utility.ObjectBase);
    Model.OnNewOrChanged = OnNewOrChanged;
    var OnChanged = (function (_super) {
        __extends(OnChanged, _super);
        function OnChanged(filter, callback) {
            _super.call(this);
            this.filter = filter;
            this.callback = callback;
        }
        OnChanged.prototype.onUpdated = function (data) {
            this.callback(data);
        };
        return OnChanged;
    })(Utility.ObjectBase);
    Model.OnChanged = OnChanged;
})(Model || (Model = {}));
//# sourceMappingURL=Model.js.map