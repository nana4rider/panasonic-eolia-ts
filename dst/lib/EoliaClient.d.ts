import { EoliaDevice } from './model/EoliaDevice';
import { EoliaOperation } from './model/EoliaOperation';
import { EoliaOperationMode } from './model/EoliaOperationMode';
import { EoliaStatus } from './model/EoliaStatus';
declare class EoliaClient {
    private userId;
    private password;
    accessToken?: string | undefined;
    static readonly API_BASE_URL = "https://app.rac.apws.panasonic.com/eolia/v2";
    static readonly TEMPERATURE_SUPPORT_MODES: EoliaOperationMode[];
    static readonly MIN_TEMPERATURE = 16;
    static readonly MAX_TEMPERATURE = 30;
    private client;
    constructor(userId: string, password: string, accessToken?: string | undefined, baseURL?: string);
    login(userId?: string, password?: string, options?: {}): Promise<any>;
    logout(): Promise<any>;
    getDevices(): Promise<EoliaDevice[]>;
    getDeviceStatus(applianceId: string): Promise<EoliaStatus>;
    setDeviceStatus(operation: EoliaOperation): Promise<EoliaStatus>;
    createOperation(status: EoliaStatus): EoliaOperation;
    static isTemperatureSupport(mode: EoliaOperationMode): boolean;
}
export { EoliaClient };
//# sourceMappingURL=EoliaClient.d.ts.map