/**
 * SNOVAHA 각도법 앱
 * 모든 이미지 처리는 브라우저 안에서만 이뤄집니다. (네트워크 전송 없음 — CSP로도 차단)
 */
(function () {
  'use strict';

  var E = window.NubEngine;

  // ───────── 상태 ─────────
  var state = {
    week: null,
    img: null,           // 다운스케일된 HTMLCanvasElement (EXIF 제거됨)
    imgW: 0,
    imgH: 0,
    brightness: 100,
    // 선분: 캔버스 CSS 픽셀 좌표
    spine: null,         // {x1,y1,x2,y2}
    nub: null,
    dragging: null,      // {line:'spine'|'nub', point:1|2}
    result: null
  };

  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  var canvas = $('#measureCanvas');
  var ctx = canvas.getContext('2d');

  var COLORS = {
    spine: '#4d8df6',
    nub: '#f26d9c',
    handleRing: 'rgba(255,255,255,0.95)'
  };
  var HIT_RADIUS = 30;
  var MAX_IMG_SIDE = 2000;
  var MAX_FILE_MB = 25;

  // ───────── 스텝 내비게이션 ─────────
  function goToStep(n) {
    $$('.panel').forEach(function (p) {
      p.classList.toggle('active', Number(p.dataset.step) === n);
    });
    $$('.step-dot').forEach(function (d) {
      var dn = Number(d.dataset.step);
      d.classList.toggle('active', dn === n);
      d.classList.toggle('done', dn < n);
    });
    if (n === 3) requestAnimationFrame(setupCanvas);
  }

  // ───────── Step 1: 주수 ─────────
  $$('.week-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      $$('.week-chip').forEach(function (c) { c.classList.remove('selected'); });
      chip.classList.add('selected');
      state.week = Number(chip.dataset.week);

      var suit = E.weekSuitability(state.week);
      var note = $('#weekNote');
      note.textContent = suit.message;
      note.className = 'week-note ' + (suit.suitable ? 'ok' : 'warn');
      $('#toStep2').disabled = false;
    });
  });
  $('#toStep2').addEventListener('click', function () { goToStep(2); });

  // ───────── Step 2: 업로드 ─────────
  var dropzone = $('#dropzone');
  var fileInput = $('#fileInput');

  dropzone.addEventListener('click', function () { fileInput.click(); });
  dropzone.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
  });
  fileInput.addEventListener('change', function () {
    if (fileInput.files && fileInput.files[0]) handleFile(fileInput.files[0]);
  });
  ['dragover', 'dragenter'].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    dropzone.addEventListener(ev, function (e) { e.preventDefault(); dropzone.classList.remove('dragover'); });
  });
  dropzone.addEventListener('drop', function (e) {
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  $('#sampleBtn').addEventListener('click', function () {
    var img = new Image();
    img.onload = function () { acceptImage(img); };
    img.onerror = function () { showUploadError('예시 이미지를 불러오지 못했어요.'); };
    img.src = 'assets/images/ultrasound-example.jpg';
  });

  function showUploadError(msg) {
    var el = $('#uploadError');
    el.textContent = msg;
    el.classList.add('show');
  }

  function handleFile(file) {
    $('#uploadError').classList.remove('show');
    if (!/^image\//.test(file.type)) {
      showUploadError('이미지 파일만 올릴 수 있어요. (JPG, PNG, HEIC 등)');
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      showUploadError('사진이 너무 커요. ' + MAX_FILE_MB + 'MB 이하로 올려주세요.');
      return;
    }
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      URL.revokeObjectURL(url);
      acceptImage(img);
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      showUploadError('사진을 읽지 못했어요. 다른 형식(JPG/PNG)으로 시도해주세요.');
    };
    img.src = url;
  }

  // 캔버스로 재렌더링 → EXIF(위치정보 등) 자동 제거 + 다운스케일
  function acceptImage(img) {
    var iw = img.naturalWidth || img.width;
    var ih = img.naturalHeight || img.height;
    if (!iw || !ih) { showUploadError('사진을 읽지 못했어요.'); return; }

    var scale = Math.min(1, MAX_IMG_SIDE / Math.max(iw, ih));
    var w = Math.round(iw * scale);
    var h = Math.round(ih * scale);

    var off = document.createElement('canvas');
    off.width = w;
    off.height = h;
    off.getContext('2d').drawImage(img, 0, 0, w, h);

    state.img = off;
    state.imgW = w;
    state.imgH = h;
    state.spine = null;
    state.nub = null;
    fileInput.value = '';
    goToStep(3);
  }

  // ───────── Step 3: 측정 캔버스 ─────────
  var view = { dpr: 1, cssW: 0, cssH: 0, dx: 0, dy: 0, dw: 0, dh: 0 };

  function setupCanvas() {
    if (!state.img) return;
    var wrap = $('.canvas-wrap');
    var cssW = wrap.clientWidth;
    if (!cssW) return;
    var aspect = state.imgH / state.imgW;
    var cssH = Math.min(cssW * aspect, window.innerHeight * 0.68, 560);

    var oldW = view.cssW, oldH = view.cssH;
    view.dpr = Math.min(window.devicePixelRatio || 1, 3);
    view.cssW = cssW;
    view.cssH = cssH;
    canvas.style.height = cssH + 'px';
    canvas.width = Math.round(cssW * view.dpr);
    canvas.height = Math.round(cssH * view.dpr);

    // contain-fit 배치
    var s = Math.min(cssW / state.imgW, cssH / state.imgH);
    view.dw = state.imgW * s;
    view.dh = state.imgH * s;
    view.dx = (cssW - view.dw) / 2;
    view.dy = (cssH - view.dh) / 2;

    if (!state.spine) {
      // 기본 배치: 이미지 중앙부에 척추선(살짝 기울임), 그 위 결절선
      state.spine = lineFromImageRatio(0.28, 0.62, 0.72, 0.58);
      state.nub = lineFromImageRatio(0.52, 0.52, 0.72, 0.42);
    } else if (oldW && oldH) {
      // 리사이즈 시 비율 유지
      [state.spine, state.nub].forEach(function (L) {
        L.x1 *= cssW / oldW; L.x2 *= cssW / oldW;
        L.y1 *= cssH / oldH; L.y2 *= cssH / oldH;
      });
    }
    render();
  }

  function lineFromImageRatio(rx1, ry1, rx2, ry2) {
    return {
      x1: view.dx + view.dw * rx1, y1: view.dy + view.dh * ry1,
      x2: view.dx + view.dw * rx2, y2: view.dy + view.dh * ry2
    };
  }

  window.addEventListener('resize', function () {
    if ($('.panel[data-step="3"]').classList.contains('active')) setupCanvas();
  });

  function currentAngle() {
    if (!state.spine || !state.nub) return 0;
    return E.angleBetween(state.spine, state.nub);
  }

  function render() {
    if (!state.img) return;
    var w = view.cssW, h = view.cssH;
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#10131c';
    ctx.fillRect(0, 0, w, h);

    ctx.filter = 'brightness(' + state.brightness + '%)';
    ctx.drawImage(state.img, view.dx, view.dy, view.dw, view.dh);
    ctx.filter = 'none';

    drawLine(state.spine, COLORS.spine, '척추', 16);
    drawLine(state.nub, COLORS.nub, '결절', -26);
    drawAngleArc();
    drawHandles(state.spine, COLORS.spine);
    drawHandles(state.nub, COLORS.nub);
    if (state.dragging) drawLoupe();

    var a = currentAngle();
    $('#angleValue').textContent = a.toFixed(1) + '°';
    $('#angleHint').textContent = a >= E.BOY_THRESHOLD ? '30° 이상이면 남아 쪽' : '30° 미만이면 여아 쪽';
  }

  function extendLine(L, len) {
    var dx = L.x2 - L.x1, dy = L.y2 - L.y1;
    var d = Math.hypot(dx, dy) || 1;
    var ux = dx / d, uy = dy / d;
    return {
      x1: L.x1 - ux * len, y1: L.y1 - uy * len,
      x2: L.x2 + ux * len, y2: L.y2 + uy * len
    };
  }

  function drawLine(L, color, label, labelOffset) {
    // 연장 점선
    var ext = extendLine(L, Math.max(view.cssW, view.cssH));
    ctx.save();
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(ext.x1, ext.y1);
    ctx.lineTo(ext.x2, ext.y2);
    ctx.stroke();
    ctx.restore();

    // 본선 (글로우)
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(L.x1, L.y1);
    ctx.lineTo(L.x2, L.y2);
    ctx.stroke();
    ctx.restore();

    // 라벨
    var mx = (L.x1 + L.x2) / 2, my = (L.y1 + L.y2) / 2;
    ctx.save();
    ctx.font = '600 12px Pretendard, sans-serif';
    var tw = ctx.measureText(label).width;
    var pad = 7;
    var bx = mx - tw / 2 - pad, by = my + labelOffset;
    ctx.fillStyle = 'rgba(16,19,28,0.75)';
    roundRect(ctx, bx, by, tw + pad * 2, 20, 10);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    ctx.fillText(label, bx + pad, by + 10.5);
    ctx.restore();
  }

  function drawHandles(L, color) {
    [[L.x1, L.y1], [L.x2, L.y2]].forEach(function (p) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p[0], p[1], 9, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.handleRing;
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    });
  }

  // 두 직선 교점
  function intersection(a, b) {
    var d1x = a.x2 - a.x1, d1y = a.y2 - a.y1;
    var d2x = b.x2 - b.x1, d2y = b.y2 - b.y1;
    var denom = d1x * d2y - d1y * d2x;
    if (Math.abs(denom) < 1e-6) return null;
    var t = ((b.x1 - a.x1) * d2y - (b.y1 - a.y1) * d2x) / denom;
    return { x: a.x1 + d1x * t, y: a.y1 + d1y * t };
  }

  function drawAngleArc() {
    var P = intersection(state.spine, state.nub);
    if (!P) return;
    var a1 = Math.atan2(state.spine.y2 - state.spine.y1, state.spine.x2 - state.spine.x1);
    var a2 = Math.atan2(state.nub.y2 - state.nub.y1, state.nub.x2 - state.nub.x1);
    // 무방향 각도로 정규화해 최소 사잇각 호를 그림
    var diff = a2 - a1;
    while (diff > Math.PI / 2) diff -= Math.PI;
    while (diff < -Math.PI / 2) diff += Math.PI;

    var r = 34;
    ctx.save();
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(P.x, P.y, r, a1, a1 + diff, diff < 0);
    ctx.stroke();

    var mid = a1 + diff / 2;
    var tx = P.x + Math.cos(mid) * (r + 18);
    var ty = P.y + Math.sin(mid) * (r + 18);
    tx = Math.min(Math.max(tx, 24), view.cssW - 24);
    ty = Math.min(Math.max(ty, 16), view.cssH - 12);
    ctx.font = '800 14px Pretendard, sans-serif';
    ctx.fillStyle = '#ffd166';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 4;
    ctx.fillText(currentAngle().toFixed(1) + '°', tx, ty);
    ctx.restore();
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  // 돋보기 (드래그 중 손가락 위쪽에 확대 뷰)
  function drawLoupe() {
    var d = state.dragging;
    var L = state[d.line];
    var px = d.point === 1 ? L.x1 : L.x2;
    var py = d.point === 1 ? L.y1 : L.y2;

    var R = 56, zoom = 2.4;
    var cx = px, cy = py - R - 34;
    if (cy - R < 6) cy = py + R + 34;
    cx = Math.min(Math.max(cx, R + 6), view.cssW - R - 6);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = '#10131c';
    ctx.fill();
    ctx.clip();

    // 캔버스 좌표 → 이미지 좌표
    var ix = (px - view.dx) / view.dw * state.imgW;
    var iy = (py - view.dy) / view.dh * state.imgH;
    var sw = (R * 2 / zoom) * (state.imgW / view.dw);
    var sh = (R * 2 / zoom) * (state.imgH / view.dh);
    ctx.filter = 'brightness(' + state.brightness + '%)';
    ctx.drawImage(state.img, ix - sw / 2, iy - sh / 2, sw, sh, cx - R, cy - R, R * 2, R * 2);
    ctx.filter = 'none';

    // 십자선
    var col = d.line === 'spine' ? COLORS.spine : COLORS.nub;
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy); ctx.lineTo(cx + 12, cy);
    ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy + 12);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = col;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.restore();
  }

  // ───────── 포인터 인터랙션 ─────────
  function canvasPoint(e) {
    var rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function hitTest(p) {
    var best = null, bestDist = HIT_RADIUS;
    [['spine', 1], ['spine', 2], ['nub', 1], ['nub', 2]].forEach(function (cand) {
      var L = state[cand[0]];
      var hx = cand[1] === 1 ? L.x1 : L.x2;
      var hy = cand[1] === 1 ? L.y1 : L.y2;
      var dist = Math.hypot(p.x - hx, p.y - hy);
      if (dist < bestDist) { bestDist = dist; best = { line: cand[0], point: cand[1] }; }
    });
    return best;
  }

  canvas.addEventListener('pointerdown', function (e) {
    if (!state.img) return;
    var p = canvasPoint(e);
    var hit = hitTest(p);
    if (hit) {
      state.dragging = hit;
      canvas.setPointerCapture(e.pointerId);
      e.preventDefault();
      render();
    }
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!state.dragging) return;
    var p = canvasPoint(e);
    var L = state[state.dragging.line];
    var x = Math.min(Math.max(p.x, 0), view.cssW);
    var y = Math.min(Math.max(p.y, 0), view.cssH);
    if (state.dragging.point === 1) { L.x1 = x; L.y1 = y; }
    else { L.x2 = x; L.y2 = y; }
    render();
  });
  ['pointerup', 'pointercancel'].forEach(function (ev) {
    canvas.addEventListener(ev, function () {
      if (state.dragging) { state.dragging = null; render(); }
    });
  });

  $('#brightness').addEventListener('input', function (e) {
    state.brightness = Number(e.target.value);
    render();
  });
  $('#resetLines').addEventListener('click', function () {
    state.spine = lineFromImageRatio(0.28, 0.62, 0.72, 0.58);
    state.nub = lineFromImageRatio(0.52, 0.52, 0.72, 0.42);
    render();
  });
  $('#backToUpload').addEventListener('click', function () { goToStep(2); });

  // ───────── 결과 리빌 ─────────
  var overlay = $('#revealOverlay');
  var revealTimer = null;

  $('#showResult').addEventListener('click', function () {
    var angle = currentAngle();
    state.result = E.predict(angle, state.week || 12);
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    $('#heartbeatStage').style.display = 'block';
    $('#resultStage').classList.remove('show');
    // 광고가 설정되어 있으면 대기 화면에 노출하고 리빌을 조금 늦춤
    var adShown = window.SnovahaAds && window.SnovahaAds.render('adHeartbeat', 'heartbeat');
    revealTimer = setTimeout(showResultStage, adShown ? 6500 : 2800);
  });

  function showResultStage() {
    var r = state.result;
    $('#heartbeatStage').style.display = 'none';

    var isGirl = r.sex === 'girl';
    var emoji = isGirl ? '👧' : '👦';
    var title, message;

    if (r.uncertain) {
      title = '아기가 아직 비밀로 하고 싶은가 봐요';
      message = '각도가 30°에 가까워서 조심스럽지만,<br>살짝 <b>' + (isGirl ? '딸' : '아들') + '</b> 쪽으로 기울어 있어요.<br>조금 더 기다리면 아기가 알려줄 거예요 🤫';
      emoji = '🤫';
    } else if (isGirl) {
      title = '<span class="girl">딸</span>일 가능성이 높아요';
      message = '분홍빛 설렘이 느껴지네요.<br>세상에서 가장 사랑스러운 공주님,<br>곧 만나요 💗';
    } else {
      title = '<span class="boy">아들</span>일 가능성이 높아요';
      message = '듬직한 씩씩함이 느껴지네요.<br>세상에서 가장 멋진 왕자님,<br>곧 만나요 💙';
    }

    $('#resultEmoji').textContent = emoji;
    $('#resultTitle').innerHTML = title;
    $('#resultMessage').innerHTML = message;
    $('#statAngle').textContent = r.angle.toFixed(1) + '°';
    $('#statWeek').textContent = weekLabel(r.week);
    $('#statConf').textContent = r.confidence + '%';
    $('#resultWeekNote').textContent = r.weekNote;

    var fill = $('#confFill');
    fill.className = 'fill ' + r.sex;
    fill.style.width = '0';

    $('#resultStage').classList.add('show');
    requestAnimationFrame(function () { fill.style.width = r.confidence + '%'; });
    burstStars(isGirl && !r.uncertain ? '💗' : (!isGirl && !r.uncertain ? '💙' : '⭐'));
    if (window.SnovahaAds) window.SnovahaAds.render('adResult', 'result');
  }

  function weekLabel(w) {
    if (w <= 10) return '~10주';
    if (w >= 14) return '14주~';
    return w + '주';
  }

  function burstStars(emoji) {
    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2.4;
    for (var i = 0; i < 16; i++) {
      var s = document.createElement('span');
      s.className = 'burst-star';
      s.textContent = i % 3 === 0 ? '✨' : emoji;
      var ang = Math.random() * Math.PI * 2;
      var dist = 90 + Math.random() * 170;
      s.style.left = cx + 'px';
      s.style.top = cy + 'px';
      s.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
      s.style.setProperty('--dy', Math.sin(ang) * dist + 'px');
      document.body.appendChild(s);
      setTimeout(function (el) { return function () { el.remove(); }; }(s), 1500);
    }
  }

  function closeOverlay() {
    clearTimeout(revealTimer);
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  $('#backToMeasure').addEventListener('click', function () {
    closeOverlay();
    goToStep(3);
  });
  $('#restartAll').addEventListener('click', function () {
    closeOverlay();
    state.img = null;
    state.spine = null;
    state.nub = null;
    state.week = null;
    state.result = null;
    $$('.week-chip').forEach(function (c) { c.classList.remove('selected'); });
    $('#weekNote').className = 'week-note';
    $('#toStep2').disabled = true;
    goToStep(1);
    $('#app').scrollIntoView({ behavior: 'smooth' });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('show')) {
      closeOverlay();
      goToStep(3);
    }
  });

  // ───────── 결과 카드 (기기 내 저장용 이미지) ─────────
  function buildResultCard() {
    var r = state.result;
    var W = 1080, H = 1350;
    var c = document.createElement('canvas');
    c.width = W; c.height = H;
    var x = c.getContext('2d');
    var isGirl = r.sex === 'girl';

    // 배경
    var g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#141a38');
    g.addColorStop(1, isGirl ? '#3d1f33' : '#1c2a4d');
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);

    // 별
    for (var i = 0; i < 90; i++) {
      x.save();
      x.globalAlpha = 0.25 + Math.random() * 0.65;
      x.fillStyle = Math.random() < 0.25 ? '#ffd166' : '#ffffff';
      var sx = Math.random() * W, sy = Math.random() * H;
      x.beginPath();
      x.arc(sx, sy, Math.random() * 2.2 + 0.6, 0, Math.PI * 2);
      x.fill();
      x.restore();
    }

    x.textAlign = 'center';
    x.fillStyle = 'rgba(255,255,255,0.55)';
    x.font = '600 30px Pretendard, sans-serif';
    x.fillText('SNOVAHA 각도법', W / 2, 100);

    // 측정 이미지 스냅샷 (둥근 모서리)
    var mw = 840;
    var mh = Math.min(mw * (view.cssH / view.cssW), 620);
    var mx0 = (W - mw) / 2, my0 = 150;
    x.save();
    roundRect(x, mx0, my0, mw, mh, 28);
    x.clip();
    x.drawImage(canvas, mx0, my0, mw, mh);
    x.restore();
    x.save();
    roundRect(x, mx0, my0, mw, mh, 28);
    x.strokeStyle = 'rgba(255,255,255,0.18)';
    x.lineWidth = 3;
    x.stroke();
    x.restore();

    var ty = my0 + mh + 130;
    x.font = '800 92px Pretendard, sans-serif';
    if (r.uncertain) {
      x.fillStyle = '#ffd166';
      x.fillText('아직은 비밀 🤫', W / 2, ty);
    } else {
      x.fillStyle = isGirl ? '#ff9dbf' : '#8ab6ff';
      x.fillText(isGirl ? '딸일 것 같아요 💗' : '아들일 것 같아요 💙', W / 2, ty);
    }

    x.fillStyle = 'rgba(255,255,255,0.85)';
    x.font = '600 40px Pretendard, sans-serif';
    x.fillText('각도 ' + r.angle.toFixed(1) + '°  ·  ' + weekLabel(r.week) + '  ·  신뢰도 ' + r.confidence + '%', W / 2, ty + 80);

    var d = new Date();
    var dateStr = d.getFullYear() + '년 ' + (d.getMonth() + 1) + '월 ' + d.getDate() + '일';
    x.fillStyle = 'rgba(255,255,255,0.5)';
    x.font = '500 32px Pretendard, sans-serif';
    x.fillText(dateStr + ', 우리가 처음 나눈 비밀', W / 2, ty + 150);

    x.fillStyle = 'rgba(255,255,255,0.35)';
    x.font = '500 26px Pretendard, sans-serif';
    x.fillText('www.snovaha.com · 의학적 진단이 아닌 참고용이에요', W / 2, H - 60);

    return c;
  }

  $('#saveCard').addEventListener('click', function () {
    var card = buildResultCard();
    card.toBlob(function (blob) {
      if (!blob) return;
      var file = new File([blob], 'snovaha-nub-theory.png', { type: 'image/png' });
      // 모바일: 공유 시트 (사진 앱 저장 포함), 데스크톱: 다운로드
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'SNOVAHA 각도법' }).catch(function () { downloadBlob(blob); });
      } else {
        downloadBlob(blob);
      }
    }, 'image/png');
  });

  function downloadBlob(blob) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'snovaha-nub-theory.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
  }

  // ───────── 히어로 별 + CTA ─────────
  (function scatterStars() {
    var hero = $('.hero');
    var glyphs = ['✦', '✧', '⋆', '✶'];
    for (var i = 0; i < 14; i++) {
      var s = document.createElement('span');
      s.className = 'star';
      s.textContent = glyphs[i % glyphs.length];
      s.style.left = (5 + Math.random() * 90) + '%';
      s.style.top = (8 + Math.random() * 80) + '%';
      s.style.fontSize = (10 + Math.random() * 14) + 'px';
      s.style.animationDelay = (Math.random() * 4) + 's';
      s.style.animationDuration = (3 + Math.random() * 3) + 's';
      hero.appendChild(s);
    }
  })();

  $('#startBtn').addEventListener('click', function () {
    $('#app').scrollIntoView({ behavior: 'smooth' });
  });

  if (window.SnovahaAds) window.SnovahaAds.render('adMeasure', 'measure');

  goToStep(1);
})();
