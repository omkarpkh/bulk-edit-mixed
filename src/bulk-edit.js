// <bulk-edit> — the interface, at wireframe fidelity.
//
// Every number on screen comes from model.js. Nothing here counts anything,
// decides what is legal, or works out what would change. If a count is wrong,
// the model is wrong — there is no second place for it to go wrong.

import { summarise, methodsFor, METHOD_LABEL, DESTRUCTIVE, plan, describe, groupByTransition,
         reconcile, retryScope, describeResult,
         planBatch, describeBatch, phraseOp } from './model.js?v=1787671470';

// Dark is a fourth palette, not a filter over the third. The ordered scale has to
// run dim-to-bright instead of dark-to-light, and the six categorical hues were
// chosen against white — cat-1 measured 2.67:1 on a dark ground, below the 3:1
// WCAG 1.4.11 asks of a graphic that carries meaning. Both sets are declared once
// so the media query and the explicit override cannot drift apart.
const DARK_WIREFRAME = `--be-ink:#EBECEE; --be-surface:#1C1F24; --be-body:#C7CAD1; --be-muted:#9BA0A8;
  --be-faint:#8F959E; --be-dim:#8F959E; --be-ghost:#8F959E;
  --be-hairline:#363B43; --be-rule:#2A2E35; --be-edge:#828A94; --be-control:#6E757E;
  --be-disabled:#565C65; --be-sunk:#24282F; --be-quiet:#1F2229; --be-quiet-mark:#2B2F37;
  --be-quiet-mark-2:#363B44; --be-tint:#1E2530; --be-hover:#262E3A; --be-row-selected:#222834;
  --be-chip:#28303F; --be-chip-edge:#3C4657; --be-scrim:#000000A6; --be-swatch-edge:#FFFFFF33;
  --be-link:#7FB2FF; --be-clamp:#E8A33D; --be-danger:#FF6B5E; --be-danger-soft:#3A211F;
  --be-ok:#5FC97F; --be-drift:#D9A44A;
  --be-scale-1:#6A6A6A; --be-scale-2:#828282; --be-scale-3:#9A9A9A;
  --be-scale-4:#B0B0B0; --be-scale-5:#C6C6C6; --be-scale-6:#DCDCDC;
  --be-cat-1:#7DA5F0; --be-cat-2:#E0A34A; --be-cat-3:#A3AFBD;
  --be-cat-4:#6FBE83; --be-cat-5:#BE8ECC; --be-cat-6:#EE8A7A;`;
const DARK_DESIGNED  = `--be-ink:#E6EDF3; --be-surface:#161B22; --be-body:#C3CDD9; --be-muted:#9AA7B4;
  --be-faint:#8B98A6; --be-dim:#8B98A6; --be-ghost:#8B98A6;
  --be-hairline:#2C333D; --be-rule:#232A33; --be-edge:#7E8996; --be-control:#6A7480;
  --be-disabled:#525C69; --be-sunk:#1C222B; --be-quiet:#191F27; --be-quiet-mark:#232B35;
  --be-quiet-mark-2:#2E3742; --be-tint:#172029; --be-hover:#1E2833; --be-row-selected:#1B2430;
  --be-chip:#202B3A; --be-chip-edge:#334155; --be-scrim:#010409B3; --be-swatch-edge:#FFFFFF2E;
  --be-link:#79B8FF; --be-clamp:#E3A345; --be-danger:#FF7B72; --be-danger-soft:#3A1D1B;
  --be-ok:#56D364; --be-drift:#D8A657;
  --be-scale-1:#2F8F86; --be-scale-2:#3AA79C; --be-scale-3:#46BEB2;
  --be-scale-4:#57D0C4; --be-scale-5:#78DFD5; --be-scale-6:#9DEDE5;
  --be-cat-1:#79A6F2; --be-cat-2:#DDA23F; --be-cat-3:#9FB0C2;
  --be-cat-4:#63C489; --be-cat-5:#C08FD4; --be-cat-6:#F08A78;`;

const CSS = `
:host {
  --be-swatch-edge:#0003;   /* semi-transparent, so it reads over any swatch colour */
  /* Every value this component draws with is named here. A component in a
     portfolio about machine-readable design systems does not get to have
     anonymous colours. Override any of them from outside the shadow root. */
  --be-ink:#1a1a1a;      /* body text and solid controls */
  --be-surface:#fff;  /* card and control ground */
  --be-muted:#666;    /* secondary text */
  --be-faint:#6A6A6A;
  /* faint, dim and ghost hold the same value on purpose. All three carry text, so all
     three are floored at 4.5:1 on white — and above that floor there is not enough
     room left for three visually distinct greys. The scale is three levels, not five. */    /* tertiary text and carets */
  --be-hairline:#d4d4d4; /* container borders */
  --be-rule:#ececec;     /* internal dividers */
  --be-clamp:#B45309;    /* the system intervened — AA on white */
  --be-danger:#8a2318;   /* destructive */
  --be-link:#1a5fb4;     /* links and the changed value */
  --be-edge:#7E7E7E;       /* disabled and inactive borders */
  --be-dim:#6A6A6A;        /* de-emphasised labels */
  --be-control:#949494;    /* control borders */
  --be-sunk:#f6f6f6;       /* recessed ground: inset panels, progress track */
  --be-disabled:#bbb;      /* text and glyphs that are inert, not merely quiet */
  --be-row-selected:#f7f9fd;/* a row the operator has ticked */
  --be-scrim:#0006;        /* the dim behind a modal sheet */
  --be-body:#444;
  /* Surfaces that recede. --be-sunk is an inset panel; --be-quiet is a whole group
     the operator has been told not to worry about, and --be-quiet-mark is a chip
     or stripe drawn on top of one. */
  --be-quiet:#fafafa;
  --be-quiet-mark:#f0f0f0;
  --be-quiet-mark-2:#e6e6e6;
  /* Tinted rather than grey: these say "informational", not "inactive". */
  --be-tint:#f7f9fd;
  --be-hover:#f4f6fb;
  --be-chip:#eef;
  --be-chip-edge:#dde;
  /* Named states. --be-drift is not --be-clamp: a clamp is the system refusing a
     value; drift is a value that moved when nobody asked. */
  --be-danger-soft:#fbf2f0;
  --be-ok:#2f6b3f;
  --be-drift:#8a5a18;          /* body copy inside a card: softer than ink, darker than muted */
  --be-ghost:#6A6A6A;
  /* Ordinal, not categorical: an ordered scale gets ordered colour. Every step clears
     3:1 on the ground, and adjacent steps are ~1.3x apart so the order is readable. */
  --be-scale-1:#2E2E2E; --be-scale-2:#454545; --be-scale-3:#5C5C5C;
  --be-scale-4:#6E6E6E; --be-scale-5:#7E7E7E; --be-scale-6:#8C8C8C;
  --be-cat-1:#3B5FA8; --be-cat-2:#A6681B; --be-cat-3:#5A6672;
  --be-cat-4:#3E7A4E; --be-cat-5:#7A4A86; --be-cat-6:#A34A3D;
  /* Radius, depth, motion and type were the axes with no names, which is exactly why
     .apply picked up a 7px corner and .go-edit never did. Wireframe values are the
     defaults; the designed theme restates them rather than re-styling each surface. */
  --be-r-1:0; --be-r-2:0; --be-r-full:0;
  --be-shadow-1:none; --be-shadow-2:0 3px 10px rgba(0,0,0,.13);
  --be-dur-1:.18s; --be-dur-2:.28s; --be-ease:cubic-bezier(.2,.7,.3,1);
  --be-t-xs:10.5px; --be-t-sm:11.5px; --be-t-md:12.5px; --be-t-lg:13.5px; --be-t-xl:15px;      /* placeholder text */
  display:block; font:14px/1.5 ui-sans-serif, system-ui, sans-serif; color:var(--be-ink);
}

/* The designed theme is a token override and nine rules — no second component, no
   rebuild. That is the whole argument for naming values, tested on this component
   rather than asserted about someone else's. Toggle it with theme="designed". */
:host([theme="designed"]) {
  /* Flow, as it argued for itself: "cool near-white says diagram canvas, not app panel",
     and "the information is in the glyphs — arrows, walls — not the typeface".

     Everything below the font line is a restatement of a value, not a new rule. That is
     the point: the surfaces this theme has never heard of still change, because they ask
     the token rather than carry the number. .go-edit was the one that proved it — it went
     square while .apply went round, because I set the corner by hand on one of them. */
  --be-ink:#0F172A; --be-surface:#FBFAFC; --be-muted:#475569; --be-faint:#5B6675;
  --be-hairline:#DCE3E8; --be-rule:#E9EEF2; --be-clamp:#B45309; --be-danger:#B3261E;
  --be-link:#1B5FBF; --be-edge:#75828F; --be-dim:#475569; --be-control:#838F9C;
  --be-sunk:#F1F5F8; --be-disabled:#A8B4BE; --be-row-selected:#EEF4FA;
  --be-scrim:#0F172A66; --be-body:#334155;
  --be-ghost:#5B6675;
  --be-scale-1:#0B3B37; --be-scale-2:#0E4F49; --be-scale-3:#11635B;
  --be-scale-4:#14776E; --be-scale-5:#178B81; --be-scale-6:#1A9F94;
  --be-cat-1:#2F5E8F; --be-cat-2:#8A6212; --be-cat-3:#465562;
  --be-cat-4:#2F6B4F; --be-cat-5:#5E4478; --be-cat-6:#8F4438;
  --be-r-1:7px; --be-r-2:10px; --be-r-full:999px;
  --be-shadow-1:0 1px 2px rgba(16,24,40,.06); --be-shadow-2:0 10px 28px rgba(16,24,40,.14);
  --be-dur-1:.18s; --be-dur-2:.30s;
  --be-t-xs:10.5px; --be-t-sm:12px; --be-t-md:13px; --be-t-lg:14px; --be-t-xl:15.5px;
  font:14.5px/1.55 "Inter var", Inter, ui-sans-serif, system-ui, sans-serif;
  letter-spacing:-0.006em;

  /* The eleven the designed theme had never claimed. Left inheriting, they were the
     wireframe's greys sitting inside a designed surface. */
  --be-quiet:#F5F7F9; --be-quiet-mark:#E8EDF1; --be-quiet-mark-2:#DCE3E8;
  --be-tint:#F1F5FA; --be-hover:#EAF1F8; --be-chip:#E9EFF7; --be-chip-edge:#CFDAE6;
  --be-danger-soft:#FBEDEB; --be-ok:#256B4A; --be-drift:#8A5A18; --be-swatch-edge:#0F172A2E;
}

/* prefers-color-scheme covers the system default and standalone use; scheme="dark"
   or scheme="light" lets a host page with its own toggle force either one. */
@media (prefers-color-scheme: dark) {
  :host(:not([scheme="light"])) { ${DARK_WIREFRAME} }
  :host([theme="designed"]:not([scheme="light"])) { ${DARK_DESIGNED} }
}
:host([scheme="dark"]) { ${DARK_WIREFRAME} }
:host([theme="designed"][scheme="dark"]) { ${DARK_DESIGNED} }
/* The rest is structure, not values — a card removed, a column widened, a control
   unboxed. None of it can be expressed as a number, which is how you tell the two apart. */
:host([theme="designed"]) .bar { border:0; background:transparent; padding:2px 0 20px; }
/* Flow wanted a table, not a stack of cards — so the rows stay flat and the SET gets the
   corner. Rounding each row was what made these read as the odd elements on the page. */
:host([theme="designed"]) .group { border-radius:0; box-shadow:none; margin-bottom:0; border-bottom:0; }
:host([theme="designed"]) .group.first { border-radius:var(--be-r-2) var(--be-r-2) 0 0; }
:host([theme="designed"]) .group.last { border-radius:0 0 var(--be-r-2) var(--be-r-2);
         box-shadow:var(--be-shadow-1); }
:host([theme="designed"]) .group.last { border-bottom:1px solid var(--be-hairline); }
:host([theme="designed"]) .group.quiet { background:transparent; }
:host([theme="designed"]) .group.clamped { border-color:var(--be-hairline); }
:host([theme="designed"]) .ghead { padding:14px 16px; }
:host([theme="designed"]) .mark { width:96px; flex:0 0 96px; }
:host([theme="designed"]) .shaft { height:3px; }
:host([theme="designed"]) .clamped .shaft::before { height:15px; top:-6px; width:3px; right:-11px; }
:host([theme="designed"]) .pill { background:transparent; border:0; padding:1px 0; color:var(--be-muted);
         font-variant-numeric:tabular-nums; }
:host([theme="designed"]) .clamped .pill { color:var(--be-clamp); }
:host([theme="designed"]) select,
:host([theme="designed"]) input[type=text] { border:0; border-bottom:1.5px solid var(--be-edge);
  /* The radius belonged to the box this theme removes. Left on a lone bottom border
     it sweeps the line upward at both ends into a hook — 12% of the field control's
     underline, and 33% of the narrow value input's. A rule has no corners. */
  border-radius:0;
         background:transparent; padding:7px 2px; min-width:0; font-weight:600; color:var(--be-ink); }
:host([theme="designed"]) select:hover,
:host([theme="designed"]) input[type=text]:hover { border-bottom-color:var(--be-ink); }
:host([theme="designed"]) .apply { padding:11px 20px; font-weight:600; letter-spacing:-0.005em; }
:host([theme="designed"]) .chip { padding:5px 13px; }
:host([theme="designed"]) .row { gap:10px; }
:host([theme="designed"]) .track { height:9px; border-radius:5px; overflow:hidden; }
* { box-sizing:border-box; }
button, input, select { font:inherit; color:inherit; }

.bar { border:1px solid var(--be-hairline); background:var(--be-surface); padding:14px 16px; border-radius:var(--be-r-2); }
.row { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
/* the operation reads as a sentence — it wraps as a whole or not at all,
   because breaking between the verb and its object strands the value */
.sentence { display:flex; align-items:center; gap:8px; flex-wrap:nowrap; }
.context { margin-top:12px; }
select, input[type=text] { border:1px solid var(--be-edge); background:var(--be-surface); padding:6px 9px; min-width:130px; border-radius:var(--be-r-1); }
.arrow { color:var(--be-faint); }

.dist { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }
.dist .track { display:flex; gap:1px; background:var(--be-surface); width:220px; height:9px; border:1px solid var(--be-control); overflow:hidden; flex:0 0 auto; }
/* Six categorical hues cannot all sit 3:1 from each other — mutual 3:1 needs
   lightness separation, and lightness separation reads as ORDER in a set that
   has none. Measured: every adjacent pair in this palette lands 1.14–1.40:1.
   So the boundary is drawn rather than coloured. A 1px surface gap separates
   every segment regardless of which two hues happen to be neighbours. */
/* The floor is what stops a single host in a thousand rendering sub-pixel and
   unhoverable. It does mean a segment at the floor overstates its share — so the
   bar is presence below the floor and proportion above it, and the exact count
   is the legend's job, never the bar's. */
.dist .seg { min-width:3px; }
.dist .seg.rest { background:repeating-linear-gradient(45deg,var(--be-quiet-mark),var(--be-quiet-mark) 3px,var(--be-quiet-mark-2) 3px,var(--be-quiet-mark-2) 6px); min-width:0; }
.dist .keys { display:flex; gap:4px 12px; flex-wrap:wrap; font-size:var(--be-t-sm); line-height:1.4; color:var(--be-muted); }
.dist .keys b { color:var(--be-ink); font-weight:600; }
/* The swatch takes its shape from the theme's radius token rather than choosing
   one. Square in the wireframe, round in the designed theme, without either
   value being written here. Shape carries no information on this chart — there
   is one mark type — so the only real cost is area: a circle shows ~79% of a
   square's colour at this size, which is why the swatch is 8px and not 7. */
.dist .keys i { font-style:normal; display:inline-block; width:8px; height:8px; margin-right:4px; border:1px solid var(--be-swatch-edge); border-radius:var(--be-r-full); }
.dist .cap { font-size:var(--be-t-xs); letter-spacing:.09em; text-transform:uppercase; color:var(--be-faint); flex:0 0 auto; }

.apply { margin-left:auto; border:1px solid var(--be-ink); background:var(--be-ink); color:var(--be-surface); padding:8px 15px; cursor:pointer; border-radius:var(--be-r-1); }
.apply[disabled] { background:var(--be-surface); color:var(--be-faint); border-color:var(--be-control); cursor:default; }
.apply.destructive { background:var(--be-danger); border-color:var(--be-danger); }

.summary { margin-top:9px; font-size:var(--be-t-lg); color:var(--be-body); }
.summary b { color:var(--be-ink); }
/* A border that exists on only one edge must not be rounded at that edge — the
   radius clips the bar into a hook instead of ending it. Three rules had this:
   one accent bar and two separators. .equiv is the same accent-bar pattern and
   never hooked, only because it happened to declare no radius at all. */
.warn { margin-top:8px; font-size:var(--be-t-sm); border-left:3px solid var(--be-danger); padding:5px 9px; color:var(--be-danger); background:var(--be-danger-soft); border-radius:0 var(--be-r-2) var(--be-r-2) 0; }
.unit { font-size:var(--be-t-md); color:var(--be-faint); margin-left:-4px; }
.multi-dist { align-items:flex-start; }
.multi-dist .mini { display:flex; align-items:center; gap:9px; }
.multi-dist .track { width:120px; }
.multi-dist .mlab { font-size:var(--be-t-sm); color:var(--be-muted); }
.multi-dist .mlab b { color:var(--be-ink); }
.multi { position:relative; display:inline-flex; }
.multi-btn { display:flex; align-items:center; gap:5px; min-width:150px; min-height:31px; border:1px solid var(--be-edge);
  background:var(--be-surface); padding:4px 8px; font:inherit; cursor:pointer; text-align:left; flex-wrap:wrap; }
.multi-btn .ph { color:var(--be-faint); }
.multi-btn .caret { margin-left:auto; color:var(--be-dim); font-size:var(--be-t-xs); }
.vchip { background:var(--be-chip); border:1px solid var(--be-chip-edge); font-size:var(--be-t-sm); padding:1px 6px; border-radius:var(--be-r-1); }
.multi-menu { position:absolute; top:calc(100% + 3px); left:0; z-index:5; min-width:190px; max-height:210px; overflow:auto;
  background:var(--be-surface); border:1px solid var(--be-edge); box-shadow:var(--be-shadow-2); padding:5px 0; }
.mrow { display:flex; align-items:center; gap:8px; padding:5px 11px; font-size:var(--be-t-lg); cursor:pointer; }
.mrow:hover { background:var(--be-hover); }
.addop { margin-top:7px; font-size:var(--be-t-md); color:var(--be-ghost); background:none; border:0; padding:0; font-family:inherit;
  cursor:default; display:inline-flex; align-items:center; gap:7px; }
.addop .soon { font-size:var(--be-t-xs); letter-spacing:.09em; text-transform:uppercase; color:var(--be-faint);
  border:1px dashed var(--be-control); padding:1px 6px; }
.ghead { width:100%; text-align:left; background:none; border:0; font:inherit; }
.ghead:focus-visible, .chip:focus-visible, .go-edit:focus-visible, .apply:focus-visible,
input:focus-visible, select:focus-visible, .strip-fix a:focus-visible { outline:2px solid var(--be-link); outline-offset:1px; }

.label { font-size:var(--be-t-xs); letter-spacing:.09em; text-transform:uppercase; color:var(--be-dim); margin:20px 0 7px; }

.group { border:1px solid var(--be-hairline); background:var(--be-surface); margin-bottom:9px; border-radius:var(--be-r-2); }
.group.quiet { background:var(--be-quiet); border-color:var(--be-rule); }
/* The arrow is only on the clamped row now. Three findings put it there: a clamp is
   reachable in one of five common operations, real group sets are often two rows and
   not three, and in the built component it sat ten pixels from a disclosure caret that
   the scored Figma frames never had — a control glyph and a data glyph, side by side.
   What survives is the part the count cannot do live: drag the operand and watch the
   clamp swell, 44 hosts to 82. It follows the label instead of preceding it, so it is
   next to the thing it qualifies rather than next to the thing you click. */
.mark { position:relative; display:inline-block; width:64px; flex:0 0 64px; height:14px; margin-left:2px; }
.shaft { position:absolute; left:0; top:6px; height:2px; background:var(--be-muted);
         transition:width var(--be-dur-2) var(--be-ease); }
.shaft::after { content:''; position:absolute; right:-1px; top:-3px;
         border-left:6px solid var(--be-muted); border-top:4px solid transparent; border-bottom:4px solid transparent; }
/* The wall marks where THIS arrow stopped, so it sits at the end of the shaft rather
   than at the container edge. Pinned to the edge it read as two separate marks with a
   gap between them, which is not "stopped by a boundary" — it is just two things. */
.clamped .shaft::before { content:''; position:absolute; right:-9px; top:-5px;
         width:2px; height:12px; background:var(--be-clamp); }
.clamped .shaft { background:var(--be-clamp); }
.clamped .shaft::after { border-left-color:var(--be-clamp); }
@media (prefers-reduced-motion:reduce) { .shaft { transition:none; } }
.clamped .ghead .name { color:var(--be-clamp); }
.ghead { display:flex; align-items:center; gap:10px; padding:11px 14px; cursor:pointer; user-select:none; }
.ghead .caret, .lcaret .caret { position:relative; width:10px; height:10px; flex:0 0 10px; }
.ghead .caret::before, .lcaret .caret::before { content:''; position:absolute; left:1px; top:2px; width:5px; height:5px;
        border-right:1.5px solid var(--be-faint); border-bottom:1.5px solid var(--be-faint);
        transform:rotate(-45deg); transform-origin:60% 60%;
        transition:transform var(--be-dur-1) var(--be-ease); }
.ghead[aria-expanded="true"] .caret::before, .lcaret[aria-expanded="true"] .caret::before { transform:rotate(45deg); }
.clamped .ghead .caret::before { border-color:var(--be-clamp); }
/* Same chevron on the value picker, but a dropdown points down when closed, not right. */
.multi-btn .caret { position:relative; width:10px; height:10px; flex:0 0 10px; }
.multi-btn .caret::before { content:''; position:absolute; left:2px; top:1px; width:5px; height:5px;
        border-right:1.5px solid var(--be-faint); border-bottom:1.5px solid var(--be-faint);
        transform:rotate(45deg); transition:transform var(--be-dur-1) var(--be-ease); }
.multi-btn[aria-expanded="true"] .caret::before { transform:rotate(-135deg); }
@media (prefers-reduced-motion:reduce) { .ghead .caret::before { transition:none; } }
.ghead .name { font-weight:600; }
.group.quiet .ghead .name { font-weight:400; color:var(--be-ink); }
.pill { font-size:var(--be-t-sm); background:var(--be-chip); border:1px solid var(--be-chip-edge); padding:1px 8px; }
.group.quiet .pill { background:var(--be-quiet-mark); border-color:var(--be-hairline); color:var(--be-ink); }
.exc { font-size:var(--be-t-sm); color:var(--be-faint); }
.gbody { border-top:1px solid var(--be-rule); padding:11px 14px 13px; border-radius:0 0 var(--be-r-2) var(--be-r-2); }

.search { width:250px; margin-bottom:10px; }
table { width:100%; border-collapse:collapse; font-size:var(--be-t-lg); }
th { text-align:left; font-size:var(--be-t-xs); letter-spacing:.07em; text-transform:uppercase; color:var(--be-faint); font-weight:400; padding:0 8px 6px 0; }
td { padding:5px 8px 5px 0; border-top:1px solid var(--be-rule); }
tr.skipped td { color:var(--be-ghost); }
tr.skipped .after { color:var(--be-ghost); font-weight:400; }
.before { color:var(--be-dim); }
.after { font-weight:600; }
.tag { font-size:var(--be-t-sm); color:var(--be-faint); }
.more { margin-top:9px; font-size:var(--be-t-md); color:var(--be-muted); }
.more a { color:var(--be-link); cursor:pointer; text-decoration:none; }
.subhead { font-size:var(--be-t-xs); letter-spacing:.07em; text-transform:uppercase; color:var(--be-ghost); padding:12px 0 2px; }
.empty { color:var(--be-faint); font-size:var(--be-t-lg); padding:6px 0; }

.pick { border:1px solid var(--be-hairline); background:var(--be-surface); border-radius:var(--be-r-1); }
.pick .top { display:flex; align-items:center; gap:9px; flex-wrap:wrap; padding:12px 14px; border-bottom:1px solid var(--be-rule); }
.chip { font-size:var(--be-t-md); border:1px solid var(--be-control); background:var(--be-surface); padding:4px 11px; cursor:pointer; border-radius:var(--be-r-1); }
.chip[aria-pressed=true] { background:var(--be-ink); color:var(--be-surface); border-color:var(--be-ink); }
.chip.sel { margin-left:6px; }
.matchcount { margin-left:auto; font-size:var(--be-t-md); color:var(--be-faint); }
.strip { border-bottom:1px solid var(--be-rule); background:var(--be-tint); border-radius:var(--be-r-2) var(--be-r-2) 0 0; }
.strip-main { display:flex; align-items:center; gap:12px; padding:10px 14px; font-size:var(--be-t-lg); }
.strip-main .tick { color:var(--be-ok); }
.strip-main b { font-weight:600; }
.scope-ctl { display:flex; align-items:center; gap:7px; margin-left:6px; }
.scope-lbl { font-size:var(--be-t-xs); letter-spacing:.09em; text-transform:uppercase; color:var(--be-dim); }
.scope-ctl select { border:1px solid var(--be-edge); background:var(--be-surface); padding:5px 8px; font-size:var(--be-t-lg); max-width:330px; }
.strip .go-edit { margin-left:auto; }
.strip-note { padding:0 14px 10px 32px; font-size:var(--be-t-md); color:var(--be-faint); }
.strip-note .drift { color:var(--be-drift); }
.strip-fix { padding:0 14px 11px 32px; font-size:var(--be-t-md); display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.strip-fix a { color:var(--be-link); cursor:pointer; text-decoration:none; }
.strip-fix a:hover { text-decoration:underline; }
.strip-fix .sep { color:var(--be-control); }
.go-edit { border:1px solid var(--be-ink); background:var(--be-ink); color:var(--be-surface); padding:7px 14px; cursor:pointer; border-radius:var(--be-r-1); }
.go-edit[disabled] { background:var(--be-surface); color:var(--be-ghost); border-color:var(--be-control); cursor:default; }
.pick .rows { max-height:380px; overflow:auto; }
/* On a phone the inner 380px scroller is a trap: a finger scrolling the page hits it
   and pans thousands of pixels of rows instead. Let the page own vertical scrolling,
   and leave the table as the single horizontal scroller. */
@media (max-width:700px) {
  .pick .rows { max-height:none; overflow-x:auto; overflow-y:visible; }
}
.pick table { width:100%; }
.pick th { position:sticky; top:0; background:var(--be-surface); box-shadow:0 1px 0 var(--be-rule); padding:8px 10px 7px 0; }
.pick td { padding:6px 10px 6px 0; }
.pick tr.on td { background:var(--be-row-selected); }
.pick .pad { padding-left:14px; }
.foot { display:flex; align-items:center; gap:12px; padding:10px 14px; border-top:1px solid var(--be-rule); font-size:var(--be-t-md); color:var(--be-muted); flex-wrap:wrap; }
.foot .shows b { color:var(--be-ink); }
.foot .onpage { color:var(--be-dim); }
.pager { margin-left:auto; display:flex; gap:3px; align-items:center; }
.pnum { font:inherit; font-size:var(--be-t-md); border:1px solid transparent; background:none; color:var(--be-link); padding:3px 8px; cursor:pointer; border-radius:var(--be-r-1); }
.pnum[aria-current=true] { border-color:var(--be-control); background:var(--be-surface); color:var(--be-ink); font-weight:600; }
.pnum[disabled] { color:var(--be-disabled); cursor:default; }
.pager .gap { color:var(--be-dim); padding:0 2px; }
.slot { border:1px dashed var(--be-control); background:var(--be-sunk); color:var(--be-dim); font-size:var(--be-t-md); padding:8px 11px; margin:10px 14px 12px; border-radius:var(--be-r-1); }
.backlink { font-size:var(--be-t-md); color:var(--be-muted); margin-bottom:10px; }
.backlink a { color:var(--be-link); cursor:pointer; text-decoration:none; }

.sheet { position:fixed; inset:0; background:var(--be-scrim); display:flex; align-items:center; justify-content:center; padding:24px; border-radius:var(--be-r-2); }
.card { background:var(--be-surface); border:1px solid var(--be-ink); max-width:520px; width:100%; padding:20px 22px; border-radius:var(--be-r-2); }
.card h3 { margin:0 0 9px; font-size:var(--be-t-xl); }
.card p { margin:0 0 11px; font-size:var(--be-t-lg); color:var(--be-body); }
.card .list { font-size:var(--be-t-md); color:var(--be-muted); background:var(--be-sunk); border:1px solid var(--be-rule); padding:8px 10px; margin-bottom:13px; max-height:120px; overflow:auto; }
.card .acts { display:flex; gap:9px; justify-content:flex-end; }
.card button { border:1px solid var(--be-edge); background:var(--be-surface); padding:7px 14px; cursor:pointer; }
.card button.go { background:var(--be-danger); border-color:var(--be-danger); color:var(--be-surface); }
.card button.go[disabled] { background:var(--be-surface); color:var(--be-disabled); border-color:var(--be-hairline); cursor:default; }
.confirm { display:flex; gap:7px; align-items:center; font-size:var(--be-t-lg); margin-bottom:14px; }
.confirm input { width:150px; border:1px solid var(--be-edge); padding:5px 8px; }

.progress { border:1px solid var(--be-hairline); background:var(--be-surface); padding:16px; border-radius:var(--be-r-2); }
.progress .track { height:6px; background:var(--be-sunk); margin:10px 0 8px; }
.progress .fill { height:6px; background:var(--be-ink); transition:width var(--be-dur-1) var(--be-ease); }

.result { border:1px solid var(--be-hairline); background:var(--be-surface); padding:16px; border-radius:var(--be-r-2); }
.result.bad { border-color:var(--be-danger); }
.result h3 { margin:0 0 6px; font-size:var(--be-t-xl); }
.result .acts { margin-top:13px; display:flex; gap:9px; }
.result .acts button { border:1px solid var(--be-ink); background:var(--be-ink); color:var(--be-surface); padding:7px 14px; cursor:pointer; }
.result .acts button.ghost { background:var(--be-surface); color:var(--be-ink); }
.fails { margin-top:11px; font-size:var(--be-t-lg); }
.fails tr td { border-top:1px solid var(--be-rule); padding:5px 8px 5px 0; }
.fails .why { color:var(--be-danger); font-size:var(--be-t-sm); }

/* ---- operation lanes: the multi-operation surface ----
   One lane per operation, all visible at once. The evaluator's reason for this
   over tabs: an operation that does nothing is one you must be able to see
   without going looking for it. */
.lanes { border:1px solid var(--be-hairline); background:var(--be-surface); border-radius:var(--be-r-2); margin-bottom:12px; }
.lane { border-bottom:1px solid var(--be-rule); position:relative; }
/* Which row the dropdowns above are pointed at. A left edge rather than a fill:
   the row's own dead/live colouring still has to read through it. */
.lane.editing::before { content:''; position:absolute; left:0; top:0; bottom:0; width:2px; background:var(--be-link); }
.lane-edit { font-size:var(--be-t-xs); letter-spacing:.07em; text-transform:uppercase; color:var(--be-link); margin-left:8px; }
.lane-row { display:flex; align-items:baseline; gap:0; }
.lcaret { flex:0 0 auto; display:flex; align-items:center; padding:11px 4px 11px 13px;
          background:none; border:0; cursor:pointer; }
.lhead { flex:1 1 auto; min-width:0; display:flex; align-items:baseline; gap:11px; padding:11px 9px 11px 7px;
         background:none; border:0; font:inherit; color:inherit; text-align:left; cursor:pointer; }
.lane-detail { padding:2px 13px 12px 47px; }
.ld-head { font-size:var(--be-t-xs); letter-spacing:.06em; text-transform:uppercase; color:var(--be-faint); margin-bottom:7px; }
.ld-row { display:flex; align-items:baseline; gap:10px; padding:6px 0; font-size:var(--be-t-sm); }
/* Between, not around: the lane already has an outer border, and once one row is
   expanded the three run together without a rule to hold them apart. */
.ld-row + .ld-row { border-top:1px solid var(--be-rule); }
.ld-row.quiet .ld-t, .ld-row.quiet .ld-n { color:var(--be-muted); }
.ld-t { flex:0 0 auto; min-width:150px; color:var(--be-ink); }
.ld-arrow { color:var(--be-faint); padding:0 2px; }
.ld-n { flex:0 0 52px; text-align:right; color:var(--be-ink); font-variant-numeric:tabular-nums; }
.ld-s-wrap { flex:1 1 auto; min-width:0; color:var(--be-faint); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
/* Expanded in place rather than behind a third caret: the names are for checking,
   and a bounded scroll keeps a 123-host list from becoming the page. The toggle
   sits OUTSIDE that scroll box — inside it, "show fewer" was at the bottom of
   778px of names clipped to 104px, so expanding was a one-way door. */
.ld-s-wrap.open { white-space:normal; overflow:visible; text-overflow:clip; }
.ld-s-wrap.open .ld-s { display:block; max-height:104px; overflow-y:auto; line-height:1.65;
  border-left:2px solid var(--be-rule); padding-left:9px; }
.ld-s-wrap.open .ld-more { display:inline-block; margin-top:6px; }
.ld-more { background:none; border:0; padding:0; font:inherit; color:var(--be-link); cursor:pointer; white-space:nowrap; }
.ld-more:hover { text-decoration:underline; }
.ld-undo { flex:0 0 auto; color:var(--be-clamp); }
.lane:last-child { border-bottom:none; }
.lane-n { font-size:var(--be-t-xs); color:var(--be-faint); flex:0 0 16px; }
.lane-body { flex:1 1 auto; min-width:0; }
.lane-op { font-size:var(--be-t-lg); color:var(--be-ink); }
.lane.dead .lane-op { color:var(--be-muted); text-decoration:line-through; text-decoration-thickness:1px; }
.lane-note { font-size:var(--be-t-sm); color:var(--be-muted); margin-top:3px; }
.label-note { color:var(--be-faint); text-transform:none; letter-spacing:0; margin-left:9px; }
.pickhint { font-size:var(--be-t-sm); color:var(--be-faint); margin-top:5px; }
.lane.dead .lane-note { color:var(--be-clamp); }
.lane-x { flex:0 0 auto; border:0; background:none; color:var(--be-faint); cursor:pointer; font-size:var(--be-t-md);
  /* Matches .lhead's 13px so the glyph is inset from the border by the same amount
     the row's text is, instead of sitting 1px off it. Also gives it a real hit area. */
  padding:11px 13px; line-height:1; }
.lane-x:hover { color:var(--be-danger); transform:scale(1.12); }

/* Hover is the one kind of motion this component can express in CSS: hovering does
   not re-render, so the element is still there and a transition has a from-state.
   Only where the affordance is genuinely unstated — a whole lane row became
   clickable and said nothing about it. */
.lane-row, .ghead, .addop, .chip, .multi-btn, .lane-x, .go-edit {
  transition:background var(--be-dur-1) var(--be-ease), color var(--be-dur-1) var(--be-ease),
             border-color var(--be-dur-1) var(--be-ease), transform var(--be-dur-1) var(--be-ease);
}
.lane-row:hover { background:var(--be-hover); }
.lane.editing .lane-row:hover { background:transparent; }   /* selection already says it */
.lcaret:hover .caret::before { border-color:var(--be-ink); }
.ghead:hover { background:var(--be-hover); }
.addop:hover { color:var(--be-link); }
.chip:hover { border-color:var(--be-edge); color:var(--be-ink); }
.multi-btn:hover { border-color:var(--be-ink); }
.go-edit:not([disabled]):hover { transform:translateY(-1px); }
@media (prefers-reduced-motion:reduce) {
  .lane-row, .ghead, .addop, .chip, .multi-btn, .lane-x, .go-edit { transition:none; }
  .lane-x:hover, .go-edit:not([disabled]):hover { transform:none; }
}
.equiv { font-size:var(--be-t-md); color:var(--be-ink); border-left:2px solid var(--be-clamp); padding:8px 12px; margin-bottom:14px; background:var(--be-surface); border-radius:0 var(--be-r-2) var(--be-r-2) 0; }
.equiv b { font-weight:600; }
`;

// Six unrelated hues for an ordered scale was Instrument's logic — the direction that
// placed last, and that all five independent directions overruled. The scale is now an
// ordinal ramp read from tokens, so a theme can restate it without touching this file.
const SCALE = ['var(--be-scale-1)','var(--be-scale-2)','var(--be-scale-3)',
               'var(--be-scale-4)','var(--be-scale-5)','var(--be-scale-6)'];
// Ordinal colour is only right for an ordered scale. 1d..90d is one; prod/staging/dev
// is not, and ramping it would assert an order that does not exist — the same class of
// lie as ramping unrelated hues over something that IS ordered.
const CATEGORICAL = ['var(--be-cat-1)','var(--be-cat-2)','var(--be-cat-3)',
                     'var(--be-cat-4)','var(--be-cat-5)','var(--be-cat-6)'];
const paletteFor = field => (field?.type === 'number' ? SCALE : CATEGORICAL);

export class BulkEdit extends HTMLElement {
  #state = { fieldKey: null, method: null, operand: null, excluded: new Set(), open: new Set(), showAll: new Set(), query: {}, ops: [] };
  #phase = { name: 'browsing' };  // browsing | editing | confirming | committing | done
  #retryOnly = null;

  // `items` is everything available; the selection is what an operation acts on.
  // Conflating the two is how "select all" quietly becomes an incident.
  set data({ items, fields, selected }) {
    this.all = items;
    this.fields = fields;
    this.selection = new Set(selected ?? items.map(i => i.id));
    this.filter = null;
    this.onlySelected = false;
    this.pageNo = 0;
    // How the current selection came about. Pinned to ids, never to the query:
    // if it followed the filter, changing a filter would silently change what
    // you are about to edit.
    this.scope = null;   // { mode:'page'|'matching', ids:Set, filter, count }
    this.#reset();
    this.#render();
  }

  get items() { return this.all.filter(i => this.selection.has(i.id)); }
  get matching() { return this.filter ? this.all.filter(i => i.environment === this.filter) : this.all; }

  static LIMIT = 10000;      // beyond this, bulk edit is not the right tool and says so
  static PAGE = 60;          // rows rendered at once on a roomy viewport
  static PAGE_NARROW = 12;   // on a phone, 60 rows is five screens of scrolling — the
                             // pagination control already exists, so use it

  // Page size is a function of the viewport, not a constant. Rendering 60 rows on a
  // 375px screen is unusable whether or not it scrolls well.
  get pageSize() {
    return matchMedia('(max-width:700px)').matches ? BulkEdit.PAGE_NARROW : BulkEdit.PAGE;
  }

  // Three different sets, and the whole scope problem is people conflating them:
  //   matching — everything the current filter matches
  //   page     — the slice of that actually rendered
  //   selection— what an operation will act on
  get pageCount() { return Math.max(1, Math.ceil(this.matching.length / this.pageSize)); }
  get page() {
    // clamped, because a viewport change can shrink the page count under a live pageNo
    const per = this.pageSize;
    const start = Math.min(this.pageNo ?? 0, this.pageCount - 1) * per;
    return this.matching.slice(start, start + per);
  }

  // What the selection is, and how it has drifted from how it was made.
  get scopeReport() {
    const total = this.selection.size;
    const matchIds = new Set(this.matching.map(i => i.id));
    const pageIds  = new Set(this.page.map(i => i.id));

    // deliberately non-overlapping, so the numbers can be read as facts rather
    // than as three ways of saying one thing
    const notMatching = [...this.selection].filter(id => !matchIds.has(id)).length;
    const offPage = [...this.selection].filter(id => matchIds.has(id) && !pageIds.has(id)).length;
    const removed = this.scope ? [...this.scope.ids].filter(id => !this.selection.has(id)).length : 0;

    return { total, offPage, notMatching, removed, mode: this.scope?.mode ?? null };
  }
  get visible() {
    let v = this.filter ? this.all.filter(i => i.environment === this.filter) : this.all;
    if (this.onlySelected) v = v.filter(i => this.selection.has(i.id));
    return v;
  }

  #reset() {
    const f = this.fields[0];
    const m0 = methodsFor(f)[0];
    this.#state = {
      // Every operation lives here, including the one the picker is editing. There
      // is no separate pending slot: that duality is what made a configured
      // operation vanish when you changed the field, and it produced every
      // multi-operation bug this component has had.
      ops: [{ fieldKey: f.key, method: m0, operand: this.#defaultOperand(f, m0), touched: false }],
      editing: 0,
      excluded: new Set(), open: new Set(), showAll: new Set(), query: {}, seededFor: null,
      openOps: new Set(),
      openSamples: new Set(),
    };
    this.#phase = { name: 'browsing' };
  }

  // The row the dropdowns are pointed at.
  get #cur() { return this.#state.ops[this.#state.editing] ?? this.#state.ops[0]; }
  get #field() { return this.fields.find(f => f.key === this.#cur?.fieldKey); }

  #opAt(o) { return { field: this.fields.find(f => f.key === o.fieldKey), method: o.method, operand: o.operand }; }

  // Only the row you start with is provisional: switching fields reuses it, so
  // browsing at the outset leaves nothing behind. Every row created after that is
  // committed the moment it exists, because you only get one by deliberately
  // leaving a configured operation — and then it stays until its × is clicked.
  // The ceiling is not the number of fields — Tags alone affords four operations
  // and retention three. It is the field x method pairs, and only when every one
  // of them has a row can this button do nothing but repeat itself.
  // One operation per field, with one exception. A second operation on a value is
  // never a goal: a second Set overrides the first, Enable then Disable cancels,
  // and Decrease 7 then Increase 3 is just Decrease 4 — the model tolerates all of
  // them and calls them dead, but offering them invites the operator to build
  // something they did not mean. A multi-value field is different because it holds
  // a set, not a value: add one tag and remove another is a single retag intent
  // that cannot be said any other way. Replace and Clear already own the whole set,
  // so they take no partner.
  #freeMethodOn(f) {
    const on = this.#state.ops.filter(o => o.fieldKey === f.key);
    if (!on.length) return methodsFor(f)[0];
    if (f.type !== 'multi-value' || on.length > 1) return null;
    return on[0].method === 'add' ? 'remove' : on[0].method === 'remove' ? 'add' : null;
  }
  #nextFreeField() {
    const used = new Set(this.#state.ops.map(o => o.fieldKey));
    return this.fields.find(x => !used.has(x.key))
        ?? (this.#freeMethodOn(this.#field) ? this.#field : null)
        ?? this.fields.find(x => this.#freeMethodOn(x))
        ?? null;
  }

  #newRow(f) {
    const m = methodsFor(f)[0];
    return { fieldKey: f.key, method: m, operand: this.#defaultOperand(f, m), touched: false };
  }

  #defaultOperand(field, method) {
    if (field.type === 'boolean') return null;
    if (field.type === 'number') return method === 'set' ? (field.min ?? 1) : 7;
    if (method === 'clear') return null;
    const s = summarise(this.items, field);
    if (field.type === 'multi-value') {
      // default to the most common existing value — an empty operand means
      // "add nothing", which computes correctly and reads as nonsense
      const top = s.presence?.[0]?.value;
      return top == null ? [] : [top];
    }
    return field.options?.[0] ?? s.values?.[0]?.value ?? '';
  }

  // The only place the interface is allowed to know anything.
  #compute() {
    const field = this.#field, cur = this.#cur, { excluded } = this.#state;
    const { method, operand } = cur;
    const ops = this.#state.ops.map(o => this.#opAt(o));

    // One operation is the case this component was built for, and it keeps the
    // path it already had — transition groups, and a plan() result the rest of
    // the render tree already knows how to read.
    const p = plan(this.items, field, method, operand, excluded);
    const base = { field, p, groups: groupByTransition(p, field, method, operand), current: summarise(this.items, field) };
    // The moment anything is banked, the batch is the truth — not the picker.
    // Gating on ops.length >= 2 was wrong: with one banked operation and an empty
    // picker, the preview and the apply button read the cleared picker and
    // offered to change every host.
    // One operation keeps the transition-group surface — per-host exclusion, clamp
    // marks, the whole reason this component exists. The list takes over at two.
    if (ops.length < 2) return { ...base, ops, batch: null, reduction: null };

    // Two or more, and the operation list becomes the primary surface. The model
    // already answers this; nothing is counted here.
    const batch = planBatch(this.items, ops, this.#state.excluded);
    return { ...base, ops, batch, reduction: describeBatch(batch) };
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.shadowRoot.addEventListener('click', e => this.#onClick(e));
    this.shadowRoot.addEventListener('change', e => this.#onChange(e));
    this.shadowRoot.addEventListener('input', e => this.#onInput(e));
    this.shadowRoot.addEventListener('keydown', e => this.#onKey(e));
    // `this.all` and not `this.items` — the items getter filters `all`, so asking
    // it whether data has arrived throws before it ever has. An exception thrown
    // in a custom element callback is reported and swallowed rather than raised
    // to the caller, so this failed silently on every upgrade.
    if (this.all) this.#render();
  }

  // A tool someone runs fifty times a day needs a way out that is not the mouse.
  // Escape backs out of whatever state you are in — except a commit already in
  // flight, which is the one thing that must not be interruptible from a keystroke.
  #onKey(e) {
    if (e.key !== 'Escape') return;
    const back = { editing: 'reselect', confirming: 'cancel', done: 'done' }[this.#phase.name];
    if (!back) return;
    e.preventDefault();
    this.#act(back);
  }

  #onChange(e) {
    const t = e.target, s = this.#state;
    if (t.id === 'field') {
      const f = this.fields.find(x => x.key === t.value);
      const i = s.editing, cur = s.ops[i];
      const existing = s.ops.findIndex((o, j) => j !== i && o.fieldKey === f.key);
      if (existing !== -1) {
        // That field already has an operation — edit it rather than shadowing it,
        // and drop the row being left if it was never configured.
        if (!cur.touched && s.ops.length > 1) {
          s.ops = s.ops.filter((_, j) => j !== i);
          s.editing = existing > i ? existing - 1 : existing;
        } else s.editing = existing;
      } else if (!cur.touched) {
        Object.assign(cur, this.#newRow(f));
      } else {
        s.ops = [...s.ops, { ...this.#newRow(f), touched: true }];
        s.editing = s.ops.length - 1;
      }
      s.open.clear(); s.showAll.clear(); s.query = {}; s.seededFor = null;
      s.openOps = new Set(); s.openSamples = new Set();
    } else if (t.id === 'method') {
      const cur = this.#cur;
      cur.method = t.value; cur.operand = this.#defaultOperand(this.#field, t.value); cur.touched = true;
    } else if (t.id === 'operand') {
      const cur = this.#cur, f = this.#field;
      cur.operand = f.type === 'number' ? Number(t.value)
                  : f.type === 'multi-value' ? (t.value ? [t.value] : [])
                  : t.value;
      cur.touched = true;
    } else if (t.dataset.scope !== undefined) {
      if (t.value === 'matching') {
        const ids = this.matching.map(i => i.id);
        this.selection = new Set(ids);
        this.scope = { mode: 'matching', ids: new Set(ids), filter: this.filter, count: ids.length };
      } else {
        const ids = this.page.map(i => i.id);
        this.selection = new Set(ids);
        this.scope = { mode: 'page', ids: new Set(ids), filter: this.filter, count: ids.length };
      }
      s.seededFor = null;
    } else if (t.dataset.pageall !== undefined) {
      // the header checkbox means exactly one thing: the rows you can see
      const ids = this.page.map(i => i.id);
      if (t.checked) { ids.forEach(id => this.selection.add(id)); this.scope = { mode: 'page', ids: new Set(ids), filter: this.filter, count: ids.length }; }
      else ids.forEach(id => this.selection.delete(id));
      s.seededFor = null;
    } else if (t.dataset.val !== undefined) {
      const row = this.#cur, have = Array.isArray(row.operand) ? [...row.operand] : [];
      row.operand = t.checked ? [...have, t.dataset.val] : have.filter(v => v !== t.dataset.val);
      row.touched = true;
      s.seededFor = null;
    } else if (t.dataset.pick) {
      t.checked ? this.selection.add(t.dataset.pick) : this.selection.delete(t.dataset.pick);
      s.seededFor = null;
    } else if (t.dataset.exclude) {
      t.checked ? s.excluded.delete(t.dataset.exclude) : s.excluded.add(t.dataset.exclude);
    } else return;
    this.#render();
  }

  #onInput(e) {
    if (e.target.dataset.typed !== undefined) {
      this.#phase.typed = e.target.value;
      return this.#render({ focus: '[data-typed]' });
    }
    if (!e.target.dataset.search) return;
    this.#state.query[e.target.dataset.search] = e.target.value;
    this.#render({ focus: `[data-search="${e.target.dataset.search}"]` });
  }

  #onClick(e) {
    const multi = e.target.closest?.('[data-multi]');
    if (multi) { this.#state.pickerOpen = !this.#state.pickerOpen; return this.#render(); }
    // clicking anywhere else closes the value menu
    if (this.#state.pickerOpen && !e.target.closest?.('.multi')) { this.#state.pickerOpen = false; this.#render(); }
    const fix = e.target.closest?.('[data-fix]');
    if (fix) {
      const k = fix.dataset.fix;
      if (k === 'refilter') { const ids = this.matching.map(i => i.id); this.selection = new Set(ids); this.scope = { mode:'matching', ids:new Set(ids), filter:this.filter, count:ids.length }; }
      if (k === 'keep')     { this.scope = { mode:'matching', ids:new Set(this.selection), filter:this.filter, count:this.selection.size }; }
      if (k === 'restore')  { this.selection = new Set(this.scope.ids); }
      if (k === 'page')     { const ids = this.page.map(i => i.id); this.selection = new Set(ids); this.scope = { mode:'page', ids:new Set(ids), filter:this.filter, count:ids.length }; }
      if (k === 'clear')    { this.selection = new Set(); this.scope = null; }
      this.#state.seededFor = null;
      return this.#render();
    }
    const pg = e.target.closest?.('[data-page]');
    if (pg) { this.pageNo = Number(pg.dataset.page); return this.#render(); }
    const only = e.target.closest?.('[data-only]');
    if (only) { this.onlySelected = !this.onlySelected; this.pageNo = 0; return this.#render(); }
    const chip = e.target.closest?.('[data-filter]');
    if (chip) { this.filter = chip.dataset.filter || null; this.pageNo = 0; return this.#render(); }
    const act = e.target.closest?.('[data-act]');
    if (act) return this.#act(act.dataset.act);
    const sample = e.target.closest?.('[data-sample]');
    if (sample) {
      const k = sample.dataset.sample, open = this.#state.openSamples;
      open.has(k) ? open.delete(k) : open.add(k);
      return this.#render();
    }
    const exp = e.target.closest?.('[data-laneexp]');
    if (exp) {
      const k = Number(exp.dataset.laneexp), open = this.#state.openOps;
      open.has(k) ? open.delete(k) : open.add(k);
      return this.#render();
    }
    // Selecting a row is the only way to reach the second operation on a field —
    // the field dropdown can only ever land on the first one that matches.
    const lane = e.target.closest?.('[data-lane]');
    if (lane) {
      this.#state.editing = Number(lane.dataset.lane);
      this.#state.open.clear(); this.#state.showAll.clear();
      this.#state.query = {}; this.#state.seededFor = null;
      return this.#render();
    }
    const head = e.target.closest?.('.ghead'), more = e.target.closest?.('[data-showall]');
    if (more) { this.#state.showAll.add(more.dataset.showall); return this.#render(); }
    if (head) {
      const k = head.dataset.key, open = this.#state.open;
      open.has(k) ? open.delete(k) : open.add(k);
      return this.#render();
    }
  }

  // innerHTML replacement destroys focus, so remember where it was and put it
  // back. Without this a keyboard user is returned to the top of the document
  // after every single interaction.
  #keep() {
    const a = this.shadowRoot.activeElement;
    if (!a) return null;
    for (const k of ['pick', 'exclude', 'scope', 'pageall', 'search', 'fix', 'act', 'filter', 'only', 'key', 'page']) {
      if (a.dataset?.[k] !== undefined) return { attr: `[data-${k}${a.dataset[k] ? `="${a.dataset[k]}"` : ''}]`, sel: a.selectionStart };
    }
    if (a.id) return { attr: `#${a.id}`, sel: a.selectionStart };
    return null;
  }

  // Four transitions were declared in this stylesheet and none of them could ever
  // run: every render replaces the whole shadow tree, so the caret that should
  // rotate is a different element each time and starts at its final angle with
  // nothing to animate from. Motion here therefore cannot be CSS. The state that
  // should move is captured before the render and replayed onto the new nodes
  // after it — the only reason it works is that the pieces carry stable keys.
  #motionOn() {
    return this.getAttribute('theme') === 'designed'
      && !matchMedia('(prefers-reduced-motion: reduce)').matches
      && typeof Element.prototype.animate === 'function';
  }

  #keepMotion() {
    if (!this.#motionOn()) return null;
    const sr = this.shadowRoot, carets = new Map();
    // The distribution bar is NOT captured. It shows current state, which only
    // moves on a filter change or a commit — and both replace the whole screen,
    // so there is never a previous bar to move from. Animating it would have been
    // one more declaration that cannot fire, which is the fault this file already
    // has four of. The number that does change on every edit is the commitment.
    const btn = sr.querySelector('.apply');
    const applyCount = btn ? Number((btn.textContent.match(/[\d,]+/) || [''])[0].replace(/,/g, '')) : null;
    for (const c of sr.querySelectorAll('.lcaret,.ghead')) {
      const k = c.dataset.laneexp ?? c.dataset.key;
      if (k != null) carets.set(String(k), c.getAttribute('aria-expanded') === 'true');
    }
    // Open panels are kept as clones, with their geometry, so a panel that closes
    // can still be seen leaving. The real node will not survive the render.
    const details = new Map();
    for (const d of sr.querySelectorAll('.lane-detail:not(.ghost)')) {
      const row = d.previousElementSibling, k = row?.querySelector('.lcaret')?.dataset.laneexp;
      if (k == null) continue;
      const cs = getComputedStyle(d);
      details.set(String(k), { node: d.cloneNode(true), h: d.getBoundingClientRect().height,
                               pt: cs.paddingTop, pb: cs.paddingBottom,
                               op: row.querySelector('.lane-op')?.textContent ?? '' });
    }
    // The sentence and the shape of the list, so an added operation can be seen
    // to leave the sentence and land in the list.
    const laneCount = sr.querySelectorAll('.lane').length, hadLanes = !!sr.querySelector('.lanes');
    const sentEl = sr.querySelector('.sentence');
    const sentence = sentEl ? { node: sentEl.cloneNode(true) } : null;
    return { applyCount, carets, details, hadDetail: new Set(details.keys()), laneCount, hadLanes, sentence };
  }

  #playMotion(snap) {
    if (!snap) return;
    // Timing comes from the same tokens the stylesheet draws with. --be-ease is an
    // ease-out, which is what an arriving element wants; the hard-coded
    // ease-in-out this replaced spent the first 40ms of a 180ms rotate barely
    // moving, which read as a hitch.
    const sr = this.shadowRoot, cs = getComputedStyle(this);
    const ms = v => { const s = (cs.getPropertyValue(v) || '').trim(); const n = parseFloat(s);
                      return Number.isFinite(n) ? Math.round(/ms$/.test(s) ? n : n * 1000) : null; };
    const EASE = cs.getPropertyValue('--be-ease').trim() || 'cubic-bezier(.2,.7,.3,1)';
    const D1 = ms('--be-dur-1') ?? 180, D2 = ms('--be-dur-2') ?? 280;
    // One contained reveal for everything that grows in: the box is clipped for
    // the run and its padding grows with its height, so it truly starts empty.
    const grow = (el, dur) => {
      const ecs = getComputedStyle(el);
      const h = el.getBoundingClientRect().height, pt = ecs.paddingTop, pb = ecs.paddingBottom;
      el.style.overflow = 'hidden';
      const a = el.animate(
        [{ height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 },
         { height: `${h}px`, paddingTop: pt, paddingBottom: pb, opacity: 1 }],
        { duration: dur, easing: EASE });
      // The promise settles on finish or cancel, and settles even when the
      // document is hidden — the finish *event* waits for a frame that a hidden
      // tab never paints.
      const clear = () => { el.style.overflow = ''; };
      a.finished.then(clear, clear);
      return a;
    };

    // 1. The count on the commit button travels to its new value rather than
    //    being swapped for it. This is the story of the change: you moved the
    //    value, and you can see how far the number moved with it. Deliberately
    //    not the summary line — that is an aria-live region, and rolling it would
    //    announce every intermediate number to a screen reader.
    const btn = sr.querySelector('.apply');
    if (btn && snap.applyCount != null) {
      const m = btn.textContent.match(/[\d,]+/);
      const to = m ? Number(m[0].replace(/,/g, '')) : null;
      // Skip when either end is 1: the label is singular there, and rolling the
      // digits alone would read "Apply to 47 host" for a quarter of a second.
      if (to != null && to !== snap.applyCount && to !== 1 && snap.applyCount !== 1)
        this.#rollCount(btn, snap.applyCount, to);
    }

    // 2. The chevron rotates instead of jumping. animate() reaches ::before, which
    //    is the only way to touch it now that the element itself is new.
    for (const c of sr.querySelectorAll('.lcaret,.ghead')) {
      const k = c.dataset.laneexp ?? c.dataset.key;
      const now = c.getAttribute('aria-expanded') === 'true';
      const was = snap.carets.get(String(k));
      if (was === undefined || was === now) continue;
      const dot = c.querySelector('.caret');
      if (!dot) continue;
      dot.animate([{ transform: `rotate(${was ? 45 : -45}deg)` }, { transform: `rotate(${now ? 45 : -45}deg)` }],
                  { duration: D1, easing: EASE, pseudoElement: '::before' });
    }

    // 3. A panel that just opened grows from nothing, so the rows below are seen
    //    to move rather than found somewhere new.
    for (const d of sr.querySelectorAll('.lane-detail:not(.ghost)')) {
      const k = d.previousElementSibling?.querySelector('.lcaret')?.dataset.laneexp;
      if (snap.hadDetail.has(k)) continue;
      sr.querySelector(`.lane-detail.ghost[data-ghost="${k}"]`)?.remove();
      grow(d, D2);
    }

    // 4. A panel that just closed shrinks to nothing rather than vanishing, so the
    //    rows below are seen to move up. The real node is already gone — every
    //    render replaces the tree — so a clone of it stands in, animates to zero,
    //    and is removed. State never lies: it says closed; the ghost is only paint.
    //    Exits run at D1, faster than the D2 entrance, and finish with the caret.
    const openNow = new Set([...sr.querySelectorAll('.lane-detail:not(.ghost)')].map(d =>
      d.previousElementSibling?.querySelector('.lcaret')?.dataset.laneexp));
    for (const [k, g] of snap.details ?? []) {
      if (openNow.has(k)) continue;
      const lc = sr.querySelector(`.lcaret[data-laneexp="${k}"]`);
      const row = lc?.closest('.lane-row');
      // No ghost when the lane itself went away, when this index now holds a
      // different operation, or when the panel is still meant to be open.
      if (!row || lc.getAttribute('aria-expanded') !== 'false') continue;
      if ((row.querySelector('.lane-op')?.textContent ?? '') !== g.op) continue;
      sr.querySelector(`.lane-detail.ghost[data-ghost="${k}"]`)?.remove();
      const ghost = g.node;
      ghost.classList.add('ghost'); ghost.dataset.ghost = k;
      ghost.setAttribute('aria-hidden', 'true'); ghost.setAttribute('inert', '');
      ghost.style.pointerEvents = 'none'; ghost.style.overflow = 'hidden';
      row.insertAdjacentElement('afterend', ghost);
      const collapse = ghost.animate(
        [{ height: `${g.h}px`, paddingTop: g.pt, paddingBottom: g.pb, opacity: 1 },
         { height: '0px', paddingTop: '0px', paddingBottom: '0px', opacity: 0 }],
        { duration: D1, easing: EASE });
      const gone = () => ghost.remove();
      collapse.finished.then(gone, gone);
    }

    // 5. Adding an operation. The sentence just finished drops out of the way and
    //    the fresh one eases in over it; below, the list gains a row that grows in
    //    rather than appearing — or the whole list does, the first time — so the
    //    operation that was being edited is seen to land there. Only on an add:
    //    choosing an existing row to edit swaps the sentence instantly.
    const lanesNow = sr.querySelectorAll('.lane').length;
    if (snap.sentence && lanesNow > snap.laneCount) {
      const row = sr.querySelector('.row'), sent = sr.querySelector('.sentence');
      if (row && sent) {
        const prevPos = row.style.position;
        row.style.position = 'relative';                  // before reading offsets
        const ghost = snap.sentence.node;
        ghost.classList.add('ghost');
        ghost.setAttribute('aria-hidden', 'true'); ghost.setAttribute('inert', '');
        Object.assign(ghost.style, { position: 'absolute', left: `${sent.offsetLeft}px`, top: `${sent.offsetTop}px`,
                                     width: `${sent.offsetWidth}px`, margin: '0', pointerEvents: 'none' });
        row.appendChild(ghost);
        const canMove = getComputedStyle(sent).display !== 'inline';
        const out = ghost.animate(
          canMove ? [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(6px)' }]
                  : [{ opacity: 1 }, { opacity: 0 }],
          { duration: D1, easing: EASE });
        const done = () => { ghost.remove(); row.style.position = prevPos; };
        out.finished.then(done, done);
        sent.animate(
          canMove ? [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'translateY(0)' }]
                  : [{ opacity: 0 }, { opacity: 1 }],
          { duration: D1, delay: 60, easing: EASE, fill: 'backwards' });
      }
      const lanes = sr.querySelector('.lanes');
      if (lanes && !snap.hadLanes) grow(lanes, D2);
      else if (lanes) { const last = lanes.querySelector('.lane:last-child'); if (last) grow(last, D2); }
    }
  }

  // Rewrites only the digits inside the label, so the surrounding words and the
  // singular/plural the model chose are left exactly as rendered.
  #rollCount(btn, from, to) {
    const tpl = btn.textContent, D = 260, t0 = performance.now();
    const paint = v => { btn.textContent = tpl.replace(/[\d,]+/, v.toLocaleString()); };
    const step = now => {
      const k = Math.min(1, (now - t0) / D);
      const eased = 1 - Math.pow(1 - k, 3);
      paint(Math.round(from + (to - from) * eased));
      if (k < 1) requestAnimationFrame(step); else paint(to);
    };
    requestAnimationFrame(step);
  }

  #restore(mark) {
    if (!mark) return;
    const el = this.shadowRoot.querySelector(mark.attr);
    if (!el) return;
    el.focus();
    if (mark.sel != null && el.setSelectionRange) { try { el.setSelectionRange(mark.sel, mark.sel); } catch {} }
  }

  #render(opts = {}) {
    const mark = this.#keep();
    const motion = this.#keepMotion();
    if (this.#phase.name === 'browsing') { this.#renderPicker(opts); return this.#restore(mark); }
    const { field, p, groups, current, batch, reduction } = this.#compute();
    const s = this.#state;
    const cur = this.#cur;
    const methods = methodsFor(field);
    const destructive = DESTRUCTIVE.has(cur.method);

    // Groups start open when the selection is small enough to just read. This is
    // seeded into the open set rather than inferred from it — inferring made the
    // first click on any group collapse all the others, because adding one key
    // made the set non-empty and switched the fallback off.
    const keys = groups.map(g => g.key).join('|');
    if (keys !== s.seededFor) {
      s.open = this.items.length <= 25 ? new Set(groups.map(g => g.key)) : new Set();
      s.seededFor = keys;          // groups changed, so any previous open state is stale
    }

    this.shadowRoot.innerHTML = `
      <style>${CSS}</style>
      <div class="backlink"><a data-act="reselect" aria-keyshortcuts="Escape" title="Escape">← Change selection</a> · ${this.selection.size} of ${this.all.length} hosts</div>
      <div class="bar">
        <div class="row">
          <span class="sentence">
            <select id="field" aria-label="Field to change">${this.fields.map(f =>
              `<option value="${f.key}" ${f.key === field.key ? 'selected' : ''}>${f.label ?? f.key}</option>`).join('')}</select>
            <span class="arrow" aria-hidden="true">→</span>
            <select id="method" aria-label="What to do">${methods.map(m =>
              `<option value="${m}" ${m === cur.method ? 'selected' : ''}>${METHOD_LABEL[m]}</option>`).join('')}</select>
            ${this.#operandHTML(field, cur.method, cur.operand)}
          </span>

          <button class="apply ${destructive ? 'destructive' : ''}" data-act="apply" ${(batch ? batch.counts.changing : p.counts.changing && !this.#needsValue(field, cur)) ? '' : 'disabled'}>
            Apply to ${(batch ? batch.counts.changing : p.counts.changing).toLocaleString()} host${(batch ? batch.counts.changing : p.counts.changing) === 1 ? '' : 's'}
          </button>
        </div>
        <div class="context">${this.#distHTML(current, field)}</div>
        <div class="summary" role="status" aria-live="polite">${batch ? this.#summaryHTML(batch) : this.#needsValue(field, cur) ? 'No value chosen yet.' : this.#summaryHTML(p)}</div>
        ${this.#editingHintHTML(batch)}
        ${destructive && p.counts.changing ? `<div class="warn">${METHOD_LABEL[cur.method]} discards values that are not shown anywhere else.</div>` : ''}
        ${this.#nextFreeField()
          ? `<button class="addop" type="button" data-act="addop"
               title="Start another operation. Existing ones stay until you remove them.">
               + Add another operation
             </button>`
          : `<div class="pickhint">Every field already has an operation. Change a method above to do something else, or remove one.</div>`}
      </div>

      ${this.#phaseHTML(p)}

      ${batch ? this.#lanesHTML(batch, reduction) : `
      <div class="label">Transition groups</div>
      ${this.#needsValue(field, cur) ? '<div class="empty">Choose a value to see what would change.</div>'
        : groups.length ? groups.map((g, i) => this.#groupHTML(g, field, i === 0, i === groups.length - 1)).join('')
        : '<div class="empty">Nothing selected.</div>'}`}
    `;

    this.#restore(mark);
    this.#playMotion(motion);
  }

  // With more than one operation the dropdowns are editing one row of a list, and
  // which row that is has to be said out loud — the highlight in the list alone
  // leaves it ambiguous which direction the editing runs.
  #editingHintHTML(batch) {
    if (!batch) return '';
    const s = this.#state;
    // Only promise the shortcut while it exists — at full coverage the line below
    // the button already says there is nothing left to add, and two hints that
    // disagree is the same fault this component is about.
    const more = this.#nextFreeField() ? ' Pick a field with no operation yet to start another.' : '';
    return `<div class="pickhint">Editing operation ${s.editing + 1} of ${s.ops.length}.${more}</div>`;
  }

  #needsValue(field, s) {
    if (s.method === 'clear' || field.type === 'boolean') return false;
    const v = s.operand;
    return Array.isArray(v) ? v.length === 0 : v === '' || v == null;
  }

  #renderPicker(opts = {}) {
    const rows = this.page;
    const chosen = rows.filter(i => this.selection.has(i.id)).length;
    const total = this.selection.size;
    const offscreen = total - chosen;

    this.shadowRoot.innerHTML = `
      <style>${CSS}</style>
      <div class="pick">
        <div class="top">
          ${['prod', 'staging', 'dev'].map(v =>
            `<button class="chip" data-filter="${v}" aria-pressed="${this.filter === v}">${v}</button>`).join('')}
          ${this.filter ? `<button class="chip" data-filter="">clear filter</button>` : ''}
          <button class="chip sel" data-only aria-pressed="${!!this.onlySelected}">Selected only</button>
          <span class="matchcount">${this.matching.length.toLocaleString()} hosts match</span>
        </div>

        ${total ? this.#stripHTML() : ''}

        <div class="rows"><table>
          <tr><th class="pad"><input type="checkbox" data-pageall aria-label="Select all ${this.page.length} rows on this page"
                ${this.page.length && this.page.every(i => this.selection.has(i.id)) ? 'checked' : ''}></th><th>Host</th><th>Environment</th><th>Tags</th><th>Monitoring</th><th>Retention</th></tr>
          ${this.page.map(i => {
            const on = this.selection.has(i.id);
            return `<tr class="${on ? 'on' : ''}">
              <td class="pad"><input type="checkbox" data-pick="${i.id}" ${on ? 'checked' : ''}
                    aria-label="Select ${i.hostname}"></td>
              <td>${i.hostname}</td><td>${i.environment}</td>
              <td class="tag">${fmt(i.tags)}</td><td>${fmt(i.monitoring)}</td><td>${i.retentionDays}d</td>
            </tr>`;
          }).join('')}
        </table></div>
        ${this.#footerHTML()}
      </div>`;

    // indeterminate is a property, not an attribute — it cannot be set in markup.
    // A partially selected page is its own state and must not read as "none".
    const head = this.shadowRoot.querySelector('[data-pageall]');
    if (head) {
      const on = this.page.filter(i => this.selection.has(i.id)).length;
      head.indeterminate = on > 0 && on < this.page.length;
    }
  }

  #footerHTML() {
    const n = this.matching.length, per = this.pageSize, pages = this.pageCount, cur = this.pageNo ?? 0;
    if (!n) return '';
    const from = cur * per + 1, to = Math.min(n, (cur + 1) * per);
    const onPage = this.page.filter(i => this.selection.has(i.id)).length;

    // a short window around the current page, so 31 pages does not render 31 buttons
    const win = new Set([0, pages - 1, cur - 1, cur, cur + 1].filter(i => i >= 0 && i < pages));
    const nums = [...win].sort((a, b) => a - b);
    const items = [];
    nums.forEach((i, k) => {
      if (k && i - nums[k - 1] > 1) items.push('<span class="gap">…</span>');
      items.push(`<button type="button" class="pnum" data-page="${i}" aria-current="${i === cur}"
        aria-label="Page ${i + 1} of ${pages}">${i + 1}</button>`);
    });

    return `<div class="foot">
      <span class="shows">Showing <b>${from.toLocaleString()}&ndash;${to.toLocaleString()}</b> of ${n.toLocaleString()}${this.filter ? ' matching' : ''}
        ${onPage ? `<span class="onpage">· ${onPage} selected on this page</span>` : ''}</span>
      ${pages > 1 ? `<nav class="pager" aria-label="Pagination">
        <button type="button" class="pnum" data-page="${Math.max(0, cur - 1)}" ${cur === 0 ? 'disabled' : ''} aria-label="Previous page">&lsaquo;</button>
        ${items.join('')}
        <button type="button" class="pnum" data-page="${Math.min(pages - 1, cur + 1)}" ${cur === pages - 1 ? 'disabled' : ''} aria-label="Next page">&rsaquo;</button>
      </nav>` : ''}
    </div>`;
  }

  #stripHTML() {
    const r = this.scopeReport;
    const page = this.page.length;
    const match = this.matching.length;
    const overLimit = match > BulkEdit.LIMIT;
    const label = r.mode === 'matching' ? 'All matching' : 'This page';

    // Notes are stacked rather than merged: each is a different fact about the
    // selection, and collapsing them into one sentence is how they get ignored.
    const notes = [];
    if (r.offPage > 0)     notes.push(`${r.offPage.toLocaleString()} not on this page`);
    if (r.removed > 0)     notes.push(`${r.removed.toLocaleString()} removed from the ${this.scope.count.toLocaleString()} you selected`);
    if (r.notMatching > 0) notes.push(`<span class="drift">${r.notMatching.toLocaleString()} no longer match the current filter</span>`);

    return `<div class="strip" role="status" aria-live="polite">
      <div class="strip-main">
        <span class="tick">✓</span>
        <b>${r.total.toLocaleString()}</b> host${r.total === 1 ? '' : 's'} selected
        <span class="scope-ctl">
          <span class="scope-lbl">Scope</span>
          <select data-scope aria-label="Scope">
            <option value="page" ${r.mode !== 'matching' ? 'selected' : ''}>This page (${page.toLocaleString()})</option>
            <option value="matching" ${r.mode === 'matching' ? 'selected' : ''} ${overLimit ? 'disabled' : ''}>
              ${overLimit
                ? `All ${match.toLocaleString()} matching — too many for bulk edit (limit ${BulkEdit.LIMIT.toLocaleString()})`
                : `All ${match.toLocaleString()} matching this filter`}
            </option>
          </select>
        </span>
        <button class="go-edit" data-act="edit">Bulk edit ${r.total.toLocaleString()} host${r.total === 1 ? '' : 's'} →</button>
      </div>
      ${notes.length ? `<div class="strip-note">${notes.join(' · ')}</div>` : ''}
      ${this.#fixesHTML(r)}
    </div>`;
  }

  // Reporting drift is not the same as resolving it. Each of these is a one-click
  // answer to the state the operator is actually in.
  #fixesHTML(r) {
    const fixes = [];
    if (r.notMatching > 0) {
      const now = this.matching.length;
      fixes.push(`<a data-fix="refilter">Reselect from current filter (${now.toLocaleString()})</a>`);
      fixes.push(`<a data-fix="keep">Keep this selection (${r.total.toLocaleString()})</a>`);
    }
    if (r.removed > 0 && r.mode === 'matching' && r.notMatching === 0) {
      fixes.push(`<a data-fix="restore">Reselect all ${this.scope.count.toLocaleString()}</a>`);
      fixes.push(`<a data-fix="page">Reduce to this page (${this.page.length.toLocaleString()})</a>`);
    }
    if (!fixes.length) return '';
    return `<div class="strip-fix">${fixes.join('<span class="sep">|</span>')}<span class="sep">|</span><a data-fix="clear">Clear selection</a></div>`;
  }

  #act(name) {
    if (name === 'edit')   { this.#phase = { name: 'editing' }; this.#state.seededFor = null; return this.#render(); }
    if (name === 'reselect') { this.#phase = { name: 'browsing' }; return this.#render(); }

    // Rows are never implicitly discarded. Several operations on one field are a
    // real case, not an accident — Add one tag and Remove another are both
    // load-bearing, and Decrease by 7 twice compounds. So this does not cap rows
    // per field; it only refuses to mint a row identical to one already there,
    // which is what produced three struck-through copies of the same operation.
    if (name === 'addop') {
      const s = this.#state;
      const f = this.#nextFreeField();
      if (!f) return;                       // the button is not rendered in this state
      const m = this.#freeMethodOn(f) ?? methodsFor(f)[0];
      s.ops = [...s.ops, { ...this.#newRow(f), method: m, operand: this.#defaultOperand(f, m), touched: true }];
      s.editing = s.ops.length - 1;
      s.open.clear(); s.showAll.clear(); s.query = {}; s.seededFor = null;
      s.openOps = new Set(); s.openSamples = new Set();
      return this.#render();
    }
    if (name.startsWith('rmop:')) {
      const i = Number(name.slice(5)), s = this.#state;
      if (s.ops.length <= 1) return;          // the picker always needs a row to edit
      s.ops = s.ops.filter((_, j) => j !== i);
      s.editing = Math.min(s.editing > i ? s.editing - 1 : s.editing, s.ops.length - 1);
      // both are keyed by position, and every position after i has just shifted
      s.openOps = new Set(); s.openSamples = new Set();
      s.seededFor = null;
      return this.#render();
    }

    const { p } = this.#compute();
    if (name === 'apply') {
      // clear is the one operation that leaves nothing behind, so it is the one
      // that earns a gate. Everything else is guarded by the diff you just read.
      if (this.#cur.method === 'clear') { this.#phase = { name: 'confirming', typed: '' }; return this.#render(); }
      return this.#commit(p);
    }
    if (name === 'confirm') return this.#commit(p);
    if (name === 'cancel')  { this.#phase = { name: 'editing' }; return this.#render(); }
    if (name === 'retry') {
      const failed = this.#phase.result.failed.map(r => r.id);
      this.#retryOnly = new Set(failed);
      return this.#commit(this.#compute().p, this.#retryOnly);
    }
    if (name === 'done')    { this.#phase = { name: 'editing' }; this.#retryOnly = null; return this.#render(); }
  }

  async #commit(p, only = null) {
    const scope = only ? p.changing.filter(r => only.has(r.id)) : p.changing;
    this.#phase = { name: 'committing', done: 0, total: scope.length };
    this.#render();

    // stand-in for whatever actually owns the data; the model does not do this
    for (let i = 0; i < scope.length; i++) {
      await new Promise(r => setTimeout(r, Math.min(14, 900 / Math.max(scope.length, 1))));
      this.#phase.done = i + 1;
      if (i % 7 === 0 || i === scope.length - 1) this.#render();
    }

    const failed = this.failSimulator ? this.failSimulator(scope) : [];
    const result = reconcile({ ...p, changing: scope, counts: { ...p.counts, changing: scope.length } }, failed);
    this.#phase = { name: 'done', result };
    this.#render();
  }

  #phaseHTML(p) {
    const ph = this.#phase;

    if (ph.name === 'confirming') {
      const n = p.counts.changing;
      const ok = ph.typed.trim().toLowerCase() === 'clear';
      return `<div class="sheet"><div class="card">
        <h3>Clear tags on ${n} host${n === 1 ? '' : 's'}</h3>
        <p>This removes every tag from these hosts. The values are not recorded anywhere else, and there is nothing to restore them from.</p>
        <div class="list">${p.changing.slice(0, 6).map(r => `${r.item.hostname} — ${fmt(r.before)}`).join('<br>')}${n > 6 ? `<br>… and ${n - 6} more` : ''}</div>
        <div class="confirm"><label>Type <b>clear</b> to continue</label>
          <input data-typed type="text" value="${ph.typed}" placeholder="clear"></div>
        <div class="acts">
          <button data-act="cancel">Cancel</button>
          <button class="go" data-act="confirm" ${ok ? '' : 'disabled'}>Clear ${n} host${n === 1 ? '' : 's'}</button>
        </div>
      </div></div>`;
    }

    if (ph.name === 'committing') {
      const pct = ph.total ? Math.round(ph.done / ph.total * 100) : 100;
      return `<div class="progress">
        <b>Applying to ${ph.total} host${ph.total === 1 ? '' : 's'}…</b>
        <div class="track"><div class="fill" style="width:${pct}%"></div></div>
        <div style="font-size:var(--be-t-md);color:var(--be-muted)">${ph.done} of ${ph.total} · do not close this</div>
      </div>`;
    }

    if (ph.name === 'done') {
      const r = ph.result, bad = !r.complete;
      return `<div class="result ${bad ? 'bad' : ''}">
        <h3>${describeResult(r)}</h3>
        ${bad ? `<p style="margin:0;font-size:var(--be-t-lg);color:var(--be-body)">The ${r.counts.succeeded} that succeeded are done and will not be touched again. A retry applies only to the ${r.counts.failed} below.</p>
          <table class="fails">${r.failed.slice(0, 5).map(x =>
            `<tr><td>${x.item.hostname}</td><td class="before">${fmt(x.before)} → ${fmt(x.after)}</td><td class="why">timed out</td></tr>`).join('')}
            ${r.counts.failed > 5 ? `<tr><td colspan="3" style="color:var(--be-faint)">… and ${r.counts.failed - 5} more</td></tr>` : ''}</table>` : ''}
        <div class="acts">
          ${bad ? `<button data-act="retry">Retry ${r.counts.failed} failed</button>` : ''}
          <button class="ghost" data-act="done">${bad ? 'Leave them' : 'Done'}</button>
        </div>
      </div>`;
    }
    return '';
  }

  #summaryHTML(p) {
    const { changing, excluded, unchanged } = p.counts;
    // describe() owns the wording; this only decides what to embolden
    return describe(p)
      .replace(String(changing) + ' will change', `<b>${changing}</b> will change`)
      .replace(String(excluded) + ' excluded', `<b>${excluded}</b> excluded`)
      .replace(String(unchanged) + ' already match', `${unchanged} already match`);
  }

  #distHTML(current, field) {
    const total = this.items.length;
    if (!total) return '';

    // A multi-value field is not a distribution. One host can carry several tags,
    // so the counts do not sum to the selection — stacking them implies a whole
    // that does not exist, and they summed to 192% when they were stacked here.
    // What matters before the operation is how many already hold the value you
    // are about to apply.
    if (field.type === 'multi-value') {
      const ops = Array.isArray(this.#cur.operand) ? this.#cur.operand : [];
      if (!ops.length) return '';
      const pres = current.presence ?? [];
      // one bar per value, because each is its own 0–100% question and they do
      // not compose into a whole
      return `<div class="dist multi-dist">
        <div class="cap">Currently</div>
        ${ops.map((v, i) => {
          const have = pres.find(x => x.value === v)?.count ?? 0;
          return `<span class="mini">
            <span class="track"><span class="seg" data-k="m:${v}" style="flex:${have};background:${paletteFor(field)[i % 6]}"></span
              ><span class="seg rest" data-k="m:${v}:rest" style="flex:${total - have}"></span></span>
            <span class="mlab"><b>${have.toLocaleString()}</b> of ${total.toLocaleString()} have ${v}</span>
          </span>`;
        }).join('')}
      </div>`;
    }

    const vals = current.values ?? [];
    if (!vals.length) return '';

    // Cap the segments so the palette stays unambiguous and the legend stays one
    // line. Six distinct colours cycled across ten segments made two values share
    // a swatch, which is worse than not showing them separately at all.
    const MAX = 5;
    const head = vals.slice(0, MAX);
    const tailCount = vals.slice(MAX).reduce((n, v) => n + v.count, 0);
    const shown = vals.length > MAX
      ? [...head, { value: `${vals.length - MAX} other${vals.length - MAX === 1 ? '' : 's'}`, count: tailCount, other: true }]
      : vals;

    const pal = paletteFor(field);
    const colour = (v, i) => v.other ? 'var(--be-control)' : pal[i % pal.length];
    const lbl = v => v.other || !field.unit ? fmt(v.value) : `${fmt(v.value)}${field.unit}`;
    return `<div class="dist">
      <div class="cap">Currently</div>
      <div class="track">${shown.map((v, i) =>
        `<span class="seg" data-k="${fmt(v.value)}" style="flex:${v.count};background:${colour(v, i)}" title="${fmt(v.value)} ${v.count}"></span>`).join('')}</div>
      <div class="keys">${shown.map((v, i) =>
        `<span title="${lbl(v)} — ${v.count.toLocaleString()} of ${total.toLocaleString()} (${Math.round(v.count / total * 100)}%)"
          ><i style="background:${colour(v, i)}"></i>${lbl(v)} <b>${v.count.toLocaleString()}</b></span>`).join('')}</div>
    </div>`;
  }

  #operandHTML(field, method, operand) {
    if (method === 'clear' || field.type === 'boolean') return '';
    if (field.type === 'number')
      return `<span class="arrow" aria-hidden="true">→</span><input id="operand" type="text" inputmode="numeric" aria-label="Value"
                value="${operand ?? ''}" size="4" style="min-width:0;width:auto">${field.unit ? `<span class="unit">${field.unit}</span>` : ''}`;

    const opts = field.options ?? [...new Set(this.items.flatMap(i => [].concat(i[field.key] ?? [])))].sort();

    // A multi-value field takes a set, not a value. plan() and groupByTransition
    // have always accepted several — offering one at a time was the interface
    // under-serving the model.
    if (field.type === 'multi-value') {
      const chosen = Array.isArray(operand) ? operand : [];
      const open = this.#state.pickerOpen;
      return `<span class="arrow" aria-hidden="true">→</span>
        <span class="multi">
          <button type="button" class="multi-btn" data-multi aria-expanded="${!!open}" aria-haspopup="true">
            ${chosen.length
              ? chosen.map(v => `<span class="vchip">${v}</span>`).join('')
              : '<span class="ph">Choose values…</span>'}
            <span class="caret" aria-hidden="true"></span>
          </button>
          ${open ? `<div class="multi-menu" role="group" aria-label="Values">
            ${opts.map(o => `<label class="mrow"><input type="checkbox" data-val="${o}"
                ${chosen.includes(String(o)) ? 'checked' : ''}> ${o}</label>`).join('')}
          </div>` : ''}
        </span>`;
    }

    const val = Array.isArray(operand) ? operand[0] ?? '' : operand ?? '';

    // A select with no option selected still *displays* its first option, so an
    // empty state read as a configured one: after banking an operation the state
    // held '' while the control said "prod". That is the field and its value
    // disagreeing about what is true — the exact fault this component exists to
    // prevent. The placeholder makes "no value yet" something the control can say.
    return `<span class="arrow" aria-hidden="true">→</span><select id="operand" aria-label="Value">
      ${val === '' ? '<option value="" selected>Choose a value…</option>' : ''}
      ${opts.map(o => `<option value="${o}" ${String(o) === String(val) ? 'selected' : ''}>${o}</option>`).join('')}
    </select>`;
  }


  // The multi-operation surface. Direction B out of four evaluated: one lane per
  // operation, all of them on screen at once. The evaluator's reason for it over
  // a tabbed view — "a dead operation you must click a tab to discover is one you
  // will not discover" — is the whole argument for the shape.
  //
  // Every number and every sentence here comes from planBatch()/describeBatch().
  // Nothing on this surface decides whether an operation is redundant.
  // An operation in a sequence cannot be previewed in isolation — by the time
  // step 3 runs, steps 1 and 2 have already moved rows. planBatch() runs the
  // pipeline and keeps a per-row trail, so steps[i] is what this operation
  // actually did at its own position. Recomputing it from the original values
  // would be the faster lie.
  #laneDetailHTML(batch, i) {
    const o = batch.ops[i];
    const rows = batch.rows.filter(r => !r.excluded && r.steps[i]);
    const buckets = new Map();
    for (const r of rows) {
      const st = r.steps[i];
      const key = st.moved ? `m\u0000${fmt(st.before)}\u0000${fmt(st.after)}` : 'same';
      if (!buckets.has(key)) buckets.set(key, { moved: st.moved, before: st.before, after: st.after, rows: [] });
      buckets.get(key).rows.push(r);
    }
    const undoneBy = (o.supersededBy ?? [])
      .map(j => `${j + 1} ${phraseOp(batch.ops[j])}`).join(' and ');

    const order = [...buckets.values()].sort((a, b) => (b.moved - a.moved) || (b.rows.length - a.rows.length));
    // Deliberately not a third level of disclosure. The single-operation groups
    // expand to host rows carrying exclusion checkboxes, and those cannot come
    // here: `excluded` is one batch-wide set, so unticking a host inside
    // operation 1 would drop it from every operation while appearing not to.
    // What is safe to bring across is reading the names, so the "+67 more" that
    // already looked like an affordance becomes one, expanding in place.
    const line = (b, bi) => {
      const key = `${i}:${bi}`;
      const open = this.#state.openSamples.has(key);
      const all = b.rows.map(r => r.item.hostname ?? r.id);
      const shown = (open ? all : all.slice(0, 3)).join(', ');
      const toggle = all.length > 3
        ? ` <button class="ld-more" type="button" data-sample="${key}"
             aria-expanded="${open}">${open ? 'show fewer' : `+${(all.length - 3).toLocaleString()} more`}</button>`
        : '';
      return `<div class="ld-row${b.moved ? '' : ' quiet'}">
        <span class="ld-t">${b.moved
          ? `${fmt(b.before)} <span class="ld-arrow" aria-hidden="true">&rarr;</span> ${fmt(b.after)}`
          : 'already match'}</span>
        <span class="ld-n">${b.rows.length.toLocaleString()}</span>
        <span class="ld-s-wrap${open ? ' open' : ''}"><span class="ld-s">${shown}</span>${toggle}</span>
        ${b.moved && o.dead && undoneBy ? `<span class="ld-undo">undone by ${undoneBy}</span>` : ''}
      </div>`;
    };
    return `<div class="lane-detail">
      <div class="ld-head">At step ${i + 1}${i > 0 ? ', after the operations above it' : ''}</div>
      ${order.map((b, bi) => line(b, bi)).join('')}
    </div>`;
  }

  #lanesHTML(batch, reduction) {
    const noteFor = i => (reduction?.notes ?? []).find(n => n.index === i);

    const lanes = batch.ops.map(o => {
      const note = noteFor(o.index);
      const moved = o.total - o.alreadyMatched;
      // A live operation still reports its own no-ops: "47 already match" is the
      // same honesty the single-operation view gives, kept at operation level.
      const live = o.alreadyMatched
        ? `${moved.toLocaleString()} change &middot; ${o.alreadyMatched.toLocaleString()} already match`
        : `${moved.toLocaleString()} change`;
      // Each count is what the operation does at its own position, not its net
      // contribution: step 3 can move 200 rows because step 2 turned 61 of them on,
      // while the batch as a whole changes 199. That framing used to sit on every
      // row as "at step 3" — restating the number already printed at its left. It
      // is said once now, over the list.
      const open = this.#state.openOps.has(o.index);
      return `
        <div class="lane ${o.dead ? 'dead' : ''} ${o.index === this.#state.editing ? 'editing' : ''}">
          <div class="lane-row">
            <button class="lcaret" type="button" data-laneexp="${o.index}" aria-expanded="${open}"
                    aria-label="${open ? 'Hide' : 'Show'} what operation ${o.index + 1} does"><span class="caret" aria-hidden="true"></span></button>
            <button class="lhead" type="button" data-lane="${o.index}"
                    aria-pressed="${o.index === this.#state.editing}"
                    aria-label="Edit operation ${o.index + 1}">
              <span class="lane-n">${o.index + 1}</span>
              <span class="lane-body">
                <span class="lane-op">${phraseOp(o)}</span>${o.index === this.#state.editing ? '<span class="lane-edit">editing</span>' : ''}
                <span class="lane-note">${note ? note.text.replace(/^.*?changes nothing (&mdash;|—) /, 'Changes nothing — ') : live}</span>
              </span>
            </button>
            <button class="lane-x" type="button" data-act="rmop:${o.index}"
                    aria-label="Remove operation ${o.index + 1}: ${phraseOp(o)}">&times;</button>
          </div>
          ${open ? this.#laneDetailHTML(batch, o.index) : ''}
        </div>`;
    }).join('');

    // The reduction is offered, never enforced. Nothing is blocked and no ordering
    // is chosen for the operator — it is the same batch said in fewer words.
    const equiv = reduction?.reducible
      ? `<div class="equiv" role="status" aria-live="polite">Same as: <b>${reduction.equivalent}</b></div>`
      : '';

    return `
      <div class="label">Operations &middot; ${batch.ops.length}<span class="label-note">counts are per step, in order</span></div>
      <div class="lanes">${lanes}</div>
      ${equiv}`;
  }

  #groupHTML(g, field, isFirst = false, isLast = false) {
    const s = this.#state;
    const open = s.open.has(g.key);
    const quiet = g.kind === 'unchanged';
    const q = (s.query[g.key] ?? '').toLowerCase();

    let rows = g.rows;
    if (q) rows = rows.filter(r => String(r.item.hostname ?? r.id).toLowerCase().includes(q));
    const showingAll = s.showAll.has(g.key) || q;
    const kept = rows.filter(r => r.state !== 'excluded');
    const skipped = rows.filter(r => r.state === 'excluded');
    const visible = showingAll ? kept : kept.slice(0, 5);
    const hidden = kept.length - visible.length;

    return `<div class="group${quiet ? ' quiet' : ''}${g.kind === 'clamped' ? ' clamped' : ''}${isFirst ? ' first' : ''}${isLast ? ' last' : ''}">
      <button class="ghead" type="button" data-key="${g.key}" aria-expanded="${open}">
        <span class="caret" aria-hidden="true"></span>
        <span class="name">${g.label}</span>${g.kind === 'clamped' ? `<span class="mark" aria-hidden="true"><i class="shaft" style="width:${Math.round((g.changing / Math.max(1, this.items.length)) * 1000) / 10}%"></i></span>` : ''}
        <span class="pill">${quiet ? `${g.total} will not change` : `${g.changing} will change`}</span>
        ${g.excluded ? `<span class="exc">· ${g.excluded} excluded</span>` : ''}
      </button>
      ${open ? `<div class="gbody">
        ${g.total > 5 ? `<input class="search" type="text" data-search="${g.key}" value="${s.query[g.key] ?? ''}" placeholder="Search within this group…">` : ''}
        ${visible.length ? `<table>
          <tr><th></th><th>Host</th><th>Current</th><th></th><th>Proposed</th><th>Tags</th></tr>
          ${visible.map(r => this.#rowHTML(r, field, quiet)).join('')}
        </table>` : '<div class="empty">No hosts match that search.</div>'}
        ${hidden > 0 ? `<div class="more"><a data-showall="${g.key}">Show all ${kept.length} rows ↓</a> · ${hidden} more in this group</div>` : ''}
        ${skipped.length ? `<div class="subhead">Excluded from this operation · ${skipped.length}</div>
          <table>${skipped.map(r => this.#rowHTML(r, field, quiet)).join('')}</table>` : ''}
      </div>` : ''}
    </div>`;
  }

  #rowHTML(r, field, quiet) {
    const on = r.state !== 'excluded';
    return `<tr class="${on ? '' : 'skipped'}">
      <td><input type="checkbox" data-exclude="${r.id}" ${on ? 'checked' : ''}
            aria-label="${on ? 'Exclude' : 'Include'} ${r.item.hostname ?? r.id}"></td>
      <td>${r.item.hostname ?? r.id}</td>
      <td class="before">${fmt(r.before)}</td>
      <td class="arrow">${quiet ? '' : '→'}</td>
      <td class="after">${quiet ? '' : fmt(r.after)}</td>
      <td class="tag">${fmt(r.item.tags ?? '')}</td>
    </tr>`;
  }
}

const fmt = v => Array.isArray(v) ? (v.length ? v.join(', ') : 'none')
               : typeof v === 'boolean' ? (v ? 'on' : 'off') : String(v ?? '');

// guard re-registration so a cache-busted reimport during development fails
// loudly at the import rather than silently keeping the old class alive
if (!customElements.get('bulk-edit')) customElements.define('bulk-edit', BulkEdit);
