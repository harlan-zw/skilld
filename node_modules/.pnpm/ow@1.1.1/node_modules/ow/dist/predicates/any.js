import { ArgumentError } from '../argument-error.js';
import { generateArgumentErrorMessage } from '../utils/generate-argument-error-message.js';
import { testSymbol } from './base-predicate.js';
/**
@hidden
*/
export class AnyPredicate {
    constructor(predicates, options = {}) {
        Object.defineProperty(this, "predicates", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: predicates
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
    }
    [testSymbol](value, main, label, idLabel) {
        const errors = new Map();
        for (const predicate of this.predicates) {
            try {
                main(value, label, predicate, idLabel);
                return;
            }
            catch (error) {
                if (value === undefined && this.options.optional === true) {
                    return;
                }
                // If we received an ArgumentError, then..
                if (error instanceof ArgumentError) {
                    // Iterate through every error reported.
                    for (const [key, value] of error.validationErrors.entries()) {
                        // Get the current errors set, if any.
                        const alreadyPresent = errors.get(key);
                        // Add all errors under the same key
                        errors.set(key, new Set([...alreadyPresent ?? [], ...value]));
                    }
                }
            }
        }
        if (errors.size > 0) {
            // Generate the `error.message` property.
            const message = generateArgumentErrorMessage(errors, true);
            throw new ArgumentError(`Any predicate failed with the following errors:\n${message}`, main, errors);
        }
    }
}
