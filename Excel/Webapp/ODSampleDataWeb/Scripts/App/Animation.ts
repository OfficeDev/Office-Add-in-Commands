module Animation {
    export class CurvePointInfo {
        public z: number;
        public rate: number;
    } 

    export class CosineCurveCalculator {
        public v0: number;
        private negativeHalfPeriod: number;
        private positiveHalfPeriod: number;

        public constructor(bulgingRate: number, negativeHalfPeriod: number, positiveHalfPeriod?: number) {
            var depressed = bulgingRate - 1;
            this.v0 = 2 / depressed + 1;
            this.negativeHalfPeriod = negativeHalfPeriod;
            this.positiveHalfPeriod = positiveHalfPeriod || negativeHalfPeriod;
        }

        public get MaxBulgingRate(): number {
            return (this.v0 + 1) / (this.v0 - 1);
        }
        
        public getAt(y: number): CurvePointInfo {
            var z = this.getZAt(y);
            var rate = this.getBulgingRateWithZ(z);
            return { z: z, rate: rate };
        }

        public isPointInPeriod(y: number) {
            return (y > -this.negativeHalfPeriod && y < this.positiveHalfPeriod);
        }

        private getZAt(y: number) {
            if (!this.isPointInPeriod(y)) {
                return -1;
            } else if (y < 0) {
                return Math.cos(y / (this.negativeHalfPeriod / Math.PI));
            } else {
                return Math.cos(y / (this.positiveHalfPeriod / Math.PI));
            }
        }

        private getBulgingRateWithZ(z: number) {
            return (this.v0 + 1) / (this.v0 - z);
        }
    }

    export interface TransformingZoomInfo_3d {
        reducedSize: number;
        maxRate: number;
    }
   
    export interface AnimationCallback {
        (value: number): void;
    }

    export interface IAnimatingNumber {
        getCurrentValue(): number;
        getTargetValue(): number;
        setTargetValue(value: number);
        forceToValue(value: number);

        addProgressCallback(callback: AnimationCallback);
        removeCallback(callback: AnimationCallback);
        addCallbackForTargetChanged(callback: AnimationCallback);
        removeCallbackForTargetChanged(callback: AnimationCallback);
        addCallbackForDone(callback: AnimationCallback);
        removeCallbackForDone(callback: AnimationCallback);
    }

    export class AnimatingNumberBase implements IAnimatingNumber {
        private progressCallbacks: AnimationCallback[];
        private targetChangedCallbacks: AnimationCallback[];
        private doneCallbacks: AnimationCallback[];
        private currentValue: number;
        private targetValue: number;

        constructor() {
            this.progressCallbacks = [];
            this.targetChangedCallbacks = [];
            this.doneCallbacks = [];
            this.currentValue = 0;
            this.targetValue = 0;
        }

        public getCurrentValue(): number {
            return this.currentValue;
        }

        public getTargetValue(): number {
            return this.targetValue;
        }

        public setTargetValue(value: number) {
            this.virtual_onSetTargetValue(value);
        }

        public forceToValue(value: number) {
            this.innerSetCurrentValue(value);
            this.virtual_onSetTargetValue(value);
        }

        public addProgressCallback(callback: AnimationCallback) {
            if (this.progressCallbacks.indexOf(callback) < 0) {
                callback(this.getCurrentValue());
                this.progressCallbacks.push(callback);
            }
        }

        public removeCallback(callback: AnimationCallback) {
            var index = this.progressCallbacks.indexOf(callback);
            if (index >= 0) {
                this.progressCallbacks.splice(index, 1);
            }
        }

        public addCallbackForTargetChanged(callback: AnimationCallback) {
            if (this.targetChangedCallbacks.indexOf(callback) < 0) {
                callback(this.getTargetValue());
                this.targetChangedCallbacks.push(callback);
            }
        }

        public removeCallbackForTargetChanged(callback: AnimationCallback) {
            var index = this.targetChangedCallbacks.indexOf(callback);
            if (index >= 0) {
                this.targetChangedCallbacks.splice(index, 1);
            }
        }

        public addCallbackForDone(callback: AnimationCallback) {
            if (this.doneCallbacks.indexOf(callback) < 0) {
                if (this.getTargetValue() === this.getCurrentValue()) {
                    callback(this.getCurrentValue());
                }

                this.doneCallbacks.push(callback);
            }
        }

        public removeCallbackForDone(callback: AnimationCallback) {
            var index = this.doneCallbacks.indexOf(callback);
            if (index >= 0) {
                this.doneCallbacks.splice(index, 1);
            }
        }

        protected innerSetCurrentValue(value: number) {
            if (value !== this.currentValue) {
                this.currentValue = value;
                this.progressCallbacks.forEach(callback => callback(this.currentValue));
            }
        }

        protected innerSetTargetValue(value: number) {
            if (value !== this.targetValue) {
                this.targetValue = value;
                this.targetChangedCallbacks.forEach(callback => callback(value));
            }
        }

        protected innerComplete() {
            this.innerSetCurrentValue(this.getTargetValue());
            this.doneCallbacks.forEach(callback => callback(this.currentValue));
        }

        protected virtual_onSetTargetValue(value: number) {
            this.innerSetTargetValue(value);
            this.innerComplete();
        }
    }

    export class TimerBasedAnimatingNumber extends AnimatingNumberBase {
        private callback: AnimationCallback;
        private timer: number;
        private targetTimeInMsec: number;
        private timerCycle: number;

        constructor(targetTimeInMsec: number, frameCount: number) {
            super();
            this.targetTimeInMsec = targetTimeInMsec;
            this.timerCycle = Math.floor(targetTimeInMsec / frameCount);
        }

        protected virtual_onSetTargetValue(value: number) {
            this.innerSetTargetValue(value);
            this.endTimer();
            this.startTimer();
        }

        protected virtual_timerContext(): any {
        }

        protected virtual_getInnerProgressValue(timeProgress: number, context: any): number {
            throw Error("To be overrided.");
        }

        private endTimer() {
            if (undefined !== this.timer) {
                window.clearTimeout(this.timer);
                this.timer = undefined;
            }
        }

        private startTimer() {
            var valueFrom = this.getCurrentValue();
            var targetValue = this.getTargetValue();
            if (valueFrom !== targetValue) {
                var context = this.virtual_timerContext();
                var stepsLeft = Math.ceil(this.targetTimeInMsec / this.timerCycle);

                var startTimeout = () => {
                    this.timer = window.setTimeout(callback, this.timerCycle);
                };

                var callback = () => {
                    if (0 >= --stepsLeft) {
                        this.innerComplete();
                        this.timer = undefined;
                    } else {
                        var timeProgress = 1 - stepsLeft * this.timerCycle / this.targetTimeInMsec;
                        var progress = this.virtual_getInnerProgressValue(timeProgress, context);
                        this.innerSetCurrentValue(valueFrom + progress * (targetValue - valueFrom));
                        startTimeout();
                    }
                };

                startTimeout();
            }
        }
    }

    export class LinearAnimatingNumber extends TimerBasedAnimatingNumber {
        protected virtual_getInnerProgressValue(timeProgress: number, context: any): number {
            return timeProgress;
        }
    }

    export class SineAnimatingNumber extends TimerBasedAnimatingNumber {
        protected virtual_getInnerProgressValue(timeProgress: number, valueFrom: number): number {
            return (Math.cos((timeProgress - 1) * Math.PI) + 1) / 2;
        }
    }

    export class JQueryAnimatingNumber extends AnimatingNumberBase {
        private jq: JQuery;
        constructor(targetTimeInMsec: number) {
            super();
            this.jq = $("<div/>");
        }

        protected virtual_onSetTargetValue(value: number) {
            this.innerSetTargetValue(value);
            this.jq.stop(true, false);
            this.startTimer();
        }

        private startTimer() {
            var fromValue = this.getCurrentValue();
            var targetValue = this.getTargetValue();

            if (fromValue !== targetValue) {
                this.jq.css("width", "0").animate(
                    { width: "1px" },
                    {
                        progress: (animation: JQueryPromise<any>, progress: number) => {
                            if (progress === 1) {
                                this.innerComplete();
                            } else {
                                this.innerSetCurrentValue(fromValue + progress * (targetValue - fromValue));
                            }
                        }
                    });
            }
        }
    }

    export class ShadowAnimatingNumber extends AnimatingNumberBase {
        private entity: IAnimatingNumber;
        private callback: AnimationCallback;
        private targetChangedCallback: AnimationCallback;
        private completeCallback: AnimationCallback;
        constructor(entity: IAnimatingNumber) {
            super();
            this.entity = entity;

            this.callback = value => this.innerSetCurrentValue(value);
            this.targetChangedCallback = value => this.innerSetTargetValue(value);
            this.completeCallback = value => this.innerComplete();

            this.entity.addProgressCallback(this.callback);
            this.entity.addCallbackForTargetChanged(this.targetChangedCallback);
            this.entity.addCallbackForDone(this.completeCallback);
        }

        protected virtual_onSetTargetValue(value: number) { }

        public unbind() {
            this.removeCallback(this.callback);
            this.removeCallbackForTargetChanged(this.targetChangedCallback);
            this.removeCallbackForDone(this.completeCallback);
        }
    }

    export class BulgingList<T extends Model.DataItem> extends UX.List<T> {
        private targetData: T;
        private curveCalculator: CosineCurveCalculator;
        private animatingNumber: IAnimatingNumber;
        private maxRate: number;
        private rateMap: Utility.StringMap<number>;
        private doRefresh: Utility.CallLater;

        constructor(
            curveCalculator: CosineCurveCalculator,
            bulgingPoint: IAnimatingNumber,
            listItemArtist: UX.IListItemArtist<T>,
            jqElement?: JQuery,
            comparer?: (a: T, b: T) => number) {
            super(listItemArtist, jqElement, comparer);
            this.curveCalculator = curveCalculator;
            this.animatingNumber = bulgingPoint;
            this.maxRate = this.curveCalculator.MaxBulgingRate;
            this.rateMap = {};

            this.doRefresh = new Utility.CallLater(() => this.innerRefresh());
            this.animatingNumber.addProgressCallback(() => this.doRefresh.callImmediately());
            this.JQElement.addClass("bulge-list");
        }

        public getBulgingAnimatingNumber(): Animation.IAnimatingNumber {
            return this.animatingNumber;
        }

        public onObserved(data: T) {
            super.onObserved(data);
            this.setItemRate(data, 1);

            if (!this.targetData) {
                this.bulgeData(data);
            }

            this.doRefresh.callOnceLater();
        }

        public onUnobserved(data: T) {
            var index = -1;
            if (this.targetData === data) {
                index = this.getDataObjects().indexOf(this.targetData);
                this.targetData = undefined;
            }

            super.onUnobserved(data);

            delete this.rateMap[data._getId()];

            if (index >= 0) {
                var dataObjects = this.getDataObjects();
                var newTargetItem = dataObjects[index] || dataObjects[index - 1];
                this.bulgeData(newTargetItem);
            }

            this.refresh();
        }

        public refresh() {
            this.doRefresh.callOnceLater();
        }

        public bulgeData(data: T) {
            this.bulgeIndex(this.getDataObjects().indexOf(data));
        }

        public bulgeIndex(index: number) {
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
        }

        public getTargetBulgedDataIndex(): number {
            return this.getBulgingAnimatingNumber().getTargetValue();
        }

        protected virtual_onItemsSorted() {
            var index = this.getDataObjects().indexOf(this.targetData);
            if (index >= 0) {
                this.animatingNumber.forceToValue(index);
            }
            this.refresh();
        }

        protected virtual_onRefresh() {
        }

        private innerRefresh() {
            var y = this.animatingNumber.getCurrentValue();
            this.getDataObjects().forEach((data, index) => {
                var curvePoint = this.curveCalculator.getAt(index - y);
                this.setItemRate(data, curvePoint.rate);
            });

            this.virtual_onRefresh();
        }

        private setItemRate(data: T, rate: number) {
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
        }

        private getItemRate(data: T): number {
            return this.rateMap[data._getId()];
        }
    }
}
