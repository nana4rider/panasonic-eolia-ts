import axios, { AxiosInstance } from 'axios';
import { DateTime } from 'luxon';
import { EoliaHttpError, EoliaTemperatureError } from './EoliaError';
import { EoliaBase } from './model/EoliaBase';
import { EoliaDevice } from './model/EoliaDevice';
import { EoliaOperation } from './model/EoliaOperation';
import { EoliaOperationMode } from './model/EoliaOperationMode';
import { EoliaStatus } from './model/EoliaStatus';

class EoliaClient {
  private static readonly API_BASE_URL = 'https://app.rac.apws.panasonic.com/eolia/v5';

  /**
   * 温度設定をサポートしている操作モード
   */
  static readonly TEMPERATURE_SUPPORT_MODES: EoliaOperationMode[] = ['Auto', 'Cooling', 'Heating', 'CoolDehumidifying'];

  /**
   * 設定できる最低温度
   */
  static readonly MIN_TEMPERATURE = 16;

  /**
   * 設定できる最高温度
   */
  static readonly MAX_TEMPERATURE = 30;

  /**
   * 操作トークンが有効な時間(ミリ秒)
   */
  static readonly OPERATION_TOKEN_LIFETIME = 120000;

  private client: AxiosInstance;

  /**
   * コンストラクタ
   *
   * @param userId ログインID
   * @param password パスワード
   * @param accessToken アクセストークン
   */
  constructor(private userId: string, private password: string, public accessToken?: string,
    baseURL: string = EoliaClient.API_BASE_URL) {

    const options = {
      baseURL: baseURL,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept-Language': 'ja-jp',
        'Accept-Encoding': 'gzip'
      },
    };

    this.client = axios.create(options);

    this.client.interceptors.request.use(requestConfig => {
      // console.log('[axios]', requestConfig.method, requestConfig.url);

      if (!requestConfig.headers) {
        return;
      }

      if (this.accessToken) {
        requestConfig.headers.Cookie = 'atkn=' + this.accessToken;
      }

      requestConfig.headers['X-Eolia-Date'] = DateTime.local().toFormat('yyyy-MM-dd\'T\'HH:mm:ss');

      return requestConfig;
    });

    this.client.interceptors.response.use(response => {
      if (response.headers['set-cookie']) {
        const resCookie: string = response.headers['set-cookie'][0];
        const tokenMatcher = resCookie.match(/atkn=(.+?);/);
        if (tokenMatcher) {
          this.accessToken = tokenMatcher[1];
        }
      }

      return response;
    }, async error => {
      const data = error.response.data;
      const httpStatus = error.response.status as number;
      // if (data.code) {
      //   console.log('[eolia]', httpStatus, data.code, data.message);
      // }

      if (error.response.status === 401 && !error.config._retry) {
        error.config._retry = true;
        await this.login();
        return this.client.request(error.config);
      }

      if (error.response.data.code) {
        throw new EoliaHttpError(error, httpStatus, data.code, data.message);
      } else {
        throw error;
      }
    });
  }

  /**
   * ログイン
   * 通常このメソッドは自動的に呼び出されるため、明示的に呼び出す必要はありません。
   */
  async login(userId = this.userId, password = this.password,
    options = {}) {
    const response = await this.client.post('/auth/login', {
      idpw: {
        id: userId,
        pass: password,
        terminal_type: 3,
        next_easy: true,
        ...options
      }
    });
    this.userId = userId;
    this.password = password;
    return response.data;
  }

  /**
   * ログアウト
   */
  async logout() {
    const response = await this.client.post('/auth/logout');
    return response.data;
  }

  /**
   * デバイスリストを取得します。
   */
  async getDevices(): Promise<EoliaDevice[]> {
    const response = await this.client.get('/devices');
    return response.data.ac_list;
  }

  /**
   * デバイス情報を取得します。
   *
   * @param applianceId 機器ID
   */
  async getDeviceStatus(applianceId: string): Promise<EoliaStatus> {
    const response = await this.client.get(`/devices/${applianceId}/status`);
    return { ...response.data, operation_token: null };
  }

  /**
   * デバイス情報を更新します。
   *
   * @param operation 更新情報
   */
  async setDeviceStatus(operation: EoliaOperation): Promise<EoliaStatus> {
    const applianceId = operation.appliance_id;
    const response = await this.client.put(`/devices/${applianceId}/status`, operation);
    operation.operation_token = response.data.operation_token;
    return response.data;
  }

  /**
   * デバイス情報から、更新情報を作成します。
   *
   * @param status デバイス情報
   */
  createOperation(status: EoliaStatus): EoliaOperation {
    if (EoliaClient.isTemperatureSupport(status.operation_mode)
      && (status.temperature < EoliaClient.MIN_TEMPERATURE
        || status.temperature > EoliaClient.MAX_TEMPERATURE)) {
      throw new EoliaTemperatureError(status.temperature);
    }

    const keys: (keyof EoliaBase)[] = [
      'appliance_id', 'operation_status', 'nanoex', 'wind_volume',
      'air_flow', 'wind_direction', 'wind_direction_horizon', 'timer_value',
      'operation_mode', 'temperature', 'ai_control', 'airquality',
      'operation_token'
    ];

    const operation: EoliaOperation = keys.reduce((obj, key) => {
      obj[key] = status[key];
      return obj;
    }, {} as any);

    if (operation.operation_mode === 'Stop') {
      operation.operation_mode = 'Auto';
    } else if (operation.operation_mode === 'Nanoe') {
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
  async getFunctions(productCode: string): Promise<Set<string>> {
    const response = await this.client.get(`/products/${productCode}/functions`);
    const functionList: { function_id: string, function_value: boolean }[] = response.data.ac_function_list;
    return functionList.reduce((prev, curr) => curr.function_value ? prev.add(curr.function_id) : prev, new Set<string>());
  }

  /**
   * 温度設定をサポートしている操作モードかを判定します。
   *
   * @param mode 操作モード
   * @returns 温度設定をサポートしているか
   */
  static isTemperatureSupport(mode: EoliaOperationMode): boolean {
    return EoliaClient.TEMPERATURE_SUPPORT_MODES.includes(mode);
  }
}

export { EoliaClient };
