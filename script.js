(function () {
  "use strict";

  const els = {
    basisFlourBtn: document.getElementById("basisFlourBtn"),
    basisPanBtn: document.getElementById("basisPanBtn"),
    flourBasis: document.getElementById("flourBasis"),
    panBasis: document.getElementById("panBasis"),

    flourWeight: document.getElementById("flourWeight"),

    panShape: document.getElementById("panShape"),
    rectInputs: document.getElementById("rectInputs"),
    roundInputs: document.getElementById("roundInputs"),
    panLength: document.getElementById("panLength"),
    panWidth: document.getElementById("panWidth"),
    panDiameter: document.getElementById("panDiameter"),
    panCount: document.getElementById("panCount"),
    doughStyle: document.getElementById("doughStyle"),
    panDoughWeight: document.getElementById("panDoughWeight"),

    hydration: document.getElementById("hydration"),
    salt: document.getElementById("salt"),
    oil: document.getElementById("oil"),
    yeast: document.getElementById("yeast"),
    resetDefaults: document.getElementById("resetDefaults"),

    resFlour: document.getElementById("resFlour"),
    pctWater: document.getElementById("pctWater"),
    resWater: document.getElementById("resWater"),
    pctSalt: document.getElementById("pctSalt"),
    resSalt: document.getElementById("resSalt"),
    pctOil: document.getElementById("pctOil"),
    resOil: document.getElementById("resOil"),
    pctYeast: document.getElementById("pctYeast"),
    resYeast: document.getElementById("resYeast"),
    resTotal: document.getElementById("resTotal"),

    perPanNote: document.getElementById("perPanNote"),
    resPerPan: document.getElementById("resPerPan"),
    resPanCount: document.getElementById("resPanCount"),
  };

  const DEFAULTS = { hydration: 78, salt: 2.2, oil: 5, yeast: 1 };

  let basis = "flour"; // "flour" | "pan"

  function fmtGrams(g) {
    if (!isFinite(g) || g < 0) return "–";
    return `${Math.round(g)} g`;
  }

  function num(el) {
    const v = parseFloat(el.value);
    return isFinite(v) ? v : 0;
  }

  function setBasis(next) {
    basis = next;
    els.basisFlourBtn.classList.toggle("active", basis === "flour");
    els.basisPanBtn.classList.toggle("active", basis === "pan");
    els.flourBasis.classList.toggle("hidden", basis !== "flour");
    els.panBasis.classList.toggle("hidden", basis !== "pan");
    calculate();
  }

  function setPanShape(shape) {
    els.rectInputs.classList.toggle("hidden", shape !== "rect");
    els.roundInputs.classList.toggle("hidden", shape !== "round");
  }

  function panAreaCm2() {
    if (els.panShape.value === "round") {
      const d = num(els.panDiameter);
      const r = d / 2;
      return Math.PI * r * r;
    }
    const l = num(els.panLength);
    const w = num(els.panWidth);
    return l * w;
  }

  function totalDoughFromPan() {
    const area = panAreaCm2();
    const loadPerCm2 = parseFloat(els.doughStyle.value) || 0.55;
    const count = Math.max(1, Math.round(num(els.panCount)));
    return area * loadPerCm2 * count;
  }

  function calculate() {
    const hydration = num(els.hydration);
    const salt = num(els.salt);
    const oil = num(els.oil);
    const yeast = num(els.yeast);
    const totalPercent = 100 + hydration + salt + oil + yeast;

    let flourWeight;
    let panDough = null;
    let panCount = 1;

    if (basis === "pan") {
      panDough = totalDoughFromPan();
      panCount = Math.max(1, Math.round(num(els.panCount)));
      flourWeight = totalPercent > 0 ? (panDough / totalPercent) * 100 : 0;
      els.panDoughWeight.textContent = fmtGrams(panDough);
    } else {
      flourWeight = num(els.flourWeight);
    }

    const water = (flourWeight * hydration) / 100;
    const saltWeight = (flourWeight * salt) / 100;
    const oilWeight = (flourWeight * oil) / 100;
    const yeastWeight = (flourWeight * yeast) / 100;
    const total = flourWeight + water + saltWeight + oilWeight + yeastWeight;

    els.resFlour.textContent = fmtGrams(flourWeight);
    els.pctWater.textContent = `${hydration}%`;
    els.resWater.textContent = fmtGrams(water);
    els.pctSalt.textContent = `${salt}%`;
    els.resSalt.textContent = fmtGrams(saltWeight);
    els.pctOil.textContent = `${oil}%`;
    els.resOil.textContent = fmtGrams(oilWeight);
    els.pctYeast.textContent = `${yeast}%`;
    els.resYeast.textContent = fmtGrams(yeastWeight);
    els.resTotal.textContent = fmtGrams(total);

    if (basis === "pan" && panCount > 1) {
      els.perPanNote.classList.remove("hidden");
      els.resPerPan.textContent = fmtGrams(total / panCount);
      els.resPanCount.textContent = String(panCount);
    } else {
      els.perPanNote.classList.add("hidden");
    }
  }

  // Basis toggle
  els.basisFlourBtn.addEventListener("click", () => setBasis("flour"));
  els.basisPanBtn.addEventListener("click", () => setBasis("pan"));

  // Pan shape toggle
  els.panShape.addEventListener("change", () => {
    setPanShape(els.panShape.value);
    calculate();
  });

  // Yeast presets
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      els.yeast.value = btn.dataset.yeast;
      calculate();
    });
  });

  // Reset percentages
  els.resetDefaults.addEventListener("click", () => {
    els.hydration.value = DEFAULTS.hydration;
    els.salt.value = DEFAULTS.salt;
    els.oil.value = DEFAULTS.oil;
    els.yeast.value = DEFAULTS.yeast;
    calculate();
  });

  // Recalculate on any input change
  [
    els.flourWeight,
    els.panLength,
    els.panWidth,
    els.panDiameter,
    els.panCount,
    els.doughStyle,
    els.hydration,
    els.salt,
    els.oil,
    els.yeast,
  ].forEach((el) => el.addEventListener("input", calculate));

  setPanShape(els.panShape.value);
  calculate();
})();
