import test from '../test.js';
/**
Test all the values in the collection against a provided predicate.

@hidden
@param source Source collection to test.
@param name The name to call the collection of values, such as `values` or `keys`.
@param predicate Predicate to test every item in the source collection against.
*/
const ofType = (source, name, predicate) => {
    try {
        for (const item of source) {
            test(item, name, predicate, false);
        }
        return true;
    }
    catch (error) {
        return error.message;
    }
};
export default ofType;
