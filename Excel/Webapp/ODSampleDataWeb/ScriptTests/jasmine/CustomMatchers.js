var JasmineCustomization;
(function (JasmineCustomization) {
    var CustomMatchers = (function () {
        function CustomMatchers() {
        }
        CustomMatchers.prototype.toMatchResultForCall = function (util, customEqualityTesters) {
            return new MatcherFunction(function (actual, expected, func) {
                return new MatcherResult(expected === func(actual));
            });
        };
        CustomMatchers.prototype.toPass = function (util, customEqualityTesters) {
            return new MatcherFunction(function (actual, func) {
                return new MatcherResult(func(actual));
            });
        };
        CustomMatchers.prototype.toHaveTheSameSetOf = function (util, customEqualityTesters) {
            return new MatcherFunction(Helper.arraysHaveTheSameSet);
        };
        return CustomMatchers;
    })();
    var Helper = (function () {
        function Helper() {
        }
        Helper.getActual = function (matchers) {
            return matchers.actual;
        };
        Helper.getClassNameOf = function (obj) {
            var funcionNameRegex = /function (.{1,})\(/;
            var results = (funcionNameRegex).exec(obj["constructor"].toString());
            return (results && results.length > 1) ? results[1] : "Unknown_Class";
        };
        Helper.arraysHaveTheSameSet = function (actual, expected) {
            if (!(actual instanceof Array) && !(expected instanceof Array)) {
                return new MatcherResult(false);
            }
            actual = actual.slice(0).sort(Helper.comparerByType).sort();
            expected = expected.slice(0).sort(Helper.comparerByType).sort();
            var ret = actual.length === expected.length &&
                actual.every(function (value, index) {
                    return expected[index] === value;
                });
            return new MatcherResult(ret);
        };
        Helper.comparerByType = function (a, b) {
            a = Helper.getClassNameOf(a);
            b = Helper.getClassNameOf(b);
            if (a === b) {
                return 0;
            }
            else if (a < b) {
                return -1;
            }
            else {
                return 1;
            }
        };
        return Helper;
    })();
    var MatcherResult = (function () {
        function MatcherResult(pass, message) {
            if (message === void 0) { message = ""; }
            this.pass = pass;
            this.message = message;
        }
        return MatcherResult;
    })();
    var MatcherFunction = (function () {
        function MatcherFunction(compare) {
            this.compare = compare;
        }
        return MatcherFunction;
    })();
    // add custom matchers
    beforeEach(function () {
        jasmine.addMatchers(new CustomMatchers());
    });
})(JasmineCustomization || (JasmineCustomization = {}));
//# sourceMappingURL=CustomMatchers.js.map