// 커뮤니티 — 히어로 별
(function () {
  'use strict';
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var glyphs = ['✦', '✧', '⋆', '✶'];
  for (var i = 0; i < 12; i++) {
    var s = document.createElement('span');
    s.className = 'star';
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = (5 + Math.random() * 90) + '%';
    s.style.top = (10 + Math.random() * 75) + '%';
    s.style.fontSize = (10 + Math.random() * 14) + 'px';
    s.style.animationDelay = (Math.random() * 4) + 's';
    s.style.animationDuration = (3 + Math.random() * 3) + 's';
    hero.appendChild(s);
  }
})();
