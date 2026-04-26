(() => {
  const scene = document.getElementById("scene");
  const left = document.getElementById("left");
  const center = document.getElementById("center");
  const right = document.getElementById("right");

  if (!scene || !left || !center || !right) return;

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const normalize = (value, start, end) => (value - start) / (end - start);

  // Smooth interpolation (no sudden jumps)
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  const cfg = {
    stage1End: 0.38,  // line drawing completes
    stage2Start: 0.36,
    leftStagger: 0.06,
    rightStagger: 0.12
  };

  let isActive = false;
  let rafId = null;
  let lastProgress = -1;

  function cssVarPx(name, fallback) {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
    const v = parseFloat(raw);
    return Number.isFinite(v) ? v : fallback;
  }

  function getProgress() {
    const viewportH = window.innerHeight;
    const total = scene.offsetHeight - viewportH;

    if (total <= 0) {
      return scene.getBoundingClientRect().top <= 0 ? 1 : 0;
    }

    const scrolled = window.scrollY - scene.offsetTop;
    return clamp(scrolled / total);
  }

  function applyTransforms(progress) {
    if (progress === lastProgress) return;
    lastProgress = progress;

    const panelWidth = cssVarPx("--panel-width", 140);
    const lineWidth = cssVarPx("--line-width", 6);
    const thinScaleX = lineWidth / panelWidth;

    // Stage 1: vertical line draws from top -> bottom using scaleY + origin top
    const stage1 = clamp(normalize(progress, 0, cfg.stage1End));
    const stage1Eased = easeOutCubic(stage1);

    // Stage 2: unfold panels with perspective rotateY
    const stage2 = clamp(normalize(progress, cfg.stage2Start, 1));
    const stage2Eased = easeOutCubic(stage2);

    // Center panel: remains flat; starts as thin line then expands to full width
    const centerScaleY = stage1Eased;
    const centerScaleX = thinScaleX + (1 - thinScaleX) * stage2Eased;

    center.style.transform = `scaleX(${centerScaleX}) scaleY(${centerScaleY})`;
    center.style.background = centerScaleX < 0.2
      ? "var(--line-color)"
      : "linear-gradient(180deg, #d9f2ff, var(--panel-main))";

    // Left and right fold panels with slight stagger for realism
    const leftP = clamp(stage2Eased - cfg.leftStagger);
    const rightP = clamp(stage2Eased - cfg.rightStagger);

    const leftAngle = -90 + leftP * 90;   // -90 -> 0
    const rightAngle = 90 - rightP * 90;  // 90 -> 0

    left.style.transform = `rotateY(${leftAngle}deg)`;
    right.style.transform = `rotateY(${rightAngle}deg)`;

    // Optional depth/shadow + tiny trapezoid effect via clip-path
    const leftShadow = 0.08 + 0.16 * leftP;
    const rightShadow = 0.08 + 0.16 * rightP;

    left.style.boxShadow = `${-6 * (1 - leftP)}px 10px 22px rgba(10, 20, 40, ${leftShadow})`;
    right.style.boxShadow = `${6 * (1 - rightP)}px 10px 22px rgba(10, 20, 40, ${rightShadow})`;

    const skewL = (1 - leftP) * 1.2;
    const skewR = (1 - rightP) * 1.2;

    left.style.clipPath = `polygon(0 0, 100% ${skewL}%, 100% ${100 - skewL}%, 0 100%)`;
    right.style.clipPath = `polygon(0 ${skewR}%, 100% 0, 100% 100%, 0 ${100 - skewR}%)`;
  }

  function tick() {
    rafId = requestAnimationFrame(() => {
      applyTransforms(getProgress());
      if (isActive) tick();
    });
  }

  function start() {
    if (isActive) return;
    isActive = true;
    tick();
  }

  function stop() {
    isActive = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  // IntersectionObserver: preferred, reduces work when scene is offscreen
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) start();
        else stop();
      });
    },
    { threshold: 0.01 }
  );

  observer.observe(scene);

  // Initial state
  applyTransforms(getProgress());

  // Keep in sync on viewport changes
  window.addEventListener("resize", () => applyTransforms(getProgress()), { passive: true });
  window.addEventListener("scroll", () => {
    if (!isActive) start();
  }, { passive: true });
})();
