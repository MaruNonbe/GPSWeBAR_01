// gps-ar.js
window.addEventListener('load', () => {
  const cam = document.querySelector('[gps-camera]');
  if (!cam) {
    console.warn('gps-camera が見つかりません');
    return;
  }

  // iOS 14+ で向きの許可をとる AR.js 内部の挙動があるので、
  // ここでは位置イベントだけ見る
  cam.addEventListener('gps-camera-update-position', (e) => {
    console.log('GPS位置:', e.detail.position);

    const { latitude, longitude } = e.detail.position;

    // 1つ目の地点だけ「半径5mなら表示」にしておく
    const targetLat = 38.10148128126027;
    const targetLon = 140.0433090680094;

    const dist = distanceMeter(latitude, longitude, targetLat, targetLon);
    // 5m以内なら表示
    const img1 = document.getElementById('ar-point-1');
    if (img1) {
      img1.setAttribute('visible', dist < 5);
    }
  });
});

// 簡易の距離計算(メートル)
function distanceMeter(lat1, lon1, lat2, lon2) {
  function toRad(v) { return v * Math.PI / 180; }
  const R = 6378137; // 地球の半径
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
