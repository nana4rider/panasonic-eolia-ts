/** モード
* 停止 | 自動 | 冷房 | 暖房 | 除湿
* 冷房除湿 | 衣類乾燥 | 送風 | ナノイー | おそうじ | おでかけクリーン
*
* 送風かつnanoex=trueの場合、ナノイー扱いになる？
*/
const EoliaOperationMode = [
  'Stop', 'Auto', 'Cooling', 'Heating', 'ComfortableDehumidification',
  'CoolDehumidifying', 'ClothesDryer', 'Blast', 'Nanoe', 'Cleaning', 'NanoexCleaning'
] as const;

type EoliaOperationMode = typeof EoliaOperationMode[number];

export { EoliaOperationMode };
