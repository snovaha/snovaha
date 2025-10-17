// minimal interactions for home page
(function () {
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduce) return;
  const bg = document.querySelector('.hero-bg');
  if (!bg) return;
  let rafId = null;
  const onMove = (e) => {
    const x = (e.clientX || (e.touches && e.touches[0].clientX) || window.innerWidth/2) / window.innerWidth - 0.5;
    const y = (e.clientY || (e.touches && e.touches[0].clientY) || window.innerHeight/2) / window.innerHeight - 0.5;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      bg.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
    });
  };
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('touchmove', onMove, { passive: true });
})();

