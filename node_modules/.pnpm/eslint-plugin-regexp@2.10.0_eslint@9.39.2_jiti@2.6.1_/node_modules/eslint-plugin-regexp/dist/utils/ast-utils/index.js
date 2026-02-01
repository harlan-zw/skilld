"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPropertyReferences = exports.extractExpressionReferences = exports.parseReplacements = exports.isKnownMethodCall = exports.getScope = exports.getStaticValue = exports.getStringIfConstant = exports.findVariable = exports.getParent = void 0;
var utils_1 = require("./utils");
Object.defineProperty(exports, "getParent", { enumerable: true, get: function () { return utils_1.getParent; } });
Object.defineProperty(exports, "findVariable", { enumerable: true, get: function () { return utils_1.findVariable; } });
Object.defineProperty(exports, "getStringIfConstant", { enumerable: true, get: function () { return utils_1.getStringIfConstant; } });
Object.defineProperty(exports, "getStaticValue", { enumerable: true, get: function () { return utils_1.getStaticValue; } });
Object.defineProperty(exports, "getScope", { enumerable: true, get: function () { return utils_1.getScope; } });
Object.defineProperty(exports, "isKnownMethodCall", { enumerable: true, get: function () { return utils_1.isKnownMethodCall; } });
Object.defineProperty(exports, "parseReplacements", { enumerable: true, get: function () { return utils_1.parseReplacements; } });
var extract_expression_references_1 = require("./extract-expression-references");
Object.defineProperty(exports, "extractExpressionReferences", { enumerable: true, get: function () { return extract_expression_references_1.extractExpressionReferences; } });
var extract_property_references_1 = require("./extract-property-references");
Object.defineProperty(exports, "extractPropertyReferences", { enumerable: true, get: function () { return extract_property_references_1.extractPropertyReferences; } });
__exportStar(require("./regex"), exports);
