import predicates from './predicates.js';
const modifiers = (object) => {
    Object.defineProperties(object, {
        optional: {
            get: () => predicates({}, { optional: true }),
        },
    });
    return object;
};
export default modifiers;
