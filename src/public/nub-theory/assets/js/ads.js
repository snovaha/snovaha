/**
 * SNOVAHA 광고 모듈 (Google AdSense)
 *
 * 활성화 방법:
 *  1. AdSense 계정 승인 후 아래 CONFIG.client 에 'ca-pub-…' ID 입력
 *  2. AdSense 콘솔에서 광고 단위 3개 생성 후 slots 에 슬롯 ID 입력
 *  3. 사이트 루트에 ads.txt 업로드 (AdSense 안내 참고)
 *
 * client 가 비어 있으면 광고 스크립트를 아예 로드하지 않으며,
 * 페이지는 광고 없이 기존과 동일하게 동작합니다.
 */
(function () {
  'use strict';

  var CONFIG = {
    client: '',                 // 예: 'ca-pub-1234567890123456'
    slots: {
      measure: '',              // 측정 페이지 하단 광고 슬롯 ID
      heartbeat: '',            // 결과 대기(두근두근) 광고 슬롯 ID
      result: ''                // 결과 화면 하단 광고 슬롯 ID
    }
  };

  var enabled = /^ca-pub-\d+$/.test(CONFIG.client);
  var scriptLoaded = false;

  function ensureScript() {
    if (scriptLoaded) return;
    scriptLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + CONFIG.client;
    s.crossOrigin = 'anonymous';
    document.head.appendChild(s);
  }

  /**
   * 지정 컨테이너에 반응형 광고 렌더링.
   * @returns {boolean} 광고를 실제로 붙였는지 (게이팅/대기시간 연장 판단용)
   */
  function render(containerId, slotKey) {
    if (!enabled) return false;
    var el = document.getElementById(containerId);
    var slot = CONFIG.slots[slotKey];
    if (!el || !slot || el.dataset.filled) return !!(el && el.dataset.filled);

    ensureScript();
    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle ad-unit';
    ins.setAttribute('data-ad-client', CONFIG.client);
    ins.setAttribute('data-ad-slot', slot);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    el.appendChild(ins);
    el.dataset.filled = '1';
    el.classList.add('ad-visible');
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    return true;
  }

  window.SnovahaAds = { enabled: enabled, render: render };
})();
