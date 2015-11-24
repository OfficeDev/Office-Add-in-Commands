
module Utility {
    export class Debugging {
        public static runtimeError(message: string) {
            throw Error(message);
        }

        public static assert(expression: any, message: string) {
            if (!expression) {
                Debugging.runtimeError(message);
            }
        }
    }

    export module StringEx {
        export function replaceCharAt(str: string, index: number, replacement: String): string {
            return str.substring(0, index) + replacement + str.substring(index + 1);
        }

        export function fillPrefixToLength(str: string, targetLength: number, prefix: string): string {
            var currentLength = str.length;
            var prefixLength = prefix.length;
            for (; currentLength < targetLength; currentLength += prefixLength) {
                str = prefix + str;
            }

            return str;
        }
    }

    export class StringMap<BaseType> {
        [key: string]: BaseType;
    }

    export module MapEx {
        export function forEach<BaseType>(map: StringMap<BaseType>, callback: (value: BaseType, key: string) => void) {
            var key: string;
            for (key in map) {
                callback(map[key], key);
            }
        }

        export function allKeys<BaseType>(map: StringMap<BaseType>): string[]{
            var result = [];

            MapEx.forEach<BaseType>(map,(value, key: string) => {
                result.push(key);
            });

            return result;
        }

        export function toArray<BaseType>(map: StringMap<BaseType>): BaseType[] {
            var result = [];

            MapEx.forEach<BaseType>(map, (value: BaseType) => {
                result.push(value);
            });

            return result;
        }
    }

    export module ObjectEx {
        export function getClassNameOf(obj: any): string {
            var funcionNameRegex = /function (.{1,})\(/;
            var results = (funcionNameRegex).exec(obj["constructor"].toString());
            return (results && results.length > 1) ? results[1] : "Unknown_Class";
        }
    }

    export module Guid {
        var charSetChecker: RegExp = /^[0-9a-fA-F\-]*$/;
        var formatChecker: RegExp = /^[^\-]{8}(\-[^\-]{4}){4}[^\-]{8}$/;

        export function isValidGuid(guid: string): boolean {
            return charSetChecker.test(guid) &&
                formatChecker.test(guid);
        }

        export function newGuid(): string {
            return newGuidV4();
        }

        function newGuidV4(): string {
            var guid = getRandomWorkblank();
            return makeV4Format(guid);
        }

        function getRandomWorkblank(): string {
            var fields = [
                random4Hex() + random4Hex(),
                random4Hex(),
                random4Hex(),
                random4Hex(),
                random4Hex() + random4Hex() + random4Hex()];

            return fields.join("-");
        }

        function random4Hex(): string {
            var hexString = Math.floor(Math.random() * 0x10000).toString(16);

            return StringEx.fillPrefixToLength(hexString, 4, "0");
        }

        function makeV4Format(guid: string) {
            var numberOfByte19 = parseInt(guid.charAt(19), 16);
            numberOfByte19 = (numberOfByte19 & 0x3) | 0x8;
            var newByte19 = numberOfByte19.toString(16);

            guid = StringEx.replaceCharAt(guid, 14, "4");
            guid = StringEx.replaceCharAt(guid, 19, newByte19);

            return guid;
        }
    }

    export interface IObject {
        _getId(): string;
        _toString(): string;
    }

    export class ObjectBase implements IObject {
        private _id: string;

        constructor() {
            this._id = Guid.newGuid();
        }

        public _getId(): string {
            return this._id;
        }

        public _toString(): string {
            return ObjectEx.getClassNameOf(this) + this._getId();
        }
    }

    export class ObjectSet<BaseType extends IObject> {
        private map: StringMap<BaseType>;

        constructor() {
            this.map = new StringMap<BaseType>();
        }

        public static fromArray<BaseType extends IObject>(data: BaseType[]) {
            var ret = new ObjectSet<BaseType>();
            data.forEach(item => ret.add(item));
            return ret;
        }

        public toArray(): BaseType[] {
            return MapEx.toArray(this.map);
        }

        public forEach(
            callback: (object: BaseType, index: number, array: BaseType[]) => void,
            thisArg?: any) {
            this.toArray().forEach(callback, thisArg);
        }

        public some(
            callback: (object: BaseType, index: number, array: BaseType[]) => boolean,
            thisArg?: any): boolean {
            return this.toArray().some(callback, thisArg);
        }

        public getById(id: string) {
            return this.map[id];
        }

        public add(anObject: BaseType) {
            Debugging.assert(anObject, "Invalid object.");
            if (anObject) {
                this.map[anObject._getId()] = anObject;
            }
        }

        public has(anObject: BaseType): boolean {
            Debugging.assert(anObject, "Invalid object.");
            return anObject && this.map.hasOwnProperty(anObject._getId());
        }

        public remove(theObject: BaseType) {
            Debugging.assert(theObject, "Invalid object.");
            if (theObject && this.has(theObject)) {
                delete this.map[theObject._getId()];
            }
        }

        public removeAll() {
            this.map = {};
        }

        public get Count(): number {
            return this.toArray().length;
        }
    }

    export class CallLater {
        private functionToCall: () => void;
        private handler: number;
        private timeToWaitInMs: number;

        constructor(functionToCall: () => void, timeToWaitInMs: number = 0) {
            this.functionToCall = functionToCall;
            this.timeToWaitInMs = timeToWaitInMs;
        }

        public callOnceLater() {
            if (this.timeToWaitInMs !== 0 && undefined !== this.handler) {
                clearTimeout(this.handler);
                this.handler = undefined;
            }

            if (undefined === this.handler) {
                this.handler = setTimeout(() => { this.callImmediately(); }, this.timeToWaitInMs);
            }
        }

        public flush() {
            if (undefined !== this.handler) {
                this.clear();
                this.functionToCall();
            }
        }

        public callImmediately() {
            if (undefined !== this.handler) {
                this.clear();
            }

            this.functionToCall();
        }

        public clear() {
            clearTimeout(this.handler);
            this.handler = undefined;
        }
    }

    export class CallAfterReady {
        private static callImmediately = (func2Call: ()=> void)=> func2Call();
        private pipedCommands: Array<()=> void>;

        constructor() {
            this.pipedCommands = [() => this.call = CallAfterReady.callImmediately];
        }

        public call(func: () => void) {
            this.pipedCommands.push(func);
        }

        public markAsReady() {
            this.pipedCommands.forEach((func: () => void) => func());
        }
    }
}
