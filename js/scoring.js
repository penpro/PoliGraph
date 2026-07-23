/* PoliGraph scoring + alignment matching. Pure functions on window.PG_DATA. */
window.PG_SCORING = (function () {
  var D = window.PG_DATA;

  /* answers: { questionId: signedResponse(-2..2) }.
     For each axis: authoritarian-aligned points = (reverse ? -r : r) * weight, range [-2w, 2w].
     Normalize the axis sum to 0..1 where 1 = maximally authoritarian, 0.5 = perfectly neutral. */
  function computeScores(answers) {
    var byAxis = {};
    D.AXES.forEach(function (a) { byAxis[a.key] = { sum: 0, maxAbs: 0 }; });

    D.QUESTIONS.forEach(function (q) {
      var r = answers[q.id];
      if (typeof r !== "number") return; // only score questions the taker actually saw (short vs long)
      var signed = q.reverse ? -r : r;
      byAxis[q.axis].sum += signed * q.weight;
      byAxis[q.axis].maxAbs += 2 * q.weight;
    });

    var scores = {};
    var vec = [];
    D.AXES.forEach(function (a) {
      var b = byAxis[a.key];
      var s01 = b.maxAbs === 0 ? 0.5 : (b.sum / b.maxAbs + 1) / 2;
      s01 = Math.max(0, Math.min(1, s01));
      scores[a.key] = { score01: s01, score100: Math.round(s01 * 100) };
      vec.push(s01);
    });

    var overall01 = vec.reduce(function (x, y) { return x + y; }, 0) / vec.length;
    return { scores: scores, vec: vec, overall01: overall01, overall100: Math.round(overall01 * 100) };
  }

  /* Nearest-neighbour in the 6-D axis space. Euclidean (not cosine) so magnitude matters:
     a low-scoring taker lands near the civil libertarians, a high scorer near the dictators. */
  function matchAlignments(vec, topN) {
    var maxDist = Math.sqrt(vec.length); // each axis differs by at most 1
    var ranked = D.ALIGNMENTS.map(function (a) {
      var d = 0;
      for (var i = 0; i < vec.length; i++) { var diff = vec[i] - a.fp[i]; d += diff * diff; }
      d = Math.sqrt(d);
      return { align: a, dist: d, matchPct: Math.round((1 - d / maxDist) * 100) };
    });
    ranked.sort(function (a, b) { return a.dist - b.dist; });
    return ranked.slice(0, topN || 3);
  }

  /* Overall verdict tier. Copy names a behavior, not a slur — harder to laugh off. */
  function tier(score100) {
    if (score100 <= 30) return { name: "Actually means it", note: "You apply the same limits on power to your own side as to your enemies. Rare." };
    if (score100 <= 50) return { name: "Situational libertarian", note: "Anti-coercion in principle, but there are exceptions you'd rather not look at too hard." };
    if (score100 <= 70) return { name: "Authoritarian when it's your enemy", note: "You reach for the state's fist the moment the target is a group you dislike." };
    return { name: "You are the thing you're yelling about", note: "You endorsed the core machinery of authoritarian rule. The only variable left is who you'd point it at." };
  }

  /* The single sharpest contradiction in the taker's answers, for the verdict paragraph.
     Finds a left-baited and a right-baited item they BOTH agreed with — the tribe-switch. */
  function contradiction(answers) {
    var agreedLeft = null, agreedRight = null;
    D.QUESTIONS.forEach(function (q) {
      var r = answers[q.id];
      if (typeof r !== "number") return;
      var authoritarianAgree = q.reverse ? r < 0 : r > 0;
      if (!authoritarianAgree) return;
      if (q.bait === "left" && !agreedLeft) agreedLeft = q;
      if (q.bait === "right" && !agreedRight) agreedRight = q;
    });
    if (agreedLeft && agreedRight) {
      return "You'd use state power for “" + short(agreedRight) + "” but recoil when the other side uses the identical power for “" + short(agreedLeft) + ".” Same tool, different enemy.";
    }
    return null;
  }
  function short(q) {
    var t = q.type === "quote" ? q.prompt : q.prompt;
    return t.length > 60 ? t.slice(0, 57) + "…" : t;
  }

  /* Hypocrisy: within each consistency set, a principled person answers alike; the spread between
     their answers (0..4) is the double standard. Score = average spread across answered sets, 0..100. */
  function computeHypocrisy(answers) {
    var byId = {};
    D.QUESTIONS.forEach(function (q) { if (q.set) { (byId[q.set] = byId[q.set] || []).push(q); } });
    var sets = [], spreads = [];
    Object.keys(byId).forEach(function (sid) {
      var items = byId[sid].map(function (q) { return { tag: q.setTag, id: q.id, r: answers[q.id] }; })
        .filter(function (x) { return typeof x.r === "number"; });
      if (items.length < 2) return;
      var rs = items.map(function (x) { return x.r; });
      var spread = Math.max.apply(null, rs) - Math.min.apply(null, rs);
      spreads.push(spread);
      sets.push({ id: sid, label: (D.SETS[sid] && D.SETS[sid].label) || sid, spread: spread, items: items });
    });
    var score100 = spreads.length
      ? Math.round((spreads.reduce(function (a, b) { return a + b; }, 0) / spreads.length) / 4 * 100) : 0;
    sets.sort(function (a, b) { return b.spread - a.spread; });
    return { score100: score100, sets: sets, measured: spreads.length };
  }

  function hypoTier(s) {
    if (s <= 20) return { name: "Principled", note: "You apply the same rule to your side and the other. Rare — most people don't." };
    if (s <= 45) return { name: "Mostly consistent", note: "A wobble or two, but your principles mostly hold no matter who's in the frame." };
    if (s <= 70) return { name: "Situational principles", note: "Your 'principles' bend noticeably depending on who's standing in front of them." };
    return { name: "Pure team sport", note: "You don't have principles here — you have a side, and the rule just follows it." };
  }

  return { computeScores: computeScores, matchAlignments: matchAlignments, tier: tier, contradiction: contradiction,
           computeHypocrisy: computeHypocrisy, hypoTier: hypoTier };
})();
