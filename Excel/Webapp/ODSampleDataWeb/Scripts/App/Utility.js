var Utility;
(function (Utility) {
    var Debugging = (function () {
        function Debugging() {
        }
        Debugging.runtimeError = function (message) {
            throw Error(message);
        };
        Debugging.assert = function (expression, message) {
            if (!expression) {
                Debugging.runtimeError(message);
            }
        };
        return Debugging;
    })();
    Utility.Debugging = Debugging;
    var StringEx;
    (function (StringEx) {
        function replaceCharAt(str, index, replacement) {
            return str.substring(0, index) + replacement + str.substring(index + 1);
        }
        StringEx.replaceCharAt = replaceCharAt;
        function fillPrefixToLength(str, targetLength, prefix) {
            var currentLength = str.length;
            var prefixLength = prefix.length;
            for (; currentLength < targetLength; currentLength += prefixLength) {
                str = prefix + str;
            }
            return str;
        }
        StringEx.fillPrefixToLength = fillPrefixToLength;
    })(StringEx = Utility.StringEx || (Utility.StringEx = {}));
    var StringMap = (function () {
        function StringMap() {
        }
        return StringMap;
    })();
    Utility.StringMap = StringMap;
    var MapEx;
    (function (MapEx) {
        function forEach(map, callback) {
            var key;
            for (key in map) {
                callback(map[key], key);
            }
        }
        MapEx.forEach = forEach;
        function allKeys(map) {
            var result = [];
            MapEx.forEach(map, function (value, key) {
                result.push(key);
            });
            return result;
        }
        MapEx.allKeys = allKeys;
        function toArray(map) {
            var result = [];
            MapEx.forEach(map, function (value) {
                result.push(value);
            });
            return result;
        }
        MapEx.toArray = toArray;
    })(MapEx = Utility.MapEx || (Utility.MapEx = {}));
    var ObjectEx;
    (function (ObjectEx) {
        function getClassNameOf(obj) {
            var funcionNameRegex = /function (.{1,})\(/;
            var results = (funcionNameRegex).exec(obj["constructor"].toString());
            return (results && results.length > 1) ? results[1] : "Unknown_Class";
        }
        ObjectEx.getClassNameOf = getClassNameOf;
    })(ObjectEx = Utility.ObjectEx || (Utility.ObjectEx = {}));
    var Guid;
    (function (Guid) {
        var charSetChecker = /^[0-9a-fA-F\-]*$/;
        var formatChecker = /^[^\-]{8}(\-[^\-]{4}){4}[^\-]{8}$/;
        function isValidGuid(guid) {
            return charSetChecker.test(guid) &&
                formatChecker.test(guid);
        }
        Guid.isValidGuid = isValidGuid;
        function newGuid() {
            return newGuidV4();
        }
        Guid.newGuid = newGuid;
        function newGuidV4() {
            var guid = getRandomWorkblank();
            return makeV4Format(guid);
        }
        function getRandomWorkblank() {
            var fields = [
                random4Hex() + random4Hex(),
                random4Hex(),
                random4Hex(),
                random4Hex(),
                random4Hex() + random4Hex() + random4Hex()];
            return fields.join("-");
        }
        function random4Hex() {
            var hexString = Math.floor(Math.random() * 0x10000).toString(16);
            return StringEx.fillPrefixToLength(hexString, 4, "0");
        }
        function makeV4Format(guid) {
            var numberOfByte19 = parseInt(guid.charAt(19), 16);
            numberOfByte19 = (numberOfByte19 & 0x3) | 0x8;
            var newByte19 = numberOfByte19.toString(16);
            guid = StringEx.replaceCharAt(guid, 14, "4");
            guid = StringEx.replaceCharAt(guid, 19, newByte19);
            return guid;
        }
    })(Guid = Utility.Guid || (Utility.Guid = {}));
    var ObjectBase = (function () {
        function ObjectBase() {
            this._id = Guid.newGuid();
        }
        ObjectBase.prototype._getId = function () {
            return this._id;
        };
        ObjectBase.prototype._toString = function () {
            return ObjectEx.getClassNameOf(this) + this._getId();
        };
        return ObjectBase;
    })();
    Utility.ObjectBase = ObjectBase;
    var ObjectSet = (function () {
        function ObjectSet() {
            this.map = new StringMap();
        }
        ObjectSet.fromArray = function (data) {
            var ret = new ObjectSet();
            data.forEach(function (item) { return ret.add(item); });
            return ret;
        };
        ObjectSet.prototype.toArray = function () {
            return MapEx.toArray(this.map);
        };
        ObjectSet.prototype.forEach = function (callback, thisArg) {
            this.toArray().forEach(callback, thisArg);
        };
        ObjectSet.prototype.some = function (callback, thisArg) {
            return this.toArray().some(callback, thisArg);
        };
        ObjectSet.prototype.getById = function (id) {
            return this.map[id];
        };
        ObjectSet.prototype.add = function (anObject) {
            Debugging.assert(anObject, "Invalid object.");
            if (anObject) {
                this.map[anObject._getId()] = anObject;
            }
        };
        ObjectSet.prototype.has = function (anObject) {
            Debugging.assert(anObject, "Invalid object.");
            return anObject && this.map.hasOwnProperty(anObject._getId());
        };
        ObjectSet.prototype.remove = function (theObject) {
            Debugging.assert(theObject, "Invalid object.");
            if (theObject && this.has(theObject)) {
                delete this.map[theObject._getId()];
            }
        };
        ObjectSet.prototype.removeAll = function () {
            this.map = {};
        };
        Object.defineProperty(ObjectSet.prototype, "Count", {
            get: function () {
                return this.toArray().length;
            },
            enumerable: true,
            configurable: true
        });
        return ObjectSet;
    })();
    Utility.ObjectSet = ObjectSet;
    var CallLater = (function () {
        function CallLater(functionToCall, timeToWaitInMs) {
            if (timeToWaitInMs === void 0) { timeToWaitInMs = 0; }
            this.functionToCall = functionToCall;
            this.timeToWaitInMs = timeToWaitInMs;
        }
        CallLater.prototype.callOnceLater = function () {
            var _this = this;
            if (this.timeToWaitInMs !== 0 && undefined !== this.handler) {
                clearTimeout(this.handler);
                this.handler = undefined;
            }
            if (undefined === this.handler) {
                this.handler = setTimeout(function () { _this.callImmediately(); }, this.timeToWaitInMs);
            }
        };
        CallLater.prototype.flush = function () {
            if (undefined !== this.handler) {
                this.clear();
                this.functionToCall();
            }
        };
        CallLater.prototype.callImmediately = function () {
            if (undefined !== this.handler) {
                this.clear();
            }
            this.functionToCall();
        };
        CallLater.prototype.clear = function () {
            clearTimeout(this.handler);
            this.handler = undefined;
        };
        return CallLater;
    })();
    Utility.CallLater = CallLater;
    var CallAfterReady = (function () {
        function CallAfterReady() {
            var _this = this;
            this.pipedCommands = [function () { return _this.call = CallAfterReady.callImmediately; }];
        }
        CallAfterReady.prototype.call = function (func) {
            this.pipedCommands.push(func);
        };
        CallAfterReady.prototype.markAsReady = function () {
            this.pipedCommands.forEach(function (func) { return func(); });
        };
        CallAfterReady.callImmediately = function (func2Call) { return func2Call(); };
        return CallAfterReady;
    })();
    Utility.CallAfterReady = CallAfterReady;
})(Utility || (Utility = {}));
//# sourceMappingURL=Utility.js.map