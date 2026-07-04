// SNOVAHA 메인 홈 인터랙션
(function () {
  'use strict';

  // 히어로에 떠다니는 별
  var hero = document.querySelector('.home-hero');
  if (hero) {
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
  }

  // 스크롤 리빌
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }
})();
