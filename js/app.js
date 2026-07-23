/* PoliGraph app controller: intro -> quiz (no back) -> results (views, replay, alignment, card). */
(function () {
  var D = window.PG_DATA, S = window.PG_SCORING, V = window.PG_VIEWS;
  var answers = {}, order = [], idx = 0;
  var profile = { scales: {}, attrs: [] };
  var currentMode = "short";

  /* The short test = 4 balanced items per axis. The long test = the whole bank (~12/axis). */
  var CORE_IDS = [
    "cm1","cm2","cm3","cm4",
    "ec1","ec2","pv_a","pv_b",
    "ab_a","ab_b","ad1","ad6",
    "dl_a","dl_b","op1","op3",
    "dp_a","dp_b","ri1","ri4",
    "pd1","pd2","pd3","pd6"
  ];
  function questionsFor(m) {
    var list = m === "long" ? D.QUESTIONS.slice()
      : D.QUESTIONS.filter(function (q) { return CORE_IDS.indexOf(q.id) >= 0; });
    return interleave(list);
  }

  /* Deterministic PRNG (fixed seed) -> the shuffle is well-mixed but identical every run,
     so the order is stable across sessions and can't drift. */
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function seededShuffle(arr, rng) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  /* Round-robin across axes (each axis shuffled internally, axis visiting-order shuffled once).
     With even per-axis counts this guarantees no two adjacent questions share an axis, so a
     taker can't spot the theme and game their answers. */
  function interleave(list) {
    var rng = mulberry32(0x50A11);
    var groups = {};
    D.AXES.forEach(function (a) { groups[a.key] = []; });
    list.forEach(function (q) { groups[q.axis].push(q); });
    var keys = D.AXES.map(function (a) { return a.key; });
    keys.forEach(function (k) { groups[k] = seededShuffle(groups[k], rng); });
    var axisOrder = seededShuffle(keys, rng);
    var out = [], more = true;
    while (more) {
      more = false;
      axisOrder.forEach(function (k) { if (groups[k].length) { out.push(groups[k].shift()); more = true; } });
    }
    return out;
  }

  var TRAIT_SHORT = {
    ethnicity:"Your ethnicity", religion_minority:"Your religion", religion_devout:"Your faith",
    nonreligious:"Your non-belief", lgbtq:"Being LGBTQ+", gender:"Your gender",
    immigrant:"Your immigrant roots", disability:"Your disability", wealth:"Your family's wealth",
    business:"Your business", intelligentsia:"Your profession", labor:"Your union ties",
    dissenter:"Your outspokenness", gun_owner:"Your firearms", cultural_minority:"Your culture"
  };

  var app = document.getElementById("app");

  function screen(html) { app.innerHTML = html; window.scrollTo(0, 0); }

  /* ---------- Intro ---------- */
  function intro() {
    var shortN = questionsFor("short").length, longN = questionsFor("long").length;
    var perAxis = Math.round(longN / D.AXES.length);
    screen(
      '<section class="intro">' +
      '<h1>PoliGraph</h1>' +
      '<p class="lede">Take the test and find out which world leaders — past and present — your politics actually line up with.</p>' +
      '<ul class="rules">' +
      '<li>Answer honestly and fast — first instinct.</li>' +
      '<li>You cannot go back. That is the point.</li>' +
      '<li>Some statements are quotes. You will find out who said them at the end.</li>' +
      '</ul>' +
      '<div class="mode-choice">' +
      '<button id="start-short" class="primary">Quick test · ' + shortN + ' questions</button>' +
      '<button id="start-long" class="ghost">Long test · ' + longN + ' questions</button>' +
      '</div>' +
      '<p class="fine">The long version asks about ' + perAxis + ' questions per axis for a sharper, more stable score. No login · nothing is stored or sent anywhere · results vanish on refresh.</p>' +
      '</section>'
    );
    document.getElementById("start-short").onclick = function () { start("short"); };
    document.getElementById("start-long").onclick = function () { start("long"); };
  }

  function start(mode) { currentMode = mode || "short"; profile = { scales: {}, attrs: [] }; pretest(); }

  /* ---------- Pre-test (self-image + what you'd stand to lose) ---------- */
  function pretest() {
    var scales = D.SELF_SCALES.map(function (s) {
      var btns = D.OPTIONS.map(function (o) {
        return '<button class="pill" data-sid="' + s.id + '" data-v="' + o.value + '">' + o.label + '</button>';
      }).join("");
      return '<div class="pt-scale"><p class="pt-q">' + s.prompt + '</p><div class="pillrow">' + btns + '</div></div>';
    }).join("");
    var attrs = D.ATTRIBUTES.map(function (a) {
      return '<label class="attr"><input type="checkbox" value="' + a.key + '"><span>' + a.label + '</span></label>';
    }).join("");
    screen(
      '<section class="pretest">' +
      '<h2>Before the test</h2>' +
      '<p class="lede">First, a quick picture of who you are — and what you would have to lose.</p>' +
      '<h3 class="pt-head">How safe do you feel?</h3>' +
      scales +
      '<h3 class="pt-head">What would you stand to lose?</h3>' +
      '<p class="pt-sub">Tick anything true of you or your family. Optional. <strong>This never leaves your browser — nothing here is stored or sent anywhere.</strong></p>' +
      '<div class="attrs">' + attrs + '</div>' +
      '<button id="pt-go" class="primary">Start the ' + questionsFor(currentMode).length + ' questions</button>' +
      '</section>'
    );
    Array.prototype.forEach.call(document.querySelectorAll(".pill"), function (b) {
      b.onclick = function () {
        var sid = b.getAttribute("data-sid");
        Array.prototype.forEach.call(document.querySelectorAll('.pill[data-sid="' + sid + '"]'), function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        profile.scales[sid] = parseInt(b.getAttribute("data-v"), 10);
      };
    });
    document.getElementById("pt-go").onclick = function () {
      profile.attrs = Array.prototype.filter.call(document.querySelectorAll(".attrs input"), function (c) { return c.checked; })
        .map(function (c) { return c.value; });
      beginQuiz();
    };
  }

  function beginQuiz() {
    answers = {}; idx = 0;
    order = questionsFor(currentMode); // short = core subset, long = full bank
    question();
  }

  /* ---------- Quiz ---------- */
  function question() {
    var q = order[idx];
    var stmt = "";
    if (q.story) stmt += '<div class="story">' + q.story + '</div>';
    if (q.type === "quote") stmt += '<blockquote class="quote">“' + q.quote + '”</blockquote><p class="qprompt">' + q.prompt + '</p>';
    else stmt += '<p class="qprompt' + (q.story ? '' : ' big') + '">' + q.prompt + '</p>';
    var opts = D.OPTIONS.map(function (o) {
      return '<button class="opt" data-v="' + o.value + '">' + o.label + '</button>';
    }).join("");
    screen(
      '<section class="quiz">' +
      '<div class="progress"><div class="progress-fill" style="width:' + (idx / order.length * 100) + '%"></div></div>' +
      '<div class="counter">' + (idx + 1) + ' / ' + order.length + '</div>' +
      stmt +
      '<div class="opts">' + opts + '</div>' +
      '</section>'
    );
    Array.prototype.forEach.call(document.querySelectorAll(".opt"), function (b) {
      b.onclick = function () { answer(q.id, parseInt(b.getAttribute("data-v"), 10)); };
    });
  }

  function answer(id, v) {
    answers[id] = v;
    idx++;
    if (idx >= order.length) results(); else question();
  }

  /* ---------- Results ---------- */
  var lastResult, lastMatches, lastHigh, lastLow;
  function results() {
    var result = S.computeScores(answers);
    var t = S.tier(result.overall100);
    var matches = S.matchAlignments(result.vec, 3);
    var contra = S.contradiction(answers);
    var hypo = S.computeHypocrisy(answers);
    lastResult = result; lastMatches = matches;
    lastHigh = D.AXES.filter(function (a) { return result.scores[a.key].score100 >= 60; });
    lastLow = D.AXES.filter(function (a) { return result.scores[a.key].score100 <= 40; });
    screen(
      '<section class="results">' +
      '<div class="verdict">' +
      '<div class="overall">' +
      '<span class="overall-label">Authoritarian instinct</span>' +
      '<span class="overall-num">' + result.overall100 + '<i>/100</i></span>' +
      '</div>' +
      '<h2>' + t.name + '</h2>' +
      '<p class="tier-note">' + t.note + '</p>' +
      (contra ? '<p class="contra"><strong>Your sharpest contradiction:</strong> ' + contra + '</p>' : '') +
      '</div>' +

      hypocrisyHtml(hypo) +

      '<div class="align">' +
      '<h3>You are most likely to align with</h3>' +
      '<div class="align-chips">' +
      matches.map(function (m, i) {
        return '<button class="chip' + (i === 0 ? " active" : "") + '" data-i="' + i + '">' +
          '<span class="chip-pct">' + m.matchPct + '%</span>' + m.align.name + '</button>';
      }).join("") +
      '</div>' +
      '<div id="dossier"></div>' +
      '</div>' +

      '<div class="views">' +
      '<div class="view-toggle">' +
      '<button data-view="bars" class="vt active">Bars</button>' +
      '<button data-view="radar2d" class="vt">2D radar</button>' +
      '<button data-view="radar3d" class="vt">3D shape</button>' +
      '</div>' +
      '<div id="viewport"></div>' +
      '</div>' +

      '<div class="replay">' +
      '<h3>Here is what you actually said</h3>' +
      '<div class="replay-list">' + replayHtml() + '</div>' +
      '</div>' +

      (currentMode === "short"
        ? '<div class="retry-long">' +
          '<p>Think we got it wrong? Take the longer test to help dial in your score.</p>' +
          '<button id="go-long" class="primary">Take the long test · ' + questionsFor("long").length + ' questions</button>' +
          '</div>'
        : '<p class="fine long-note">You took the full ' + questionsFor("long").length + '-question version — this is as dialed-in as it gets.</p>') +
      '<div class="actions">' +
      '<button id="card" class="primary">Download result card</button>' +
      '<button id="again">Take it again</button>' +
      '</div>' +
      '<p class="fine">Educational satire. Matches are based only on the coercive mechanisms you endorsed, never on identity. Nothing was stored.</p>' +
      '</section>'
    );

    setView("bars");
    Array.prototype.forEach.call(document.querySelectorAll(".vt"), function (b) {
      b.onclick = function () {
        Array.prototype.forEach.call(document.querySelectorAll(".vt"), function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        setView(b.getAttribute("data-view"));
      };
    });
    document.getElementById("again").onclick = intro;
    document.getElementById("card").onclick = downloadCard;
    var gl = document.getElementById("go-long");
    if (gl) gl.onclick = function () { start("long"); };

    Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (b) {
      b.onclick = function () {
        Array.prototype.forEach.call(document.querySelectorAll(".chip"), function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        renderDossier(parseInt(b.getAttribute("data-i"), 10));
      };
    });
    renderDossier(0);
  }

  function renderDossier(i) {
    var m = lastMatches[i], a = m.align, d = a.dossier;
    var highNames = lastHigh.map(function (x) { return x.label; });
    var lowNames = lastLow.map(function (x) { return x.label; });
    var why;
    if (a.positive) {
      why = "You resisted the coercive framing across the board — the rare profile that limits power over its enemies too. Here is the record you match:";
    } else if (highNames.length) {
      why = "<strong>Why " + a.name + "?</strong> You scored high on " + joinList(highNames) +
        (lowNames.length ? ", and low on " + joinList(lowNames) : "") +
        ". That exact combination is the political signature behind:";
    } else {
      why = "<strong>Why " + a.name + "?</strong> Your answers lean toward the same mechanisms this figure institutionalized:";
    }
    var pols = d.policies.map(function (p) {
      var ax = axisByKey(p.axis);
      return '<div class="pol">' +
        '<span class="pol-axis" style="color:' + ax.color + '">' + ax.short + '</span>' +
        '<div class="pol-body"><strong>' + p.title + '</strong> — ' + p.detail + '</div></div>';
    }).join("");
    var srcs = d.sources.map(function (s) {
      return '<a class="src" href="' + s.url + '" target="_blank" rel="noopener">' + s.label + ' ↗</a>';
    }).join("");
    document.getElementById("dossier").innerHTML =
      '<div class="align-top ' + (a.positive ? "pos" : "") + '">' +
      '<div class="align-name">' + a.name + '</div>' +
      '<div class="align-lean">' + a.lean + ' · ' + m.matchPct + '% match</div>' +
      '<p class="align-blurb">' + a.blurb + '</p>' +
      '<p class="why">' + why + '</p>' +
      '<div class="pols">' + pols + '</div>' +
      '<div class="sources"><span class="sources-label">The historical record</span>' + srcs + '</div>' +
      buildStakes(a) +
      '</div>';
  }

  function attrLabel(key) { return TRAIT_SHORT[key] || key; }
  function safeCallout() {
    var order = ["safe4", "safe2", "safe3", "safe1"];
    for (var i = 0; i < order.length; i++) {
      if (profile.scales[order[i]] >= 1) {
        var s = D.SELF_SCALES.filter(function (x) { return x.id === order[i]; })[0];
        return '<p class="safe-callout">You told us: <em>“' + s.prompt + '”</em> — and you agreed. So did they.</p>';
      }
    }
    return "";
  }
  function buildStakes(a) {
    if (a.positive) {
      var kept = profile.attrs.map(attrLabel);
      var body = kept.length
        ? "The things that would make you a target elsewhere — " + joinList(kept) + " — are exactly what this tradition exists to protect, because it protects them for everyone."
        : "This tradition protects the dissenter and the outsider on principle — which is the only reason it can protect you.";
      return '<div class="stakes pos"><span class="stakes-label">If this order held</span><p>' + body + '</p></div>';
    }
    var targets = D.TARGETS[a.name] || [];
    var hits = targets.filter(function (t) { return profile.attrs.indexOf(t.key) >= 0; });
    var callout = safeCallout();
    var inner;
    if (hits.length) {
      inner = '<p class="stakes-intro">You ticked these. Here is what ' + a.name + ' did to people who did:</p>' +
        '<div class="stakes-list">' + hits.map(function (t) {
          return '<div class="stake"><span class="stake-trait">' + attrLabel(t.key) + '</span><div class="stake-note">' + t.note + '</div></div>';
        }).join("") + '</div>';
    } else {
      var nm = D.NIEMOLLER;
      inner = '<p class="stakes-intro">You ticked nothing you\'d lose. Neither did most people — until the list grew to include them:</p>' +
        '<blockquote class="niem">“' + nm.text + '”<cite>— ' + nm.author + ', ' + nm.source + ' · <a href="' + nm.url + '" target="_blank" rel="noopener">source ↗</a></cite></blockquote>';
    }
    return '<div class="stakes">' + callout + '<span class="stakes-label">What ' + a.name + ' would have taken from you</span>' + inner + '</div>';
  }

  function optLabel(r) {
    var o = D.OPTIONS.filter(function (x) { return x.value === r; })[0];
    return o ? o.label : "—";
  }
  function hypocrisyHtml(hypo) {
    if (!hypo.measured) return "";
    var ht = S.hypoTier(hypo.score100);
    var flips = hypo.sets.filter(function (s) { return s.spread >= 2; });
    var body;
    if (flips.length) {
      body = '<div class="hypo-sets">' + flips.map(function (s) {
        return '<div class="hypo-set">' +
          '<div class="hypo-q">' + s.label + '</div>' +
          '<div class="hypo-items">' + s.items.map(function (x) {
            return '<div class="hypo-item"><span class="hypo-tag">' + x.tag + '</span><span class="hypo-ans">' + optLabel(x.r) + '</span></div>';
          }).join("") + '</div>' +
          '</div>';
      }).join("") + '</div>';
    } else {
      body = '<p class="tier-note">No double standards detected — you answered the mirror-image cases the same way. That is the rare part.</p>';
    }
    return '<div class="hypo">' +
      '<div class="overall"><span class="overall-label">Hypocrisy</span>' +
      '<span class="overall-num alt">' + hypo.score100 + '<i>/100</i></span></div>' +
      '<h3 class="hypo-name">' + ht.name + '</h3>' +
      '<p class="tier-note">' + ht.note + '</p>' +
      body +
      '</div>';
  }
  function axisByKey(key) {
    return D.AXES.filter(function (a) { return a.key === key; })[0];
  }
  function joinList(arr) {
    if (arr.length === 0) return "";
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return arr[0] + " and " + arr[1];
    return arr.slice(0, -1).join(", ") + ", and " + arr[arr.length - 1];
  }

  function setView(name) {
    var vp = document.getElementById("viewport");
    if (name === "bars") V.bars(vp, lastResult);
    else if (name === "radar2d") V.radar2d(vp, lastResult);
    else V.radar3d(vp, lastResult);
  }

  function replayHtml() {
    return order.map(function (q) {
      var r = answers[q.id];
      var opt = D.OPTIONS.filter(function (o) { return o.value === r; })[0];
      var chose = opt ? opt.label : "—";
      var authoritarian = q.reverse ? r < 0 : r > 0;
      var stmt = (q.story ? '<em>' + q.story + '</em> ' : "") + (q.type === "quote" ? "“" + q.quote + "”" : q.prompt);
      var src = q.type === "quote"
        ? '<div class="replay-src"><strong>' + q.author + '</strong> — ' + q.source + '</div>'
        : '';
      return '<div class="replay-item ' + (authoritarian ? "flag" : "ok") + '">' +
        '<div class="replay-stmt">' + stmt + '</div>' +
        src +
        '<div class="replay-answer">You said: <strong>' + chose + '</strong></div>' +
        (authoritarian ? '<div class="replay-reveal">' + q.reveal + '</div>' : '') +
        '</div>';
    }).join("");
  }

  function downloadCard() {
    var url = V.makeCard(lastResult, S.tier(lastResult.overall100), lastMatches[0]);
    var a = document.createElement("a");
    a.href = url; a.download = "poligraph-result.png"; a.click();
  }

  intro();
})();
