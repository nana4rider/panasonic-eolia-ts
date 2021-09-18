import { EoliaDevice } from './model/EoliaDevice';
import { EoliaOperation } from './model/EoliaOperation';
import { EoliaOperationMode } from './model/EoliaOperationMode';
import { EoliaStatus } from './model/EoliaStatus';
declare class EoliaClient {
    private userId;
    private password;
    accessToken?: string | undefined;
    private static readonly API_BASE_URL;
    /**
     * 温度設定をサポートしている操作モード
     */
    static readonly TEMPERATURE_SUPPORT_MODES: EoliaOperationMode[];
    /**
     * 設定できる最低温度
     */
    static readonly MIN_TEMPERATURE = 16;
    /**
     * 設定できる最高温度
     */
    static readonly MAX_TEMPERATURE = 30;
    private client;
    /**
     * コンストラクタ
     *
     * @param userId ログインID
     * @param password パスワード
     * @param accessToken アクセストークン
     */
    constructor(userId: string, password: string, accessToken?: string | undefined, baseURL?: string);
    /**
     * ログイン
     * 通常このメソッドは自動的に呼び出されるため、明示的に呼び出す必要はありません。
     */
    login(userId?: string, password?: string, options?: {}): Promise<any>;
    /**
     * ログアウト
     */
    logout(): Promise<any>;
    /**
     * デバイスリストを取得します。
     */
    getDevices(): Promise<EoliaDevice[]>;
    /**
     * デバイス情報を取得します。
     *
     * @param applianceId 機器ID
     */
    getDeviceStatus(applianceId: string): Promise<EoliaStatus>;
    /**
     * デバイス情報を更新します。
     *
     * @param operation 更新情報
     */
    setDeviceStatus(operation: EoliaOperation): Promise<EoliaStatus>;
    /**
     * デバイス情報から、更新情報を作成します。
     *
     * @param status デバイス情報
     */
    createOperation(status: EoliaStatus): EoliaOperation;
    /**
     * 指定した機種がサポートしている機能を取得します。
     *
     * @param productCode 機種コード
     * @returns サポートしている機能
     */
    getFunctions(productCode: string): Promise<Set<string>>;
    /**
     * 温度設定をサポートしている操作モードかを判定します。
     *
     * @param mode 操作モード
     * @returns 温度設定をサポートしているか
     */
    static isTemperatureSupport(mode: EoliaOperationMode): boolean;
}
export { EoliaClient };
//# sourceMappingURL=EoliaClient.d.ts.map