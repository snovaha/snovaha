/**
 * SNOVAHA Nub Theory Engine
 * 순수 계산 로직 — DOM/네트워크 의존성 없음.
 * Phase 3에서 AI 자동 측정으로 교체할 때 이 인터페이스만 유지하면 됩니다.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.NubEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var BOY_THRESHOLD = 30;      // 30° 이상 남아 추정
  var UNCERTAIN_BAND = 6;      // 30° ± 6° 는 판단 유보 구간
  var MAX_MARGIN = 25;         // 신뢰도 포화 마진

  /**
   * 두 선분(척추 기준선, 결절선) 사이의 각도를 0–90°로 반환.
   * @param {{x1,y1,x2,y2}} spine
   * @param {{x1,y1,x2,y2}} nub
   */
  function angleBetween(spine, nub) {
    var ax = spine.x2 - spine.x1;
    var ay = spine.y2 - spine.y1;
    var bx = nub.x2 - nub.x1;
    var by = nub.y2 - nub.y1;
    var la = Math.hypot(ax, ay);
    var lb = Math.hypot(bx, by);
    if (la === 0 || lb === 0) return 0;
    var cos = Math.abs(ax * bx + ay * by) / (la * lb);
    cos = Math.min(1, Math.max(-1, cos));
    var deg = (Math.acos(cos) * 180) / Math.PI; // 0..90
    return Math.round(deg * 10) / 10;
  }

  /**
   * 임신 주수 적합도.
   * @param {number} week 임신 주수 (10~15)
   */
  function weekSuitability(week) {
    if (week >= 12 && week <= 13) {
      return { factor: 1.0, suitable: true, message: '각도법에 가장 좋은 시기예요.' };
    }
    if (week === 11) {
      return { factor: 0.85, suitable: true, message: '측정 가능한 시기지만, 결절이 아직 작을 수 있어요.' };
    }
    if (week >= 14) {
      return { factor: 0.7, suitable: false, message: '주수가 지나 각도가 변했을 수 있어요. 참고만 해주세요.' };
    }
    // 10주 이하
    return { factor: 0.55, suitable: false, message: '아직 결절이 자라는 중이라 정확도가 많이 낮아요.' };
  }

  /**
   * 각도 + 주수 → 예측 결과.
   * @returns {{sex:'girl'|'boy', uncertain:boolean, confidence:number(50~90), angle:number}}
   */
  function predict(angleDeg, week) {
    var suit = weekSuitability(week);
    var sex = angleDeg >= BOY_THRESHOLD ? 'boy' : 'girl';
    var margin = Math.abs(angleDeg - BOY_THRESHOLD);
    var uncertain = margin < UNCERTAIN_BAND;

    // 마진 기반 기본 신뢰도 50~90%, 주수 계수로 감쇠 (하한 50%)
    var base = 0.5 + Math.min(margin, MAX_MARGIN) / MAX_MARGIN * 0.4;
    var confidence = Math.round(Math.max(0.5, base * suit.factor) * 100);

    return {
      sex: sex,
      uncertain: uncertain,
      confidence: confidence,
      angle: angleDeg,
      week: week,
      weekNote: suit.message,
      weekSuitable: suit.suitable
    };
  }

  return {
    angleBetween: angleBetween,
    weekSuitability: weekSuitability,
    predict: predict,
    BOY_THRESHOLD: BOY_THRESHOLD
  };
});
