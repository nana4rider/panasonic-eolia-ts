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
    /**
     * コンストラクタ
     *
     * @param userId ログインID
     * @param password パスワード
     * @param accessToken アクセストークン
     */
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
            if (!requestConfig.headers) {
                return;
            }
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
                return this.client.request(error.config);
            }
            if (error.response.data.code) {
                throw new EoliaError_1.EoliaHttpError(error, httpStatus, data.code, data.message);
            }
            else {
                throw error;
            }
        }));
    }
    /**
     * ログイン
     * 通常このメソッドは自動的に呼び出されるため、明示的に呼び出す必要はありません。
     */
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
    /**
     * ログアウト
     */
    logout() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.post('/auth/logout');
            return response.data;
        });
    }
    /**
     * デバイスリストを取得します。
     */
    getDevices() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.get('/devices');
            return response.data.ac_list;
        });
    }
    /**
     * デバイス情報を取得します。
     *
     * @param applianceId 機器ID
     */
    getDeviceStatus(applianceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.get(`/devices/${applianceId}/status`);
            return Object.assign(Object.assign({}, response.data), { operation_token: null });
        });
    }
    /**
     * デバイス情報を更新します。
     *
     * @param operation 更新情報
     */
    setDeviceStatus(operation) {
        return __awaiter(this, void 0, void 0, function* () {
            const applianceId = operation.appliance_id;
            const response = yield this.client.put(`/devices/${applianceId}/status`, operation);
            operation.operation_token = response.data.operation_token;
            return response.data;
        });
    }
    /**
     * デバイス情報から、更新情報を作成します。
     *
     * @param status デバイス情報
     */
    createOperation(status) {
        if (EoliaClient.isTemperatureSupport(status.operation_mode)
            && (status.temperature < EoliaClient.MIN_TEMPERATURE
                || status.temperature > EoliaClient.MAX_TEMPERATURE)) {
            throw new EoliaError_1.EoliaTemperatureError(status.temperature);
        }
        const keys = [
            'appliance_id', 'operation_status', 'nanoex', 'wind_volume',
            'air_flow', 'wind_direction', 'wind_direction_horizon', 'timer_value',
            'operation_mode', 'temperature', 'ai_control', 'airquality',
            'operation_token'
        ];
        const operation = keys.reduce((obj, key) => {
            obj[key] = status[key];
            return obj;
        }, {});
        if (operation.operation_mode === 'Stop') {
            operation.operation_mode = 'Auto';
        }
        else if (operation.operation_mode === 'Nanoe') {
            operation.operation_mode = 'Blast';
        }
        return operation;
    }
    /**
     * 指定した機種がサポートしている機能を取得します。
     *
     * @param productCode 機種コード
     * @returns サポートしている機能
     */
    getFunctions(productCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield this.client.get(`/products/${productCode}/functions`);
            const functionList = response.data.ac_function_list;
            return functionList.reduce((prev, curr) => curr.function_value ? prev.add(curr.function_id) : prev, new Set());
        });
    }
    /**
     * 温度設定をサポートしている操作モードかを判定します。
     *
     * @param mode 操作モード
     * @returns 温度設定をサポートしているか
     */
    static isTemperatureSupport(mode) {
        return EoliaClient.TEMPERATURE_SUPPORT_MODES.includes(mode);
    }
}
exports.EoliaClient = EoliaClient;
EoliaClient.API_BASE_URL = 'https://app.rac.apws.panasonic.com/eolia/v5';
/**
 * 温度設定をサポートしている操作モード
 */
EoliaClient.TEMPERATURE_SUPPORT_MODES = ['Auto', 'Cooling', 'Heating', 'CoolDehumidifying'];
/**
 * 設定できる最低温度
 */
EoliaClient.MIN_TEMPERATURE = 16;
/**
 * 設定できる最高温度
 */
EoliaClient.MAX_TEMPERATURE = 30;
/**
 * 操作トークンが有効な時間(ミリ秒)
 */
EoliaClient.OPERATION_TOKEN_LIFETIME = 120000;
//# sourceMappingURL=EoliaClient.js.map