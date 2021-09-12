"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EoliaClient = void 0;
const axios_1 = require("axios");
const luxon_1 = require("luxon");
const EoliaError_1 = require("./EoliaError");
class EoliaClient {
    constructor(userId, password, accessToken, baseURL = EoliaClient.API_BASE_URL) {
        this.userId = userId;
        this.password = password;
        this.accessToken = accessToken;
        const options = {
            baseURL: baseURL,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json; charset=UTF-8',
                'Accept-Language': 'ja-jp',
                'Accept-Encoding': 'gzip'
            },
        };
        this.client = axios_1.default.create(options);
        this.client.interceptors.request.use(requestConfig => {
            // console.log('[axios]', requestConfig.method, requestConfig.url);
            if (this.accessToken) {
                requestConfig.headers.Cookie = 'atkn=' + this.accessToken;
            }
            requestConfig.headers['X-Eolia-Date'] = luxon_1.DateTime.local().toFormat('yyyy-MM-dd\'T\'HH:mm:ss');
            return requestConfig;
        });
        this.client.interceptors.response.use(response => {
            if (response.headers['set-cookie']) {
                const resCookie = response.headers['set-cookie'][0];
                const tokenMatcher = resCookie.match(/atkn=(.+?);/);
                if (tokenMatcher) {
                    this.accessToken = tokenMatcher[1];
                }
            }
            return response;
        }, (error) => __awaiter(this, void 0, void 0, function* () {
            const data = error.response.data;
            const httpStatus = error.response.status;
            // if (data.code) {
            //   console.log('[eolia]', httpStatus, data.code, data.message);
            // }
            if (error.response.status === 401 && !error.config._retry) {
                error.config._retry = true;
                yield this.login();
                return yield this.client.request(error.config);
            }
            if (error.response.data.code) {
                throw new EoliaError_1.EoliaHttpError(error, httpStatus, data.code, data.message);
            }
            else {
                throw error;
            }
        }));
    }
    login(userId = this.userId, password = this.password, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.post('/auth/login', {
                idpw: Object.assign({ id: userId, pass: password, terminal_type: 3, next_easy: true }, options)
            });
            this.userId = userId;
            this.password = password;
            return response.data;
        });
    }
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.post('/auth/logout');
            return response.data;
        });
    }
    getDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.get('/devices');
            return response.data.ac_list;
        });
    }
    getDeviceStatus(applianceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.get(`/devices/${applianceId}/status`);
            return Object.assign(Object.assign({}, response.data), { operation_token: null });
        });
    }
    setDeviceStatus(operation) {
        return __awaiter(this, void 0, void 0, function* () {
            if (operation.operation_mode === 'Stop') {
                operation.operation_mode = 'Auto';
            }
            const applianceId = operation.appliance_id;
            const response = yield this.client.put(`/devices/${applianceId}/status`, operation);
            operation.operation_token = response.data.operation_token;
            return response.data;
        });
    }
    createOperation(status) {
        if (EoliaClient.isTemperatureSupport(status.operation_mode)
            && (status.temperature < EoliaClient.MIN_TEMPERATURE
                || status.temperature > EoliaClient.MAX_TEMPERATURE)) {
            throw new EoliaError_1.EoliaTemperatureError(status.temperature);
        }
        const operation = {
            appliance_id: status.appliance_id,
            operation_status: status.operation_status,
            nanoex: status.nanoex,
            wind_volume: status.wind_volume,
            air_flow: status.air_flow,
            wind_direction: status.wind_direction,
            wind_direction_horizon: status.wind_direction_horizon,
            timer_value: status.timer_value,
            operation_mode: status.operation_mode,
            temperature: status.temperature,
            ai_control: status.ai_control,
            airquality: status.airquality,
            operation_token: status.operation_token,
        };
        return operation;
    }
    getFunctions(productCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.get(`/products/${productCode}/functions`);
            const functionList = response.data.ac_function_list;
            return functionList.reduce((prev, curr) => curr.function_value ? prev.add(curr.function_id) : prev, new Set());
        });
    }
    static isTemperatureSupport(mode) {
        return EoliaClient.TEMPERATURE_SUPPORT_MODES.includes(mode);
    }
}
exports.EoliaClient = EoliaClient;
EoliaClient.API_BASE_URL = 'https://app.rac.apws.panasonic.com/eolia/v2';
EoliaClient.TEMPERATURE_SUPPORT_MODES = ['Auto', 'Cooling', 'Heating', 'CoolDehumidifying'];
EoliaClient.MIN_TEMPERATURE = 16;
EoliaClient.MAX_TEMPERATURE = 30;
//# sourceMappingURL=EoliaClient.js.map