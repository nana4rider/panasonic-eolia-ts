/** モード
* 停止 | 自動 | 冷房 | 暖房 | 除湿
* 冷房除湿 | 衣類乾燥 | 送風 | ナノイー | おそうじ | おでかけクリーン
*
* 送風かつnanoex=trueの場合、ナノイー扱いになる？
*/
declare const EoliaOperationMode: readonly ["Stop", "Auto", "Cooling", "Heating", "ComfortableDehumidification", "CoolDehumidifying", "ClothesDryer", "Blast", "Nanoe", "Cleaning", "NanoexCleaning"];
declare type EoliaOperationMode = typeof EoliaOperationMode[number];
export { EoliaOperationMode };
//# sourceMappingURL=EoliaOperationMode.d.ts.map