import { EoliaAiControl } from './EoliaAiControl';
import { EoliaAirFlow } from './EoliaAirFlow';
import { EoliaOperationMode } from './EoliaOperationMode';
import { EoliaTimerValue } from './EoliaTimerValue';
import { EoliaWindDirection } from './EoliaWindDirection';
import { EoliaWindDirectionHorizon } from './EoliaWindDirectionHorizon';
import { EoliaWindVolume } from './EoliaWindVolume';

export interface EoliaBase {
  /** 機器ID */
  appliance_id: string;

  /** 操作トークン */
  operation_token: string | null;

  /** 状態 true:運転 false:停止 */
  operation_status: boolean;

  /** ナノイーX */
  nanoex: boolean;

  /** 風量 */
  wind_volume: EoliaWindVolume;

  /** 風量オプション */
  air_flow: EoliaAirFlow;

  /** 風向上下 */
  wind_direction: EoliaWindDirection

  /** 風向き左右 */
  wind_direction_horizon: EoliaWindDirectionHorizon

  /** 切タイマー */
  timer_value: EoliaTimerValue;

  /** 運転モード */
  operation_mode: EoliaOperationMode;

  /** 温度 min:16 max:30 step:0.5 */
  temperature: number;

  /** AIコントロール */
  ai_control: EoliaAiControl;

  /** 不明 */
  airquality: false;
}
