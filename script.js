function toNum(v, fallback) {
  var n = parseFloat(v);
  return isFinite(n) ? n : fallback;
}

function fmtGrams(g) {
  if (!isFinite(g) || g < 0) return '–';
  return Math.round(g) + ' g';
}

var BAKE_INFO = {
  '0.45': {
    ovenLabel: '240–250°C (465–480°F)',
    timeLabel: '15–18 min',
    steel: 'recommended',
    steelNote: 'Recommended — preheat it 45–60 min on the lowest rack, then set the pan directly on it. The stored heat crisps this thin base fast, before the crumb dries out.'
  },
  '0.55': {
    ovenLabel: '220–230°C (425–450°F)',
    timeLabel: '20–25 min',
    steel: 'recommended',
    steelNote: 'Recommended — preheat on the lowest rack for 30–45 min. It evens out hot spots in most home ovens and firms up the bottom crust.'
  },
  '0.70': {
    ovenLabel: '200–210°C (400–410°F)',
    timeLabel: '28–35 min',
    steel: 'optional',
    steelNote: 'Optional — the deeper pan already insulates the bottom. A steel mainly helps if your oven runs cool or bakes unevenly; tent with foil if the top browns too fast.'
  }
};

var state = {
  basis: 'flour',
  flourWeight: '500',
  panShape: 'rect',
  panLength: '33',
  panWidth: '23',
  panDiameter: '30',
  panCount: '1',
  doughStyle: '0.55',
  peopleCount: '6',
  servingStyle: '150',
  hydration: '78',
  salt: '2.2',
  oil: '5',
  yeast: '1'
};

var el = {};
[
  'btnBasisFlour', 'btnBasisPan', 'btnBasisPeople',
  'sectionFlour', 'sectionPan', 'sectionPeople',
  'flourWeightInput', 'flourWeightValue',
  'btnShapeRect', 'btnShapeRound',
  'panRectFields', 'panRoundField',
  'panLengthInput', 'panWidthInput', 'panDiameterInput',
  'panCountInput', 'panCountValue', 'panDoughLabel',
  'btnPeople4', 'btnPeople6', 'btnPeople8',
  'peopleCountInput', 'peopleCountValue', 'servingStyleSelect', 'peopleDoughLabel',
  'peoplePanCountInput', 'peoplePanCountValue', 'peoplePanCountSubtitle',
  'doughStyleSelect',
  'btnPresetSameDay', 'btnPresetOvernight', 'btnPresetColdRetard',
  'flourLabel', 'hydrationLabel', 'waterLabel', 'saltLabel', 'saltWLabel',
  'oilLabel', 'oilWLabel', 'yeastLabel', 'yeastWLabel', 'totalLabel',
  'perPanRow', 'perPanLabel', 'panCountLabel',
  'feedsLabel', 'perPersonLabel',
  'bakeTempLabel', 'bakeTimeLabel', 'steelPillLabel', 'steelNoteLabel',
  'multiPanNote'
].forEach(function (id) { el[id] = document.getElementById(id); });

function setActive(button, isActive) {
  button.classList.toggle('active', isActive);
}

function render() {
  var s = state;
  var basis = s.basis;

  var hydration = toNum(s.hydration, 0);
  var salt = toNum(s.salt, 0);
  var oil = toNum(s.oil, 0);
  var yeast = toNum(s.yeast, 0);
  var totalPercent = 100 + hydration + salt + oil + yeast;

  var flourWeight = 0;
  var panDough = 0;
  var peopleDough = 0;
  var panCount = Math.max(1, Math.round(toNum(s.panCount, 1)));

  if (basis === 'pan') {
    var area = s.panShape === 'round'
      ? Math.PI * Math.pow(toNum(s.panDiameter, 0) / 2, 2)
      : toNum(s.panLength, 0) * toNum(s.panWidth, 0);
    var load = parseFloat(s.doughStyle) || 0.55;
    panDough = area * load * panCount;
    flourWeight = totalPercent > 0 ? (panDough / totalPercent) * 100 : 0;
  } else if (basis === 'people') {
    var people = Math.max(1, Math.round(toNum(s.peopleCount, 1)));
    var perPerson = parseFloat(s.servingStyle) || 150;
    peopleDough = people * perPerson * panCount;
    flourWeight = totalPercent > 0 ? (peopleDough / totalPercent) * 100 : 0;
  } else {
    flourWeight = toNum(s.flourWeight, 0);
  }

  var water = (flourWeight * hydration) / 100;
  var saltW = (flourWeight * salt) / 100;
  var oilW = (flourWeight * oil) / 100;
  var yeastW = (flourWeight * yeast) / 100;
  var total = flourWeight + water + saltW + oilW + yeastW;

  var perPersonGrams = parseFloat(s.servingStyle) || 150;
  var feeds = Math.max(1, Math.round(total / perPersonGrams));

  var bake = BAKE_INFO[s.doughStyle] || BAKE_INFO['0.55'];
  var steelRecommended = bake.steel === 'recommended';

  var presetSameDaySelected = Math.abs(yeast - 1.2) < 0.001;
  var presetOvernightSelected = Math.abs(yeast - 0.5) < 0.001;
  var presetColdRetardSelected = Math.abs(yeast - 0.2) < 0.001;

  var showPerPan = (basis === 'pan' || basis === 'people') && panCount > 1;

  // Size your dough — basis toggle
  setActive(el.btnBasisFlour, basis === 'flour');
  setActive(el.btnBasisPan, basis === 'pan');
  setActive(el.btnBasisPeople, basis === 'people');
  el.sectionFlour.style.display = basis === 'flour' ? '' : 'none';
  el.sectionPan.style.display = basis === 'pan' ? '' : 'none';
  el.sectionPeople.style.display = basis === 'people' ? '' : 'none';

  var flourSliderMin = 100;
  var flourSliderMax = 2000;
  var flourWeightNum = Math.max(flourSliderMin, Math.min(flourSliderMax, Math.round(toNum(s.flourWeight, 500))));
  var flourSliderPct = ((flourWeightNum - flourSliderMin) / (flourSliderMax - flourSliderMin)) * 100;
  el.flourWeightInput.style.setProperty('--range-progress', flourSliderPct + '%');
  el.flourWeightValue.textContent = flourWeightNum + ' g';

  // Pan shape
  var isRect = s.panShape === 'rect';
  var isRound = s.panShape === 'round';
  setActive(el.btnShapeRect, isRect);
  setActive(el.btnShapeRound, isRound);
  el.panRectFields.style.display = isRect ? 'flex' : 'none';
  el.panRoundField.style.display = isRound ? 'flex' : 'none';
  el.panDoughLabel.textContent = fmtGrams(panDough);

  var panCountSliderMin = 1;
  var panCountSliderMax = 6;
  var panCountNum = Math.max(panCountSliderMin, Math.min(panCountSliderMax, panCount));
  var panCountSliderPct = ((panCountNum - panCountSliderMin) / (panCountSliderMax - panCountSliderMin)) * 100;
  var panCountText = panCountNum + (panCountNum === 1 ? ' pan' : ' pans');
  el.panCountInput.value = panCountNum;
  el.panCountInput.style.setProperty('--range-progress', panCountSliderPct + '%');
  el.panCountValue.textContent = panCountText;
  el.peoplePanCountInput.value = panCountNum;
  el.peoplePanCountInput.style.setProperty('--range-progress', panCountSliderPct + '%');
  el.peoplePanCountValue.textContent = panCountText;

  // Headcount presets
  setActive(el.btnPeople4, s.peopleCount === '4');
  setActive(el.btnPeople6, s.peopleCount === '6');
  setActive(el.btnPeople8, s.peopleCount === '8');
  el.peopleDoughLabel.textContent = fmtGrams(peopleDough);

  var peopleSliderMin = 1;
  var peopleSliderMax = 20;
  var peopleCountNum = Math.max(peopleSliderMin, Math.min(peopleSliderMax, Math.round(toNum(s.peopleCount, 6))));
  var peopleSliderPct = ((peopleCountNum - peopleSliderMin) / (peopleSliderMax - peopleSliderMin)) * 100;
  el.peopleCountInput.style.setProperty('--range-progress', peopleSliderPct + '%');
  el.peopleCountValue.textContent = peopleCountNum + ' people';
  el.peoplePanCountSubtitle.textContent = peopleCountNum;

  // Yeast presets
  setActive(el.btnPresetSameDay, presetSameDaySelected);
  setActive(el.btnPresetOvernight, presetOvernightSelected);
  setActive(el.btnPresetColdRetard, presetColdRetardSelected);

  // Recipe table
  el.flourLabel.textContent = fmtGrams(flourWeight);
  el.hydrationLabel.textContent = hydration + '%';
  el.waterLabel.textContent = fmtGrams(water);
  el.saltLabel.textContent = salt + '%';
  el.saltWLabel.textContent = fmtGrams(saltW);
  el.oilLabel.textContent = oil + '%';
  el.oilWLabel.textContent = fmtGrams(oilW);
  el.yeastLabel.textContent = yeast + '%';
  el.yeastWLabel.textContent = fmtGrams(yeastW);
  el.totalLabel.textContent = fmtGrams(total);

  el.perPanRow.style.display = showPerPan ? '' : 'none';
  el.perPanLabel.textContent = fmtGrams(total / panCount);
  el.panCountLabel.textContent = String(panCount);

  el.feedsLabel.textContent = String(feeds);
  el.perPersonLabel.textContent = perPersonGrams + ' g';

  // Bake it
  el.bakeTempLabel.textContent = bake.ovenLabel;
  el.bakeTimeLabel.textContent = bake.timeLabel;
  el.steelPillLabel.textContent = steelRecommended ? 'Recommended' : 'Optional';
  el.steelPillLabel.classList.toggle('recommended', steelRecommended);
  el.steelNoteLabel.textContent = bake.steelNote;
  el.multiPanNote.style.display = showPerPan ? '' : 'none';
}

function setField(key) {
  return function (e) {
    state[key] = e.target.value;
    render();
  };
}

el.flourWeightInput.addEventListener('input', setField('flourWeight'));
el.panLengthInput.addEventListener('input', setField('panLength'));
el.panWidthInput.addEventListener('input', setField('panWidth'));
el.panDiameterInput.addEventListener('input', setField('panDiameter'));
el.panCountInput.addEventListener('input', setField('panCount'));
el.peopleCountInput.addEventListener('input', setField('peopleCount'));
el.peoplePanCountInput.addEventListener('input', setField('panCount'));
el.servingStyleSelect.addEventListener('change', setField('servingStyle'));
el.doughStyleSelect.addEventListener('change', setField('doughStyle'));

el.btnBasisFlour.addEventListener('click', function () { state.basis = 'flour'; render(); });
el.btnBasisPan.addEventListener('click', function () { state.basis = 'pan'; render(); });
el.btnBasisPeople.addEventListener('click', function () { state.basis = 'people'; render(); });

el.btnShapeRect.addEventListener('click', function () { state.panShape = 'rect'; render(); });
el.btnShapeRound.addEventListener('click', function () { state.panShape = 'round'; render(); });

el.btnPeople4.addEventListener('click', function () { state.peopleCount = '4'; el.peopleCountInput.value = '4'; render(); });
el.btnPeople6.addEventListener('click', function () { state.peopleCount = '6'; el.peopleCountInput.value = '6'; render(); });
el.btnPeople8.addEventListener('click', function () { state.peopleCount = '8'; el.peopleCountInput.value = '8'; render(); });

el.btnPresetSameDay.addEventListener('click', function () { state.yeast = '1.2'; render(); });
el.btnPresetOvernight.addEventListener('click', function () { state.yeast = '0.5'; render(); });
el.btnPresetColdRetard.addEventListener('click', function () { state.yeast = '0.2'; render(); });

render();
