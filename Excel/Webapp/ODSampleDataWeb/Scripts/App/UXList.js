var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var UX;
(function (UX) {
    var ListItem = (function () {
        function ListItem(data, itemArtist) {
            this.data = data;
            this.itemArtist = itemArtist;
            this.jqElement = itemArtist.newJQuery(data);
            this.jqElement.attr("ObjectId", data._getId());
        }
        ListItem.getObjectFromJQueryElement = function (jqElement) {
            return jqElement.attr("ObjectId");
        };
        Object.defineProperty(ListItem.prototype, "DataObject", {
            get: function () {
                return this.data;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListItem.prototype, "JQElement", {
            get: function () {
                return this.jqElement;
            },
            enumerable: true,
            configurable: true
        });
        ListItem.prototype.refresh = function () {
            if (this.itemArtist.refresh) {
                this.itemArtist.refresh(this.jqElement, this.data);
            }
        };
        ListItem.prototype.remove = function () {
            this.jqElement.remove();
        };
        return ListItem;
    })();
    var List = (function (_super) {
        __extends(List, _super);
        function List(listItemArtist, jqElement, comparer) {
            var _this = this;
            _super.call(this);
            this.innerFilter = function () { return false; };
            this.listItemArtist = listItemArtist;
            this.comparer = comparer;
            this.jqElement = jqElement || $("<div/>");
            this.items = new Utility.StringMap();
            this.sortLater = new Utility.CallLater(function () {
                _this.sortElements();
            });
            this.dataObjects = [];
        }
        Object.defineProperty(List.prototype, "JQElement", {
            get: function () {
                return this.jqElement;
            },
            enumerable: true,
            configurable: true
        });
        List.prototype.getFilter = function () {
            return this.innerFilter;
        };
        List.prototype.setFilter = function (value) {
            if (this.innerFilter !== value) {
                this.innerFilter = value;
            }
        };
        List.prototype.filter = function (data) {
            return this.innerFilter(data);
        };
        List.prototype.onObserved = function (data) {
            if (data) {
                var newItem = new ListItem(data, this.listItemArtist);
                this.jqElement.append(newItem.JQElement);
                this.items[data._getId()] = newItem;
                this.dataObjects.push(data);
                this.sortLater.callOnceLater();
            }
        };
        List.prototype.onUnobserved = function (data) {
            if (data) {
                var dataId = data._getId();
                var subElementToRemove = this.getItemByDataId(dataId);
                if (subElementToRemove) {
                    delete this.items[dataId];
                    subElementToRemove.remove();
                }
                var index = this.dataObjects.indexOf(data);
                if (index >= 0) {
                    this.dataObjects.splice(this.dataObjects.indexOf(data), 1);
                }
            }
        };
        List.prototype.onUpdated = function (data) {
            if (data) {
                var item = this.getItemByDataId(data._getId());
                if (item) {
                    item.refresh();
                    this.sortLater.callOnceLater();
                }
            }
        };
        List.prototype.remove = function () {
            this.sortLater.clear();
            for (var i in this.items) {
                this.items[i].remove();
                delete this.items[i];
            }
            this.jqElement.remove();
        };
        List.prototype.getDataObjects = function () {
            return this.dataObjects;
        };
        List.prototype.sortElementsImmediately = function () {
            this.sortLater.callImmediately();
        };
        List.prototype.getElementByData = function (data) {
            if (!data) {
                return undefined;
            }
            var item = this.getItemByDataId(data._getId());
            if (!item) {
                return undefined;
            }
            return item.JQElement;
        };
        List.prototype.virtual_onItemsSorted = function () {
        };
        List.prototype.getItemByDataId = function (dataId) {
            return this.items[dataId];
        };
        List.prototype.sortElements = function () {
            var _this = this;
            if (this.comparer) {
                var unsortedDataObjects = this.dataObjects.concat();
                this.dataObjects.sort(this.comparer);
                if (this.dataObjects.some(function (value, index) { return unsortedDataObjects[index] !== value; })) {
                    this.dataObjects.forEach(function (data) {
                        var jqItemElement = _this.getItemByDataId(data._getId()).JQElement;
                        jqItemElement.appendTo(_this.jqElement);
                    });
                    this.virtual_onItemsSorted();
                }
            }
        };
        return List;
    })(Utility.ObjectBase);
    UX.List = List;
})(UX || (UX = {}));
//# sourceMappingURL=UXList.js.map