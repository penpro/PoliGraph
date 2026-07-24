/* PoliGraph render targets. All read the same {scores, vec} model. */
window.PG_VIEWS = (function () {
  var D = window.PG_DATA;

  /* ---------- Bar view (the honest, accessible baseline) ---------- */
  function bars(container, result) {
    var html = '<div class="bars">';
    D.AXES.forEach(function (a, i) {
      var pct = result.scores[a.key].score100;
      html += '<div class="bar-row">' +
        '<div class="bar-label">' + a.label + '<span>' + pct + '</span></div>' +
        '<div class="bar-track"><div class="bar-fill" style="width:' + pct + '%;background:' + a.color + '"></div></div>' +
        '</div>';
    });
    html += '</div>';
    container.innerHTML = html;
  }

  /* ---------- 2D radar / star ---------- */
  function radar2d(container, result) {
    var n = D.AXES.length, size = 380, cx = size / 2, cy = size / 2, R = size / 2 - 54;
    var svg = ['<svg viewBox="0 0 ' + size + ' ' + size + '" width="100%" style="max-width:420px;display:block;margin:0 auto">'];
    // rings
    [0.25, 0.5, 0.75, 1].forEach(function (t) {
      var pts = ringPoints(n, cx, cy, R * t);
      svg.push('<polygon points="' + pts + '" fill="none" stroke="var(--pg-grid)" stroke-width="1"/>');
    });
    // spokes + labels
    for (var i = 0; i < n; i++) {
      var ang = angle(i, n);
      var ex = cx + Math.cos(ang) * R, ey = cy + Math.sin(ang) * R;
      svg.push('<line x1="' + cx + '" y1="' + cy + '" x2="' + ex + '" y2="' + ey + '" stroke="var(--pg-grid)" stroke-width="1"/>');
      var lx = cx + Math.cos(ang) * (R + 22), ly = cy + Math.sin(ang) * (R + 22);
      var anchor = Math.abs(Math.cos(ang)) < 0.3 ? "middle" : (Math.cos(ang) > 0 ? "start" : "end");
      svg.push('<text x="' + lx + '" y="' + ly + '" text-anchor="' + anchor + '" dominant-baseline="middle" fill="var(--pg-dim)" font-size="12">' + D.AXES[i].short + '</text>');
    }
    // data polygon
    var dp = [];
    for (var j = 0; j < n; j++) {
      var v = result.scores[D.AXES[j].key].score01, a2 = angle(j, n);
      dp.push((cx + Math.cos(a2) * R * v).toFixed(1) + "," + (cy + Math.sin(a2) * R * v).toFixed(1));
    }
    svg.push('<polygon points="' + dp.join(" ") + '" fill="rgba(216,90,48,0.25)" stroke="#D85A30" stroke-width="2"/>');
    for (var k = 0; k < n; k++) {
      var vv = result.scores[D.AXES[k].key].score01, a3 = angle(k, n);
      svg.push('<circle cx="' + (cx + Math.cos(a3) * R * vv).toFixed(1) + '" cy="' + (cy + Math.sin(a3) * R * vv).toFixed(1) + '" r="3.5" fill="#D85A30"/>');
    }
    svg.push('</svg>');
    container.innerHTML = svg.join("");
  }
  function angle(i, n) { return (Math.PI * 2 * i / n) - Math.PI / 2; }
  function ringPoints(n, cx, cy, r) {
    var p = [];
    for (var i = 0; i < n; i++) { var a = angle(i, n); p.push((cx + Math.cos(a) * r).toFixed(1) + "," + (cy + Math.sin(a) * r).toFixed(1)); }
    return p.join(" ");
  }

  /* ---------- 3D octahedron (6 axes = 6 vertices), orthographic so it never warps ---------- */
  function radar3d(container, result) {
    container.innerHTML =
      '<div class="r3d-wrap">' +
      '<canvas id="pg3d" width="600" height="440"></canvas>' +
      '<div class="r3d-hint">Drag to rotate · orthographic (isometric), no perspective warp</div>' +
      '</div>';
    var cv = document.getElementById("pg3d"), ctx = cv.getContext("2d"), W = 600, H = 440;
    var vals = D.AXES.map(function (a) { return result.scores[a.key].score01; });
    // 6 vertices: +X,-X,+Y,-Y,+Z,-Z, each scaled by its axis value (min 0.12 so the shape stays visible)
    var dirs = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
    var vertAxis = [0,0,1,1,2,2]; // which display axis each vertex belongs to (for coloring)
    var axisForVert = [0,3,1,4,2,5]; // map vertex -> AXES index (+X=ax0,-X=ax3,+Y=ax1,-Y=ax4,+Z=ax2,-Z=ax5)
    var faces = [[0,2,4],[0,2,5],[0,3,4],[0,3,5],[1,2,4],[1,2,5],[1,3,4],[1,3,5]];
    var rx = -Math.atan(1 / Math.SQRT2), ry = Math.PI / 4, drag = false, px = 0, py = 0; // iso default
    function rot(p) {
      var cy = Math.cos(ry), sy = Math.sin(ry), x = p[0]*cy - p[2]*sy, z = p[0]*sy + p[2]*cy;
      var cx2 = Math.cos(rx), sx = Math.sin(rx), y = p[1]*cx2 - z*sx, z2 = p[1]*sx + z*cx2;
      return [x, y, z2];
    }
    function proj(p) { var f = 150; return [W/2 + p[0]*f, H/2 - p[1]*f, p[2]]; }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var pts = dirs.map(function (d, i) { var s = Math.max(0.12, vals[axisForVert[i]] * 1.15); return rot([d[0]*s, d[1]*s, d[2]*s]); });
      var scr = pts.map(proj);
      var tris = faces.map(function (f) { return { f: f, z: (pts[f[0]][2] + pts[f[1]][2] + pts[f[2]][2]) / 3 }; });
      tris.sort(function (a, b) { return a.z - b.z; });
      tris.forEach(function (o) {
        var f = o.f;
        ctx.beginPath();
        ctx.moveTo(scr[f[0]][0], scr[f[0]][1]); ctx.lineTo(scr[f[1]][0], scr[f[1]][1]); ctx.lineTo(scr[f[2]][0], scr[f[2]][1]); ctx.closePath();
        ctx.fillStyle = "rgba(216,90,48,0.14)"; ctx.fill();
        ctx.strokeStyle = "rgba(216,90,48,0.55)"; ctx.lineWidth = 1; ctx.stroke();
      });
      dirs.forEach(function (d, i) {
        var p = scr[i], ax = D.AXES[axisForVert[i]];
        ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, 7); ctx.fillStyle = ax.color; ctx.fill();
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--pg-dim") || "#888";
        ctx.font = "12px sans-serif"; ctx.textAlign = "center";
        ctx.fillText(ax.short, p[0], p[1] - 10);
      });
    }
    cv.addEventListener("pointerdown", function (e) { drag = true; px = e.clientX; py = e.clientY; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", function (e) { if (!drag) return; ry += (e.clientX - px)*0.01; rx += (e.clientY - py)*0.01; px = e.clientX; py = e.clientY; draw(); });
    cv.addEventListener("pointerup", function () { drag = false; });
    draw();
  }

  /* ---------- Shareable result card (canvas, 1200x630 = social ratio) ---------- */
  function makeCardCanvas(result, tierObj, topMatch, hypo) {
    var W = 1200, H = 630, c = document.createElement("canvas"); c.width = W; c.height = H;
    var x = c.getContext("2d");
    x.fillStyle = "#141416"; x.fillRect(0, 0, W, H);
    x.fillStyle = "#D85A30"; x.fillRect(0, 0, W, 10);
    x.textAlign = "left";
    x.fillStyle = "#D85A30"; x.font = "bold 48px sans-serif"; x.fillText("PoliGraph", 64, 100);
    x.fillStyle = "#9a9a9f"; x.font = "24px sans-serif"; x.fillText("which world leaders do you line up with?", 66, 138);

    x.fillStyle = "#9a9a9f"; x.font = "20px sans-serif"; x.fillText("AUTHORITARIAN INSTINCT", 64, 226);
    x.fillStyle = "#D85A30"; x.font = "bold 104px sans-serif";
    var num = String(result.overall100); x.fillText(num, 64, 322);
    var nw = x.measureText(num).width;
    x.fillStyle = "#9a9a9f"; x.font = "30px sans-serif"; x.fillText("/100", 64 + nw + 12, 322);
    x.fillStyle = "#ffffff"; x.font = "bold 36px sans-serif"; x.fillText(tierObj.name, 64, 384);

    x.fillStyle = "#dddddd"; x.font = "26px sans-serif"; x.fillText("Aligns with:  " + topMatch.align.name + " (" + topMatch.matchPct + "%)", 64, 448);
    if (hypo && hypo.measured) {
      x.fillStyle = "#E24B4A"; x.font = "26px sans-serif"; x.fillText("Hypocrisy:  " + hypo.score100 + "/100", 64, 490);
    }

    // mini bars on the right
    var bx = 680, bw = 456, by = 210;
    D.AXES.forEach(function (a, i) {
      var pct = result.scores[a.key].score100, yy = by + i * 52;
      x.fillStyle = "#9a9a9f"; x.font = "17px sans-serif"; x.textAlign = "left"; x.fillText(a.short, bx, yy - 6);
      x.fillStyle = "#ffffff"; x.textAlign = "right"; x.fillText(String(pct), bx + bw, yy - 6); x.textAlign = "left";
      x.fillStyle = "#2a2a2e"; x.fillRect(bx, yy, bw, 20);
      x.fillStyle = a.color; x.fillRect(bx, yy, bw * pct / 100, 20);
    });

    x.fillStyle = "#6a6a6f"; x.font = "22px sans-serif"; x.fillText("penpro.github.io/PoliGraph", 64, H - 44);
    return c;
  }
  function makeCard(result, tierObj, topMatch, hypo) {
    return makeCardCanvas(result, tierObj, topMatch, hypo).toDataURL("image/png");
  }

  return { bars: bars, radar2d: radar2d, radar3d: radar3d, makeCard: makeCard, makeCardCanvas: makeCardCanvas };
})();
