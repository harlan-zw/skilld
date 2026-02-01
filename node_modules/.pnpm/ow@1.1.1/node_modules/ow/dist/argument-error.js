import { generateStackTrace } from './utils/generate-stack.js';
const wrapStackTrace = (error, stack) => `${error.name}: ${error.message}\n${stack}`;
/**
@hidden
*/
export class ArgumentError extends Error {
    constructor(message, context, errors = new Map()) {
        super(message);
        Object.defineProperty(this, "validationErrors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = 'ArgumentError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, context);
        }
        else {
            this.stack = wrapStackTrace(this, generateStackTrace());
        }
        this.validationErrors = errors;
    }
}
