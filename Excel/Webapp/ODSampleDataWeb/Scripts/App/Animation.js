var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animation;
(function (Animation) {
    var CurvePointInfo = (function () {
        function CurvePointInfo() {
        }
        return CurvePointInfo;
    })();
    Animation.CurvePointInfo = CurvePointInfo;
    var CosineCurveCalculator = (function () {
        function CosineCurveCalculator(bulgingRate, negativeHalfPeriod, positiveHalfPeriod) {
            var depressed = bulgingRate - 1;
            this.v0 = 2 / depressed + 1;
            this.negativeHalfPeriod = negativeHalfPeriod;
            this.positiveHalfPeriod = positiveHalfPeriod || negativeHalfPeriod;
        }
        Object.defineProperty(CosineCurveCalculator.prototype, "MaxBulgingRate", {
            get: function () {
                return (this.v0 + 1) / (this.v0 - 1);
            },
            enumerable: true,
            configurable: true
        });
        CosineCurveCalculator.prototype.getAt = function (y) {
            var z = this.getZAt(y);
            var rate = this.getBulgingRateWithZ(z);
            return { z: z, rate: rate };
        };
        CosineCurveCalculator.prototype.isPointInPeriod = function (y) {
            return (y > -this.negativeHalfPeriod && y < this.positiveHalfPeriod);
        };
        CosineCurveCalculator.prototype.getZAt = function (y) {
            if (!this.isPointInPeriod(y)) {
                return -1;
            }
            else if (y < 0) {
                return Math.cos(y / (this.negativeHalfPeriod / Math.PI));
            }
            else {
                return Math.cos(y / (this.positiveHalfPeriod / Math.PI));
            }
        };
        CosineCurveCalculator.prototype.getBulgingRateWithZ = function (z) {
            return (this.v0 + 1) / (this.v0 - z);
        };
        return CosineCurveCalculator;
    })();
    Animation.CosineCurveCalculator = CosineCurveCalculator;
    var AnimatingNumberBase = (function () {
        function AnimatingNumberBase() {
            this.progressCallbacks = [];
            this.targetChangedCallbacks = [];
            this.doneCallbacks = [];
            this.currentValue = 0;
            this.targetValue = 0;
        }
        AnimatingNumberBase.prototype.getCurrentValue = function () {
            return this.currentValue;
        };
        AnimatingNumberBase.prototype.getTargetValue = function () {
            return this.targetValue;
        };
        AnimatingNumberBase.prototype.setTargetValue = function (value) {
            this.virtual_onSetTargetValue(value);
        };
        AnimatingNumberBase.prototype.forceToValue = function (value) {
            this.innerSetCurrentValue(value);
            this.virtual_onSetTargetValue(value);
        };
        AnimatingNumberBase.prototype.addProgressCallback = function (callback) {
            if (this.progressCallbacks.indexOf(callback) < 0) {
                callback(this.getCurrentValue());
                this.progressCallbacks.push(callback);
            }
        };
        AnimatingNumberBase.prototype.removeCallback = function (callback) {
            var index = this.progressCallbacks.indexOf(callback);
            if (index >= 0) {
                this.progressCallbacks.splice(index, 1);
            }
        };
        AnimatingNumberBase.prototype.addCallbackForTargetChanged = function (callback) {
            if (this.targetChangedCallbacks.indexOf(callback) < 0) {
                callback(this.getTargetValue());
                this.targetChangedCallbacks.push(callback);
            }
        };
        AnimatingNumberBase.prototype.removeCallbackForTargetChanged = function (callback) {
            var index = this.targetChangedCallbacks.indexOf(callback);
            if (index >= 0) {
                this.targetChangedCallbacks.splice(index, 1);
            }
        };
        AnimatingNumberBase.prototype.addCallbackForDone = function (callback) {
            if (this.doneCallbacks.indexOf(callback) < 0) {
                if (this.getTargetValue() === this.getCurrentValue()) {
                    callback(this.getCurrentValue());
                }
                this.doneCallbacks.push(callback);
            }
        };
        AnimatingNumberBase.prototype.removeCallbackForDone = function (callback) {
            var index = this.doneCallbacks.indexOf(callback);
            if (index >= 0) {
                this.doneCallbacks.splice(index, 1);
            }
        };
        AnimatingNumberBase.prototype.innerSetCurrentValue = function (value) {
            var _this = this;
            if (value !== this.currentValue) {
                this.currentValue = value;
                this.progressCallbacks.forEach(function (callback) { return callback(_this.currentValue); });
            }
        };
        AnimatingNumberBase.prototype.innerSetTargetValue = function (value) {
            if (value !== this.targetValue) {
                this.targetValue = value;
                this.targetChangedCallbacks.forEach(function (callback) { return callback(value); });
            }
        };
        AnimatingNumberBase.prototype.innerComplete = function () {
            var _this = this;
            this.innerSetCurrentValue(this.getTargetValue());
            this.doneCallbacks.forEach(function (callback) { return callback(_this.currentValue); });
        };
        AnimatingNumberBase.prototype.virtual_onSetTargetValue = function (value) {
            this.innerSetTargetValue(value);
            this.innerComplete();
        };
        return AnimatingNumberBase;
    })();
    Animation.AnimatingNumberBase = AnimatingNumberBase;
    var TimerBasedAnimatingNumber = (function (_super) {
        __extends(TimerBasedAnimatingNumber, _super);
        function TimerBasedAnimatingNumber(targetTimeInMsec, frameCount) {
            _super.call(this);
            this.targetTimeInMsec = targetTimeInMsec;
            this.timerCycle = Math.floor(targetTimeInMsec / frameCount);
        }
        TimerBasedAnimatingNumber.prototype.virtual_onSetTargetValue = function (value) {
            this.innerSetTargetValue(value);
            this.endTimer();
            this.startTimer();
        };
        TimerBasedAnimatingNumber.prototype.virtual_timerContext = function () {
        };
        TimerBasedAnimatingNumber.prototype.virtual_getInnerProgressValue = function (timeProgress, context) {
            throw Error("To be overrided.");
        };
        TimerBasedAnimatingNumber.prototype.endTimer = function () {
            if (undefined !== this.timer) {
                window.clearTimeout(this.timer);
                this.timer = undefined;
            }
        };
        TimerBasedAnimatingNumber.prototype.startTimer = function () {
            var _this = this;
            var valueFrom = this.getCurrentValue();
            var targetValue = this.getTargetValue();
            if (valueFrom !== targetValue) {
                var context = this.virtual_timerContext();
                var stepsLeft = Math.ceil(this.targetTimeInMsec / this.timerCycle);
                var startTimeout = function () {
                    _this.timer = window.setTimeout(callback, _this.timerCycle);
                };
                var callback = function () {
                    if (0 >= --stepsLeft) {
                        _this.innerComplete();
                        _this.timer = undefined;
                    }
                    else {
                        var timeProgress = 1 - stepsLeft * _this.timerCycle / _this.targetTimeInMsec;
                        var progress = _this.virtual_getInnerProgressValue(timeProgress, context);
                        _this.innerSetCurrentValue(valueFrom + progress * (targetValue - valueFrom));
                        startTimeout();
                    }
                };
                startTimeout();
            }
        };
        return TimerBasedAnimatingNumber;
    })(AnimatingNumberBase);
    Animation.TimerBasedAnimatingNumber = TimerBasedAnimatingNumber;
    var LinearAnimatingNumber = (function (_super) {
        __extends(LinearAnimatingNumber, _super);
        function LinearAnimatingNumber() {
            _super.apply(this, arguments);
        }
        LinearAnimatingNumber.prototype.virtual_getInnerProgressValue = function (timeProgress, context) {
            return timeProgress;
        };
        return LinearAnimatingNumber;
    })(TimerBasedAnimatingNumber);
    Animation.LinearAnimatingNumber = LinearAnimatingNumber;
    var SineAnimatingNumber = (function (_super) {
        __extends(SineAnimatingNumber, _super);
        function SineAnimatingNumber() {
            _super.apply(this, arguments);
        }
        SineAnimatingNumber.prototype.virtual_getInnerProgressValue = function (timeProgress, valueFrom) {
            return (Math.cos((timeProgress - 1) * Math.PI) + 1) / 2;
        };
        return SineAnimatingNumber;
    })(TimerBasedAnimatingNumber);
    Animation.SineAnimatingNumber = SineAnimatingNumber;
    var JQueryAnimatingNumber = (function (_super) {
        __extends(JQueryAnimatingNumber, _super);
        function JQueryAnimatingNumber(targetTimeInMsec) {
            _super.call(this);
            this.jq = $("<div/>");
        }
        JQueryAnimatingNumber.prototype.virtual_onSetTargetValue = function (value) {
            this.innerSetTargetValue(value);
            this.jq.stop(true, false);
            this.startTimer();
        };
        JQueryAnimatingNumber.prototype.startTimer = function () {
            var _this = this;
            var fromValue = this.getCurrentValue();
            var targetValue = this.getTargetValue();
            if (fromValue !== targetValue) {
                this.jq.css("width", "0").animate({ width: "1px" }, {
                    progress: function (animation, progress) {
                        if (progress === 1) {
                            _this.innerComplete();
                        }
                        else {
                            _this.innerSetCurrentValue(fromValue + progress * (targetValue - fromValue));
                        }
                    }
                });
            }
        };
        return JQueryAnimatingNumber;
    })(AnimatingNumberBase);
    Animation.JQueryAnimatingNumber = JQueryAnimatingNumber;
    var ShadowAnimatingNumber = (function (_super) {
        __extends(ShadowAnimatingNumber, _super);
        function ShadowAnimatingNumber(entity) {
            var _this = this;
            _super.call(this);
            this.entity = entity;
            this.callback = function (value) { return _this.innerSetCurrentValue(value); };
            this.targetChangedCallback = function (value) { return _this.innerSetTargetValue(value); };
            this.completeCallback = function (value) { return _this.innerComplete(); };
            this.entity.addProgressCallback(this.callback);
            this.entity.addCallbackForTargetChanged(this.targetChangedCallback);
            this.entity.addCallbackForDone(this.completeCallback);
        }
        ShadowAnimatingNumber.prototype.virtual_onSetTargetValue = function (value) { };
        ShadowAnimatingNumber.prototype.unbind = function () {
            this.removeCallback(this.callback);
            this.removeCallbackForTargetChanged(this.targetChangedCallback);
            this.removeCallbackForDone(this.completeCallback);
        };
        return ShadowAnimatingNumber;
    })(AnimatingNumberBase);
    Animation.ShadowAnimatingNumber = ShadowAnimatingNumber;
    var BulgingList = (function (_super) {
        __extends(BulgingList, _super);
        function BulgingList(curveCalculator, bulgingPoint, listItemArtist, jqElement, comparer) {
            var _this = this;
            _super.call(this, listItemArtist, jqElement, comparer);
            this.curveCalculator = curveCalculator;
            this.animatingNumber = bulgingPoint;
            this.maxRate = this.curveCalculator.MaxBulgingRate;
            this.rateMap = {};
            this.doRefresh = new Utility.CallLater(function () { return _this.innerRefresh(); });
            this.animatingNumber.addProgressCallback(function () { return _this.doRefresh.callImmediately(); });
            this.JQElement.addClass("bulge-list");
        }
        BulgingList.prototype.getBulgingAnimatingNumber = function () {
            return this.animatingNumber;
        };
        BulgingList.prototype.onObserved = function (data) {
            _super.prototype.onObserved.call(this, data);
            this.setItemRate(data, 1);
            if (!this.targetData) {
                this.bulgeData(data);
            }
            this.doRefresh.callOnceLater();
        };
        BulgingList.prototype.onUnobserved = function (data) {
            var index = -1;
            if (this.targetData === data) {
                index = this.getDataObjects().indexOf(this.targetData);
                this.targetData = undefined;
            }
            _super.prototype.onUnobserved.call(this, data);
            delete this.rateMap[data._getId()];
            if (index >= 0) {
                var dataObjects = this.getDataObjects();
                var newTargetItem = dataObjects[index] || dataObjects[index - 1];
                this.bulgeData(newTargetItem);
            }
            this.refresh();
        };
        BulgingList.prototype.refresh = function () {
            this.doRefresh.callOnceLater();
        };
        BulgingList.prototype.bulgeData = function (data) {
            this.bulgeIndex(this.getDataObjects().indexOf(data));
        };
        BulgingList.prototype.bulgeIndex = function (index) {
            var data = this.getDataObjects()[index];
            if (data) {
                if (this.targetData !== data) {
                    var targetElement = this.getElementByData(this.targetData);
                    if (targetElement) {
                        targetElement.removeClass("active");
                    }
                    this.targetData = data;
                    targetElement = this.getElementByData(data);
                    if (targetElement) {
                        targetElement.addClass("active");
                    }
                }
                this.animatingNumber.setTargetValue(index);
            }
        };
        BulgingList.prototype.getTargetBulgedDataIndex = function () {
            return this.getBulgingAnimatingNumber().getTargetValue();
        };
        BulgingList.prototype.virtual_onItemsSorted = function () {
            var index = this.getDataObjects().indexOf(this.targetData);
            if (index >= 0) {
                this.animatingNumber.forceToValue(index);
            }
            this.refresh();
        };
        BulgingList.prototype.virtual_onRefresh = function () {
        };
        BulgingList.prototype.innerRefresh = function () {
            var _this = this;
            var y = this.animatingNumber.getCurrentValue();
            this.getDataObjects().forEach(function (data, index) {
                var curvePoint = _this.curveCalculator.getAt(index - y);
                _this.setItemRate(data, curvePoint.rate);
            });
            this.virtual_onRefresh();
        };
        BulgingList.prototype.setItemRate = function (data, rate) {
            var currentRate = this.getItemRate(data);
            if (currentRate === rate) {
                return;
            }
            this.rateMap[data._getId()] = rate;
            var realRate = rate / this.maxRate;
            var rateScale = "scale(" + realRate + ")";
            this.getElementByData(data).css({
                "-moz-transform": rateScale,
                "-ms-transform": rateScale,
                "-o-transform": rateScale,
                "-webkit-transform": rateScale,
                "transform": rateScale,
                "z-index": realRate * 1000,
            });
        };
        BulgingList.prototype.getItemRate = function (data) {
            return this.rateMap[data._getId()];
        };
        return BulgingList;
    })(UX.List);
    Animation.BulgingList = BulgingList;
})(Animation || (Animation = {}));
//# sourceMappingURL=Animation.js.map