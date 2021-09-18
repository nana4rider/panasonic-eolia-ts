# panasonic-eolia-ts

Panasonic Eolia Client

```ts
const client = new EoliaClient('userId', 'password');

const devices = await client.getDevices();

const firstDevice = devices[0];
console.log('エアコン名', firstDevice.nickname);

const status = await client.getDeviceStatus(firstDevice.appliance_id);
console.log('運転モード', status.operation_mode);
console.log('風量', status.wind_volume);

const operation = await client.createOperation(status);

// 冷房26.5度に切替
operation.operation_mode = 'Cooling';
operation.temperature = 26.5;

await client.setDeviceStatus(operation);
```
