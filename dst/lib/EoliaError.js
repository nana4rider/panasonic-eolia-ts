"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EoliaTemperatureError = exports.EoliaHttpError = void 0;
class EoliaHttpError extends Error {
    constructor(cause, httpStatus, code, message) {
        super(message);
        this.cause = cause;
        this.httpStatus = httpStatus;
        this.code = code;
    }
}
exports.EoliaHttpError = EoliaHttpError;
class EoliaTemperatureError extends Error {
    constructor(temperature) {
        super('temperature: ' + temperature);
        this.temperature = temperature;
    }
}
exports.EoliaTemperatureError = EoliaTemperatureError;
//# sourceMappingURL=EoliaError.js.map