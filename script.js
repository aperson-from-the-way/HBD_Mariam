/* ==========================================================
   HBD — Birthday Journey Script
   ========================================================== */

/* ---------- 1. EDITABLE TEXT CONTENT ----------
   One entry per age, 1 through 18. Edit freely — index 0 = age 1. */
const stageTexts = [
  "A first breath meets a first light,I think history should have started here.", // Age 1
  "Look who can walk now; beware, for his sphere of influence has increased.", // Age 2
  "The thinker's personality emerges to pose questions like What is this? and Why?", // Age 3
  "Every day is a new adventure,Imagination begins to build its first kingdoms .", // Age 4
  "Numbers and letters begin to arrange themselves into meaning,I have become able to write my own name..", // Age 5
  "The first slap in life is elementary school; you have to rely on yourself every time you fall, get back up again.", // Age 6
  "Dreams at seven are vast and without limits — astronaut one day, artist the next — because nothing yet feels impossible.", // Age 7
  "As the circle of people in your life widened, you learned that not everyone is good, even those close to you.", // Age 8
  "Between games and growing awareness, a keener eye begins to notice the world's larger shape —its not always what bright.", // Age 9
  "Time is flying,A full decade of living has been gathered like stones in a pocket,Every experience teaches me something.", // Age 10
  "A quieter kind of thinking begins to take root — less about what is fun, more about what is fair, what is true.", // Age 11
  "The beginning of hiding behind doors, but this time not from danger in the street, but from a deadly COVID19.", // Age 12
  "The beginning of a phase of liberation, but liberation from what?! Family or responsibilities? Is this adolescence?", // Age 13
  "Not all friends are real people; there are friends on social media too. What a huge world!", // Age 14
  "I learned that life can sometimes take away my home, but it also gives me the opportunity to rebuild it as I want it now.", // Age 15
  "The beginning of not going with the flow and knowing my own voice; I am the one who decides,i am the one who controls my life.", // Age 16
  "Every challenge, every difficult moment, was a lesson I learned. I am no longer a child or a little girl; now I know who I am.", // Age 17
  "The beginning of university life and personal life, and most importantly, bye bye regional."  // Age 18
];

/* Future stages beyond 18 — purely decorative, symbolizing what's ahead */
const futureTexts = ["We don't know what the future holds for us.", "But whatever happens, I will face it without fear.", "Because I am the one who writes my life."];

/* ==========================================================
   2. INTRO SCREEN
   ========================================================== */
(function initIntro(){
  const intro       = document.getElementById('intro');
  const question    = document.getElementById('intro-question');
  const btnYes       = document.getElementById('btn-yes');
  const btnNo        = document.getElementById('btn-no');
  const flood        = document.getElementById('flood');

  let hasHiddenQuestion = false;
  let dodging = false;
  let noPressCount = 0;
  const GROW_STEP = 0.22;
  const GROW_MAX = 4.5;

  function growYesButton(){
    noPressCount++;
    const factor = Math.min(1 + noPressCount * GROW_STEP, GROW_MAX);
    btnYes.style.setProperty('--grow', factor);
  }

  function dodgeNo(clientX, clientY){
    const rect = btnNo.getBoundingClientRect();
    const btnW = rect.width, btnH = rect.height;
    const margin = 20;

    // Vector away from the cursor
    let cx = rect.left + btnW/2;
    let cy = rect.top + btnH/2;
    let dx = cx - clientX;
    let dy = cy - clientY;
    let dist = Math.hypot(dx, dy) || 1;

    // Pick a new random-ish spot biased away from the cursor
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.2;
    const jump = 160 + Math.random() * 120;

    let newX = cx + Math.cos(angle) * jump;
    let newY = cy + Math.sin(angle) * jump;

    newX = Math.max(margin + btnW/2, Math.min(window.innerWidth - margin - btnW/2, newX));
    newY = Math.max(margin + btnH/2, Math.min(window.innerHeight - margin - btnH/2, newY));

    btnNo.style.left = (newX - btnW/2) + 'px';
    btnNo.style.top  = (newY - btnH/2) + 'px';
  }

  function beginDodging(e){
    growYesButton();
    if (!hasHiddenQuestion){
      hasHiddenQuestion = true;
      question.classList.add('hide');
      intro.classList.add('dodging');
      const rect = btnNo.getBoundingClientRect();
      btnNo.style.left = rect.left + 'px';
      btnNo.style.top  = rect.top + 'px';
    }
    dodging = true;
    dodgeNo(e.clientX, e.clientY);
  }

  btnNo.addEventListener('mouseenter', beginDodging);
  btnNo.addEventListener('mousemove', (e) => { if (dodging) dodgeNo(e.clientX, e.clientY); });
  btnNo.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    beginDodging({ clientX: t.clientX, clientY: t.clientY });
  }, { passive:true });

  btnYes.addEventListener('click', () => {
    const rect = btnYes.getBoundingClientRect();
    flood.style.left = (rect.left + rect.width/2) + 'px';
    flood.style.top  = (rect.top + rect.height/2) + 'px';
    flood.classList.add('grow');

    setTimeout(() => {
      intro.style.display = 'none';
      document.body.style.overflow = 'auto';
      initJourneyScroll();
    }, 950);
  });
})();

/* ==========================================================
   3. JOURNEY PATH + STAGES
   ========================================================== */

const STEP = 420;         // vertical distance between consecutive stages
const TOP_PAD = 260;
const BOTTOM_PAD = 260;
const TOTAL_REAL = 18;
const TOTAL_FUTURE = futureTexts.length;
const TOTAL_POINTS = TOTAL_REAL + TOTAL_FUTURE;

const pathWrap  = document.getElementById('path-wrap');
const svg       = document.getElementById('path-svg');
const stagesEl  = document.getElementById('stages');

const containerHeight = TOP_PAD + (TOTAL_POINTS - 1) * STEP + BOTTOM_PAD;
pathWrap.style.height = containerHeight + 'px';
document.getElementById('journey').style.height = containerHeight + 'px';

/* Build point list.
   index 0            -> topmost future stage
   index TOTAL_FUTURE  -> age 18 (locked)
   index TOTAL_POINTS-1 -> age 1 (bottom) */
const points = [];
for (let i = 0; i < TOTAL_POINTS; i++){
  const y = TOP_PAD + i * STEP;
  const x = (i % 2 === 0) ? 25 : 75; // percentage
  points.push({ x, y });
}

const LOCKED_INDEX = TOTAL_FUTURE; // index of age-18 point

function xPercentToPx(pct){
  return (pct / 100) * pathWrap.clientWidth;
}

function buildPathD(list){
  if (list.length < 2) return '';
  let d = `M ${xPercentToPx(list[0].x)},${list[0].y}`;
  for (let i = 0; i < list.length - 1; i++){
    const p0 = list[i], p1 = list[i+1];
    const midY = (p0.y + p1.y) / 2;
    d += ` C ${xPercentToPx(p0.x)},${midY} ${xPercentToPx(p1.x)},${midY} ${xPercentToPx(p1.x)},${p1.y}`;
  }
  return d;
}

function renderPaths(){
  svg.setAttribute('width', pathWrap.clientWidth);
  svg.setAttribute('height', containerHeight);
  svg.setAttribute('viewBox', `0 0 ${pathWrap.clientWidth} ${containerHeight}`);
  svg.innerHTML = '';

  const mainPoints   = points.slice(LOCKED_INDEX);       // age18 -> age1
  const futurePoints = points.slice(0, LOCKED_INDEX + 1); // topmost future -> age18

  const mainPath = document.createElementNS('http://www.w3.org/2000/svg','path');
  mainPath.setAttribute('d', buildPathD(mainPoints));
  mainPath.setAttribute('id','main-path');
  svg.appendChild(mainPath);

  const futurePath = document.createElementNS('http://www.w3.org/2000/svg','path');
  futurePath.setAttribute('d', buildPathD(futurePoints));
  futurePath.setAttribute('id','future-path');
  futurePath.style.opacity = '0';
  futurePath.style.transition = 'opacity 1.2s ease';
  svg.appendChild(futurePath);
}

/* Build stage DOM elements */
function buildStages(){
  stagesEl.innerHTML = '';

  points.forEach((pt, index) => {
    const isFuture = index < LOCKED_INDEX;
    const isLocked = index === LOCKED_INDEX;
    const age = TOTAL_POINTS - index; // maps index -> displayed age number (1..21)

    const stage = document.createElement('div');
    stage.className = 'stage ' + (index % 2 === 0 ? 'right' : 'left');
    stage.style.left = pt.x + '%';
    stage.style.top = pt.y + 'px';
    stage.dataset.index = index;

    if (isFuture) stage.classList.add('stage-future');
    if (isLocked) stage.classList.add('stage-locked');
    if (index === TOTAL_POINTS - 1) stage.classList.add('stage-first');

    const circle = document.createElement('div');
    circle.className = 'stage-circle';

    const isStageOne = index === TOTAL_POINTS - 1;

    const numSpan = document.createElement('span');
    numSpan.className = 'stage-num';

    if (isFuture){
      numSpan.innerHTML = '🔒';
      circle.style.fontSize = '1.2rem';
    } else if (isStageOne){
      numSpan.textContent = ''; // starts empty; fills in via the count-up animation
    } else {
      numSpan.textContent = age;
    }
    circle.appendChild(numSpan);

    // Stage 1: curved birth-date arc above the circle
    if (isStageOne){
      const arcWrap = document.createElement('div');
      arcWrap.className = 'arc-wrap';
      arcWrap.innerHTML = `
        <svg viewBox="0 0 170 64">
          <path id="arcPath" d="M 10,60 A 75,75 0 0 1 160,60" fill="none" stroke="none"/>
          <text>
            <textPath href="#arcPath" startOffset="50%" text-anchor="middle">9/7/2008</textPath>
          </text>
        </svg>`;
      circle.appendChild(arcWrap);
    }

    // Age 18: opens the cake modal
    if (isLocked){
      circle.addEventListener('click', openCakeModal);
    }

    stage.appendChild(circle);

    const textEl = document.createElement('div');
    textEl.className = 'stage-text';
    if (isFuture){
      textEl.textContent = futureTexts[LOCKED_INDEX - index - 1] ?? '...';
    } else {
      textEl.textContent = stageTexts[age - 1] ?? '...';
    }
    stage.appendChild(textEl);

    stagesEl.appendChild(stage);
  });
}

/* Fade stages in sequentially as they scroll into view (ages 1-18 only) */
let observer;
function initObserver(){
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.stage:not(.stage-future)').forEach(el => observer.observe(el));
}

/* Stage 1 opens empty, then counts up 1 -> 18 like an odometer before settling on "1" */
function playAgeCountUp(){
  const numSpan = document.querySelector('.stage-first .stage-num');
  if (!numSpan) return;

  const max = 18;
  const totalDuration = 1600; // ms
  const stepTime = totalDuration / max;
  let n = 1;

  setTimeout(() => {
    const timer = setInterval(() => {
      numSpan.textContent = n;
      n++;
      if (n > max){
        clearInterval(timer);
        numSpan.textContent = '1'; // lands on the true value for Age 1
      }
    }, stepTime);
  }, 500); // brief pause while the circle sits empty
}

function initJourneyScroll(){
  renderPaths();
  buildStages();
  initObserver();
  playAgeCountUp();

  // Start the view at the bottom (Age 1), scrolling UP progresses toward Age 18
  requestAnimationFrame(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  const hint = document.getElementById('scroll-hint');
  window.addEventListener('scroll', () => {
    if (window.scrollY < document.body.scrollHeight - window.innerHeight - 300){
      hint.classList.add('gone');
    } else {
      hint.classList.remove('gone');
    }
  });
}

window.addEventListener('resize', () => {
  if (document.getElementById('intro').style.display === 'none'){
    renderPaths();
  }
});

/* ==========================================================
   4. CAKE MODAL + LYRICS SYNC
   ========================================================== */

const modal      = document.getElementById('cake-modal');
const cakeStage   = document.getElementById('cake-stage');
const candles     = document.getElementById('candles');
const lyricsEl    = document.getElementById('lyrics');
const continueBtn = document.getElementById('btn-continue');

let audio = null;
let modalOpenedOnce = false;

const lyricLines = [
  { start: 0,    end: 3.5,  text: "Happy Birthday to you..." },
  { start: 3.5,  end: 5,    text: "Happy Birthday to you..." },
  { start: 5,    end: 8,   text: "Happy Birthday dear Mariam ❤️" },
  { start: 8,   end: 15,   text: "Happy Birthday to you!" }
];

function openCakeModal(){
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Reveal candles once the layers have finished stacking (~2.6s)
  candles.classList.remove('show');
  lyricsEl.classList.remove('show');
  continueBtn.classList.remove('show');

  setTimeout(() => { candles.classList.add('show'); }, 2600);

  // Kick off audio + lyric sync shortly after candles appear
  setTimeout(() => {
    lyricsEl.classList.add('show');
    playSongWithLyrics();
  }, 2900);

  // Continue button appears strictly after 15 seconds
  setTimeout(() => {
    continueBtn.classList.add('show');
  }, 2900 + 15000);
}

function playSongWithLyrics(){
  try{
    audio = new Audio('HBD Song.mp3');
    audio.play().catch(() => { /* autoplay might be blocked until user gesture; modal click already counts as one */ });

    audio.addEventListener('timeupdate', () => {
      const t = audio.currentTime;
      const line = lyricLines.find(l => t >= l.start && t < l.end);
      if (line) lyricsEl.textContent = line.text;
    });
  } catch(err){
    console.error('Audio playback error:', err);
  }
}

continueBtn.addEventListener('click', closeCakeModalAndUnlock);

function closeCakeModalAndUnlock(){
  modal.classList.remove('open');
  document.body.style.overflow = 'auto';

  if (audio){
    audio.pause();
    audio.currentTime = 0;
  }

  // Reset cake for next time (in case it's reopened)
  candles.classList.remove('show');
  lyricsEl.classList.remove('show');
  continueBtn.classList.remove('show');

  const lockedStage = document.querySelector('.stage-locked');

  // Stage 18 must still LOOK locked immediately after closing...
  setTimeout(() => {
    // ...then, exactly 1 second later, the unlocking climax fires.
    triggerUnlock(lockedStage);
  }, 1000);
}

function triggerUnlock(lockedStage){
  if (!lockedStage) return;
  lockedStage.classList.remove('stage-locked');
  lockedStage.classList.add('stage-unlocked');

  const circle = lockedStage.querySelector('.stage-circle');
  const numSpan = circle.querySelector('.stage-num');
  if (numSpan) numSpan.textContent = '18'; else circle.textContent = '18';

  // After the unlock pop/pulse finishes, reveal the future path + stages
  setTimeout(revealFutureStages, 1500);
}

function revealFutureStages(){
  const futurePath = document.getElementById('future-path');
  if (futurePath) futurePath.style.opacity = '0.85';

  document.querySelectorAll('.stage-future').forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('in-view');
    }, i * 220);
  });
}
