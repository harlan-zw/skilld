import callsites from 'callsites';
import { inferLabel } from './utils/infer-label.js';
import { isPredicate } from './predicates/base-predicate.js';
import modifiers from './modifiers.js';
import predicates from './predicates.js';
import test from './test.js';
const ow = (value, labelOrPredicate, predicate) => {
    if (!isPredicate(labelOrPredicate) && typeof labelOrPredicate !== 'string') {
        throw new TypeError(`Expected second argument to be a predicate or a string, got \`${typeof labelOrPredicate}\``);
    }
    if (isPredicate(labelOrPredicate)) {
        // If the second argument is a predicate, infer the label
        const stackFrames = callsites();
        test(value, () => inferLabel(stackFrames), labelOrPredicate);
        return;
    }
    test(value, labelOrPredicate, predicate);
};
Object.defineProperties(ow, {
    isValid: {
        value(value, predicate) {
            try {
                test(value, '', predicate);
                return true;
            }
            catch {
                return false;
            }
        },
    },
    create: {
        value: (labelOrPredicate, predicate) => (value, label) => {
            if (isPredicate(labelOrPredicate)) {
                const stackFrames = callsites();
                test(value, label ?? (() => inferLabel(stackFrames)), labelOrPredicate);
                return;
            }
            test(value, label ?? (labelOrPredicate), predicate);
        },
    },
});
// Can't use `export default predicates(modifiers(ow)) as Ow` because the variable needs a type annotation to avoid a compiler error when used:
// Assertions require every name in the call target to be declared with an explicit type annotation.ts(2775)
// See https://github.com/microsoft/TypeScript/issues/36931 for more details.
const _ow = predicates(modifiers(ow));
export default _ow;
export * from './predicates.js';
export { ArgumentError } from './argument-error.js';
export { Predicate } from './predicates/predicate.js';
