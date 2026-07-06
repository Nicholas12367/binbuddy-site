/* Bin Buddy - interactions. No dependencies, ~2KB gzipped. */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky nav state ---------- */
  const nav = $(".nav");
  const floatCall = $(".float-call");
  let heroHeight = window.innerHeight;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 24);
    floatCall.classList.toggle("show", y > heroHeight * 0.9);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    // Stagger siblings that enter together
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const parent = el.parentElement;
        const siblings = parent ? [...parent.children].filter((c) => c.classList.contains("reveal") && !c.classList.contains("in")) : [el];
        const idx = Math.max(siblings.indexOf(el), 0);
        el.style.transitionDelay = `${Math.min(idx * 90, 450)}ms`;
        el.classList.add("in");
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Scroll-driven wash wipe ---------- */
  const transformSection = $(".transform");
  const washAfter = $("#washAfter");
  const washJet = $("#washJet");
  const washStage = $("#washStage");
  if (transformSection && washAfter && !reduceMotion) {
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = transformSection.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = Math.min(Math.max(-rect.top / total, 0), 1);
      // Ease the wipe: hold at start, finish before the end
      const p = Math.min(Math.max((progress - 0.12) / 0.7, 0), 1);
      const pct = (p * 100).toFixed(2);
      washAfter.style.clipPath = `inset(0 0 ${100 - pct}% 0)`;
      const stageH = washStage.offsetHeight;
      washJet.style.transform = `translateY(${(p * stageH - 4).toFixed(1)}px)`;
      washJet.style.opacity = p > 0.005 && p < 0.995 ? "1" : "0";
    };
    const req = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    window.addEventListener("scroll", req, { passive: true });
    window.addEventListener("resize", req, { passive: true });
    update();
  } else if (washAfter) {
    // Reduced motion: show split view
    washAfter.style.clipPath = "inset(0 0 50% 0)";
    if (washJet) washJet.style.display = "none";
  }

  /* ---------- Truck compare: auto wash sweep on scroll ---------- */
  const compare = $("#compare");
  const clip = $("#compareClip");
  const sweep = $("#compareSweep");
  const tagDirty = $("#compareTagDirty");
  if (compare && clip && sweep) {
    if (reduceMotion) {
      clip.style.clipPath = "inset(0 0 0 50%)";
      sweep.style.display = "none";
    } else {
      let ticking = false;
      const update = () => {
        ticking = false;
        const rect = compare.getBoundingClientRect();
        const vh = window.innerHeight;
        // Wait until the whole truck is in view, pause a beat, then sweep.
        // If the truck is taller than the screen, start once it fills the view.
        const start = rect.height < vh * 0.9
          ? vh - rect.height - vh * 0.05
          : vh * 0.12;
        const end = start - vh * 0.34;
        const p = Math.min(Math.max((start - rect.top) / (start - end), 0), 1);
        const pct = p * 100;
        // Clean image is revealed from the left, dirty remains on the right
        clip.style.clipPath = `inset(0 ${(100 - pct).toFixed(2)}% 0 0)`;
        sweep.style.left = `${pct.toFixed(2)}%`;
        sweep.style.opacity = p > 0.01 && p < 0.99 ? "1" : "0";
        if (tagDirty) tagDirty.style.opacity = p > 0.92 ? "0" : "1";
      };
      const req = () => {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      };
      window.addEventListener("scroll", req, { passive: true });
      window.addEventListener("resize", req, { passive: true });
      update();
    }
  }

  /* ---------- Quote form -> prefilled mailto ---------- */
  const form = $("#quoteForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#qName").value.trim();
      const addr = $("#qAddr").value.trim();
      const service = $("#qService").value;
      const phone = $("#qPhone").value.trim();
      const notes = $("#qNotes").value.trim();
      const subject = `Booking: ${service}`;
      const body = [
        "Hi Bin Buddy,",
        "",
        "I would like to book. Here are my details:",
        "",
        `Name: ${name || "(your name)"}`,
        `Address or area: ${addr || "(your address)"}`,
        `What I need: ${service}`,
        `Phone: ${phone || "(so you can text me)"}`,
        notes ? `Notes: ${notes}` : "Notes:",
        "",
        "Thank you!"
      ].join("\n");
      window.location.href =
        `mailto:fluidhauler@outlook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  /* ---------- Snow Buddy mailto ---------- */
  const snowEmail = $("#snowEmail");
  if (snowEmail) {
    const subject = "Snow Buddy winter services";
    const body = [
      "Hi Bin Buddy,",
      "",
      "I want to ask about Snow Buddy winter services.",
      "",
      "Name:",
      "Address:",
      "What to clear (driveway / sidewalks / lot):",
      "Phone:",
      "",
      "Thank you!"
    ].join("\n");
    snowEmail.href =
      `mailto:fluidhauler@outlook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }
})();
