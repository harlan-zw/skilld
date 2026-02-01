"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gotScraping = void 0;
// eslint-disable-next-line import/no-mutable-exports -- Borrowing a book from NodeJS's code, we override the method with the imported one once the method is called
let gotScraping = (async (...args) => {
    (exports.gotScraping = gotScraping = (await import('got-scraping')).gotScraping);
    return gotScraping(...args);
});
exports.gotScraping = gotScraping;
//# sourceMappingURL=gotScraping.js.map