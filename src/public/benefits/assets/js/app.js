// 육아혜택 — 카테고리 필터
(function () {
  'use strict';

  var tabs = document.querySelectorAll('.tab');
  var cards = document.querySelectorAll('.b-card');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var filter = tab.dataset.filter;
      cards.forEach(function (card) {
        card.classList.toggle('hidden', filter !== 'all' && card.dataset.cat !== filter);
      });
    });
  });
})();
