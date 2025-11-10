// gps-ar.js

// ユーザーの位置が更新されたら飛んでくるイベント
window.addEventListener('gps-camera-update-position', function (e) {
  console.log('GPS 位置取得:', e.detail.position);

  // ここでは「全部もう出しちゃう」ことにします
  // 本当は距離チェックして近いものだけ出すんだけど、
  // まずは Safari 上で画像が出るかだけ確認したいので全部 true にする
  [
    'ar-point-1',
    'ar-point-2',
    'ar-point-3',
    // 'ar-point-4', ...
  ].forEach(function (id) {
    var el = document.getElementById(id);
    if (el && !el.getAttribute('visible')) {
      el.setAttribute('visible', true);
    }
  });
});

// 念のため、シーンが読み込み終わったときのログ
window.addEventListener('load', function () {
  console.log('ページ読み込み完了');
});
