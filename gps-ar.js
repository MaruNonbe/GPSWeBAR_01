// =============================
// 1. 設定
// =============================

// ★ここをあなたのGASの「デプロイしたWebアプリURL」に変えてください
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/......../exec";

// 送信間隔（ms）…今回はイベントのたびに送るので使わないが一応残す
const LOG_INTERVAL_MS = 5000;

// 反応する距離（m）
const TRIGGER_DISTANCE_M = 100;

// 10地点
const TARGET_POINTS = [
  { name: 'TasParkHotel',      lat: 38.10148128126027,  lon: 140.0433090680094,  id: 'ar-point-1' },
  { name: 'MichinoEkiNagai',   lat: 38.108970970886325, lon: 140.04382939078403, id: 'ar-point-2' },
  { name: 'MNagaiShougakkou',  lat: 38.107796313044474, lon: 140.04269068239356, id: 'ar-point-3' },
  { name: 'Kozakurakan',       lat: 38.110963329145335, lon: 140.03632275489852, id: 'ar-point-4' },
  { name: 'Marudaiougiya',     lat: 38.11228246118919,  lon: 140.036198935986,   id: 'ar-point-5' },
  { name: 'Nagaisiyakusho',    lat: 38.1063333593554,   lon: 140.033892868012,   id: 'ar-point-6' },
  { name: 'NagaiKougyokoukou', lat: 38.114426209437404, lon: 140.03013087985815, id: 'ar-point-7' },
  { name: 'Nagaikoukou',       lat: 38.097283861825424, lon: 140.0380452392042,  id: 'ar-point-8' },
  { name: 'MinamiNagai',       lat: 38.09769549394771,  lon: 140.03458623775896, id: 'ar-point-9' },
  { name: 'Kurunt',            lat: 38.10491876278905,  lon: 140.03466346205656, id: 'ar-point-10' }
];


// =============================
// 2. ユーティリティ
// =============================
function getUserId() {
  let userId = localStorage.getItem('myWebArUserId');
  if (!userId) {
    userId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
    localStorage.setItem('myWebArUserId', userId);
  }
  return userId;
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // m
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function sendDataToSheet(logType, lat, lon, pointName, distance) {
  if (!GAS_WEB_APP_URL || GAS_WEB_APP_URL.indexOf("script.google.com") === -1) {
    // URLが未設定なら送らない
    console.warn("GAS_WEB_APP_URL が設定されていません。スプレッドシートには送信していません。");
    return;
  }

  const userId = getUserId();
  const formData = new FormData();
  formData.append('userId', userId);
  formData.append('logType', logType);
  formData.append('latitude', lat);
  formData.append('longitude', lon);
  formData.append('pointName', pointName || '');
  formData.append('distance', distance != null ? distance : '');

  fetch(GAS_WEB_APP_URL, {
    method: 'POST',
    body: formData,
    mode: 'no-cors'
  }).then(() => {
    console.log('送信:', logType, lat, lon, pointName, distance);
  }).catch(err => {
    console.error('送信エラー:', err);
  });
}


// =============================
// 3. メイン処理
// =============================
window.addEventListener('load', () => {
  // A-Frame のエンティティができるまで少し待つ
  setTimeout(() => {
    const camera = document.querySelector('[gps-camera]');
    if (!camera) {
      console.error('gps-camera が見つかりません');
      return;
    }

    // 位置が更新されるたびに飛んでくるイベント
    camera.addEventListener('gps-camera-update-position', (e) => {
      const latitude = e.detail.position.latitude;
      const longitude = e.detail.position.longitude;

      console.log('現在位置:', latitude, longitude);

      // 一番近い地点を探す
      let closest = null;
      let minDistance = Infinity;

      TARGET_POINTS.forEach(pt => {
        const d = getDistance(latitude, longitude, pt.lat, pt.lon);
        if (d < minDistance) {
          minDistance = d;
          closest = pt;
        }
      });

      // 表示コントロール
      if (closest && minDistance <= TRIGGER_DISTANCE_M) {
        // 近い地点だけ表示
        TARGET_POINTS.forEach(pt => {
          const el = document.getElementById(pt.id);
          if (!el) return;
          el.setAttribute('visible', pt.id === closest.id);
        });

        // ログ送信（近づいたとき）
        sendDataToSheet('AR_ACTIVE', latitude, longitude, closest.name, minDistance);
        console.log('近くにいる地点:', closest.name, minDistance.toFixed(1) + 'm');
      } else {
        // すべて非表示
        TARGET_POINTS.forEach(pt => {
          const el = document.getElementById(pt.id);
          if (!el) return;
          el.setAttribute('visible', false);
        });

        // ログ送信（移動中）
        sendDataToSheet('DRIVING', latitude, longitude, '', '');
      }
    });

  }, 1500);
});
