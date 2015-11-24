
module jasmine {
    export interface Matchers {
        toMatchResultForCall(expected: any, func: (any) => any): boolean;
        toPass(func: (any) => any): boolean;
        toHaveTheSameSetOf(expected: any[]);
    }
}

module JasmineCustomization {
    class CustomMatchers {
        public toMatchResultForCall(util, customEqualityTesters) {
            return new MatcherFunction((actual: any, expected: any, func: (any) => any) => {
                return new MatcherResult(expected === func(actual));
            });
        }

        public toPass(util, customEqualityTesters) {
            return new MatcherFunction((actual: any, func: (any) => boolean) => {
                return new MatcherResult(func(actual));
            });
        }

        public toHaveTheSameSetOf(util, customEqualityTesters) {
            return new MatcherFunction(Helper.arraysHaveTheSameSet);
        }
    }

    class Helper {
        public static getActual(matchers: CustomMatchers): any {
            return (<jasmine.Matchers><any>matchers).actual;
        }

        public static getClassNameOf(obj: any): string {
            var funcionNameRegex = /function (.{1,})\(/;
            var results = (funcionNameRegex).exec(obj["constructor"].toString());
            return (results && results.length > 1) ? results[1] : "Unknown_Class";
        }

        public static arraysHaveTheSameSet(actual: any[], expected: any[]) {
            if (!(actual instanceof Array) && !(expected instanceof Array)) {
                return new MatcherResult(false);
            }

            actual = actual.slice(0).sort(Helper.comparerByType).sort();
            expected = expected.slice(0).sort(Helper.comparerByType).sort();

            var ret: boolean = actual.length === expected.length &&
                actual.every((value: any, index: number) => {
                    return expected[index] === value;
                });
            return new MatcherResult(ret);
        }

        private static comparerByType(a: any, b: any) {
            a = Helper.getClassNameOf(a);
            b = Helper.getClassNameOf(b);

            if (a === b) {
                return 0;
            } else if (a < b) {
                return -1;
            } else {
                return 1;
            }
        }
    }

    class MatcherResult {
        constructor(public pass: boolean, public message: string = "") { }
    }

    class MatcherFunction {
        constructor(public compare: (actual: any, ...params: any[]) => MatcherResult) { }
    }

    // add custom matchers
    beforeEach(function () {
        jasmine.addMatchers(new CustomMatchers());
    });
}
