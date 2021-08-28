declare class EoliaHttpError extends Error {
    cause: Error;
    httpStatus: number;
    code: string;
    constructor(cause: Error, httpStatus: number, code: string, message: string);
}
declare class EoliaTemperatureError extends Error {
    temperature: number;
    constructor(temperature: number);
}
export { EoliaHttpError, EoliaTemperatureError };
//# sourceMappingURL=EoliaError.d.ts.map