class EoliaHttpError extends Error {
  constructor(public cause: Error,
    public httpStatus: number,
    public code: string,
    message: string) {
    super(message);
  }
}

class EoliaTemperatureError extends Error {
  constructor(public temperature: number) {
    super('temperature: ' + temperature);
  }
}

export { EoliaHttpError, EoliaTemperatureError };
