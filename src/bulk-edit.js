// <bulk-edit> — the interface, at wireframe fidelity.
//
// Every number on screen comes from model.js. Nothing here counts anything,
// decides what is legal, or works out what would change. If a count is wrong,
// the model is wrong — there is no second place for it to go wrong.

import { summarise, methodsFor, METHOD_LABEL, DESTRUCTIVE, plan, describe, groupByTransition,
         reconcile, retryScope, describeResult } from './model.js?v=1787247806';

const CSS = `
:host { display:block; font:14px/1.5 ui-sans-serif, system-ui, sans-serif; color:#1a1a1a; }
* { box-sizing:border-box; }
button, input, select { font:inherit; color:inherit; }

.bar { border:1px solid #d4d4d4; background:#fff; padding:14px 16px; }
.row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
select, input[type=text] { border:1px solid #b8b8b8; background:#fff; padding:6px 9px; min-width:130px; }
.arrow { color:#999; }

.dist { display:flex; flex-direction:column; gap:4px; width:270px; height:72px; flex:0 0 auto; }
.dist .track { display:flex; width:100%; height:9px; border:1px solid #c8c8c8; overflow:hidden; }
.dist .seg { min-width:3px; }
.dist .seg.rest { background:repeating-linear-gradient(45deg,#f0f0f0,#f0f0f0 3px,#e6e6e6 3px,#e6e6e6 6px); min-width:0; }
.dist .keys { display:flex; gap:4px 10px; flex-wrap:wrap; align-content:flex-start; font-size:11px; line-height:1.4; color:#666; flex:1; overflow:hidden; }
.dist .keys b { color:#1a1a1a; font-weight:600; }
.dist .keys i { font-style:normal; display:inline-block; width:7px; height:7px; margin-right:4px; border:1px solid #0003; }
.dist .cap { font-size:11px; color:#777; }

.apply { margin-left:auto; border:1px solid #1a1a1a; background:#1a1a1a; color:#fff; padding:8px 15px; cursor:pointer; }
.apply[disabled] { background:#fff; color:#999; border-color:#ccc; cursor:default; }
.apply.destructive { background:#8a2318; border-color:#8a2318; }

.summary { margin-top:9px; font-size:13px; color:#444; }
.summary b { color:#1a1a1a; }
.warn { margin-top:8px; font-size:12px; border-left:3px solid #8a2318; padding:5px 9px; color:#8a2318; background:#fbf2f0; }
.addop { margin-top:7px; font-size:12.5px; color:#666; background:none; border:0; padding:0; cursor:pointer; font-family:inherit; }
.ghead { width:100%; text-align:left; background:none; border:0; font:inherit; }
.ghead:focus-visible, .chip:focus-visible, .go-edit:focus-visible, .apply:focus-visible,
input:focus-visible, select:focus-visible, .strip-fix a:focus-visible { outline:2px solid #1a5fb4; outline-offset:1px; }

.label { font-size:10.5px; letter-spacing:.09em; text-transform:uppercase; color:#888; margin:20px 0 7px; }

.group { border:1px solid #d4d4d4; background:#fff; margin-bottom:9px; }
.group.quiet { background:#fafafa; border-color:#e4e4e4; }
.ghead { display:flex; align-items:center; gap:10px; padding:11px 14px; cursor:pointer; user-select:none; }
.ghead .caret { width:9px; color:#999; font-size:10px; }
.ghead .name { font-weight:600; }
.group.quiet .ghead .name { font-weight:400; color:#888; }
.pill { font-size:11.5px; background:#eef; border:1px solid #dde; padding:1px 8px; }
.group.quiet .pill { background:#f0f0f0; border-color:#e4e4e4; color:#888; }
.exc { font-size:11.5px; color:#999; }
.gbody { border-top:1px solid #ececec; padding:11px 14px 13px; }

.search { width:250px; margin-bottom:10px; }
table { width:100%; border-collapse:collapse; font-size:13px; }
th { text-align:left; font-size:10px; letter-spacing:.07em; text-transform:uppercase; color:#999; font-weight:400; padding:0 8px 6px 0; }
td { padding:5px 8px 5px 0; border-top:1px solid #f2f2f2; }
tr.skipped td { color:#aaa; }
tr.skipped .after { color:#aaa; font-weight:400; }
.before { color:#888; }
.after { font-weight:600; }
.tag { font-size:11px; color:#999; }
.more { margin-top:9px; font-size:12.5px; color:#666; }
.more a { color:#1a5fb4; cursor:pointer; text-decoration:none; }
.subhead { font-size:10px; letter-spacing:.07em; text-transform:uppercase; color:#aaa; padding:12px 0 2px; }
.empty { color:#999; font-size:13px; padding:6px 0; }

.pick { border:1px solid #d4d4d4; background:#fff; }
.pick .top { display:flex; align-items:center; gap:9px; flex-wrap:wrap; padding:12px 14px; border-bottom:1px solid #ececec; }
.chip { font-size:12.5px; border:1px solid #c8c8c8; background:#fff; padding:4px 11px; cursor:pointer; }
.chip[aria-pressed=true] { background:#1a1a1a; color:#fff; border-color:#1a1a1a; }
.chip.sel { margin-left:6px; }
.matchcount { margin-left:auto; font-size:12.5px; color:#777; }
.strip { border-bottom:1px solid #ececec; background:#f7f9fd; }
.strip-main { display:flex; align-items:center; gap:12px; padding:10px 14px; font-size:13.5px; }
.strip-main .tick { color:#2f6b3f; }
.strip-main b { font-weight:600; }
.scope-ctl { display:flex; align-items:center; gap:7px; margin-left:6px; }
.scope-lbl { font-size:10.5px; letter-spacing:.09em; text-transform:uppercase; color:#888; }
.scope-ctl select { border:1px solid #b8b8b8; background:#fff; padding:5px 8px; font-size:13px; max-width:330px; }
.strip .go-edit { margin-left:auto; }
.strip-note { padding:0 14px 10px 32px; font-size:12.5px; color:#777; }
.strip-note .drift { color:#8a5a18; }
.strip-fix { padding:0 14px 11px 32px; font-size:12.5px; display:flex; gap:10px; align-items:center; flex-wrap:wrap; }
.strip-fix a { color:#1a5fb4; cursor:pointer; text-decoration:none; }
.strip-fix a:hover { text-decoration:underline; }
.strip-fix .sep { color:#ccc; }
.go-edit { border:1px solid #1a1a1a; background:#1a1a1a; color:#fff; padding:7px 14px; cursor:pointer; }
.go-edit[disabled] { background:#fff; color:#aaa; border-color:#ddd; cursor:default; }
.pick .rows { max-height:380px; overflow:auto; }
.pick table { width:100%; }
.pick th { position:sticky; top:0; background:#fff; box-shadow:0 1px 0 #ececec; padding:8px 10px 7px 0; }
.pick td { padding:6px 10px 6px 0; }
.pick tr.on td { background:#f7f9fd; }
.pick .pad { padding-left:14px; }
.foot { display:flex; align-items:center; gap:12px; padding:10px 14px; border-top:1px solid #ececec; font-size:12.5px; color:#666; flex-wrap:wrap; }
.foot .shows b { color:#1a1a1a; }
.foot .onpage { color:#888; }
.pager { margin-left:auto; display:flex; gap:3px; align-items:center; }
.pnum { font:inherit; font-size:12.5px; border:1px solid transparent; background:none; color:#1a5fb4; padding:3px 8px; cursor:pointer; }
.pnum[aria-current=true] { border-color:#c8c8c8; background:#fff; color:#1a1a1a; font-weight:600; }
.pnum[disabled] { color:#ccc; cursor:default; }
.pager .gap { color:#bbb; padding:0 2px; }
.slot { border:1px dashed #c0c0c0; background:#fafafa; color:#888; font-size:12.5px; padding:8px 11px; margin:10px 14px 12px; }
.backlink { font-size:12.5px; color:#666; margin-bottom:10px; }
.backlink a { color:#1a5fb4; cursor:pointer; text-decoration:none; }

.sheet { position:fixed; inset:0; background:#0006; display:flex; align-items:center; justify-content:center; padding:24px; }
.card { background:#fff; border:1px solid #1a1a1a; max-width:520px; width:100%; padding:20px 22px; }
.card h3 { margin:0 0 9px; font-size:15px; }
.card p { margin:0 0 11px; font-size:13.5px; color:#444; }
.card .list { font-size:12.5px; color:#666; background:#f6f6f6; border:1px solid #eee; padding:8px 10px; margin-bottom:13px; max-height:120px; overflow:auto; }
.card .acts { display:flex; gap:9px; justify-content:flex-end; }
.card button { border:1px solid #b8b8b8; background:#fff; padding:7px 14px; cursor:pointer; }
.card button.go { background:#8a2318; border-color:#8a2318; color:#fff; }
.card button.go[disabled] { background:#fff; color:#bbb; border-color:#ddd; cursor:default; }
.confirm { display:flex; gap:7px; align-items:center; font-size:13px; margin-bottom:14px; }
.confirm input { width:150px; border:1px solid #b8b8b8; padding:5px 8px; }

.progress { border:1px solid #d4d4d4; background:#fff; padding:16px; }
.progress .track { height:6px; background:#eee; margin:10px 0 8px; }
.progress .fill { height:6px; background:#1a1a1a; transition:width .18s linear; }

.result { border:1px solid #d4d4d4; background:#fff; padding:16px; }
.result.bad { border-color:#8a2318; }
.result h3 { margin:0 0 6px; font-size:14px; }
.result .acts { margin-top:13px; display:flex; gap:9px; }
.result .acts button { border:1px solid #1a1a1a; background:#1a1a1a; color:#fff; padding:7px 14px; cursor:pointer; }
.result .acts button.ghost { background:#fff; color:#1a1a1a; }
.fails { margin-top:11px; font-size:13px; }
.fails tr td { border-top:1px solid #f2f2f2; padding:5px 8px 5px 0; }
.fails .why { color:#8a2318; font-size:12px; }
`;

const COLORS = ['#5b7cc4', '#d9a441', '#9aa0a6', '#6aa06a', '#a06a9a', '#c46a5b'];

export class BulkEdit extends HTMLElement {
  #state = { fieldKey: null, method: null, operand: null, excluded: new Set(), open: new Set(), showAll: new Set(), query: {} };
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
  static PAGE = 60;          // rows rendered at once

  // Three different sets, and the whole scope problem is people conflating them:
  //   matching — everything the current filter matches
  //   page     — the slice of that actually rendered
  //   selection— what an operation will act on
  get pageCount() { return Math.max(1, Math.ceil(this.matching.length / BulkEdit.PAGE)); }
  get page() {
    const start = (this.pageNo ?? 0) * BulkEdit.PAGE;
    return this.matching.slice(start, start + BulkEdit.PAGE);
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
    this.#state = {
      fieldKey: f.key, method: methodsFor(f)[0], operand: this.#defaultOperand(f, methodsFor(f)[0]),
      excluded: new Set(), open: new Set(), showAll: new Set(), query: {}, seededFor: null,
    };
    this.#phase = { name: 'browsing' };
  }

  get #field() { return this.fields.find(f => f.key === this.#state.fieldKey); }

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
    const field = this.#field, { method, operand, excluded } = this.#state;
    const p = plan(this.items, field, method, operand, excluded);
    return { field, p, groups: groupByTransition(p, field, method, operand), current: summarise(this.items, field) };
  }

  connectedCallback() {
    if (!this.shadowRoot) this.attachShadow({ mode: 'open' });
    this.shadowRoot.addEventListener('click', e => this.#onClick(e));
    this.shadowRoot.addEventListener('change', e => this.#onChange(e));
    this.shadowRoot.addEventListener('input', e => this.#onInput(e));
    if (this.items) this.#render();
  }

  #onChange(e) {
    const t = e.target, s = this.#state;
    if (t.id === 'field') {
      const f = this.fields.find(x => x.key === t.value);
      s.fieldKey = f.key; s.method = methodsFor(f)[0]; s.operand = this.#defaultOperand(f, s.method);
      s.open.clear(); s.showAll.clear(); s.query = {}; s.seededFor = null;
    } else if (t.id === 'method') {
      s.method = t.value; s.operand = this.#defaultOperand(this.#field, t.value);
    } else if (t.id === 'operand') {
      s.operand = this.#field.type === 'number' ? Number(t.value)
                : this.#field.type === 'multi-value' ? (t.value ? [t.value] : [])
                : t.value;
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

  #restore(mark) {
    if (!mark) return;
    const el = this.shadowRoot.querySelector(mark.attr);
    if (!el) return;
    el.focus();
    if (mark.sel != null && el.setSelectionRange) { try { el.setSelectionRange(mark.sel, mark.sel); } catch {} }
  }

  #render(opts = {}) {
    const mark = this.#keep();
    if (this.#phase.name === 'browsing') { this.#renderPicker(opts); return this.#restore(mark); }
    const { field, p, groups, current } = this.#compute();
    const s = this.#state;
    const methods = methodsFor(field);
    const destructive = DESTRUCTIVE.has(s.method);

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
      <div class="backlink"><a data-act="reselect">← Change selection</a> · ${this.selection.size} of ${this.all.length} hosts</div>
      <div class="bar">
        <div class="row">
          <select id="field">${this.fields.map(f =>
            `<option value="${f.key}" ${f.key === field.key ? 'selected' : ''}>${f.label ?? f.key}</option>`).join('')}</select>

          ${this.#distHTML(current, field)}

          <span class="arrow">→</span>
          <select id="method">${methods.map(m =>
            `<option value="${m}" ${m === s.method ? 'selected' : ''}>${METHOD_LABEL[m]}</option>`).join('')}</select>

          ${this.#operandHTML(field, s.method, s.operand)}

          <button class="apply ${destructive ? 'destructive' : ''}" data-act="apply" ${p.counts.changing && !this.#needsValue(field, s) ? '' : 'disabled'}>
            Apply to ${p.counts.changing} host${p.counts.changing === 1 ? '' : 's'}
          </button>
        </div>
        <div class="summary" role="status" aria-live="polite">${this.#needsValue(field, s) ? 'No value chosen yet.' : this.#summaryHTML(p)}</div>
        ${destructive && p.counts.changing ? `<div class="warn">${METHOD_LABEL[s.method]} discards values that are not shown anywhere else.</div>` : ''}
        <button class="addop" type="button">+ Add another operation</button>
      </div>

      ${this.#phaseHTML(p)}

      <div class="label">Transition groups</div>
      ${this.#needsValue(field, s) ? '<div class="empty">Choose a value to see what would change.</div>'
        : groups.length ? groups.map(g => this.#groupHTML(g, field)).join('')
        : '<div class="empty">Nothing selected.</div>'}
    `;

    this.#restore(mark);
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
    const n = this.matching.length, per = BulkEdit.PAGE, pages = this.pageCount, cur = this.pageNo ?? 0;
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
          <select data-scope>
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

    const { p } = this.#compute();
    if (name === 'apply') {
      // clear is the one operation that leaves nothing behind, so it is the one
      // that earns a gate. Everything else is guarded by the diff you just read.
      if (this.#state.method === 'clear') { this.#phase = { name: 'confirming', typed: '' }; return this.#render(); }
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
        <div style="font-size:12.5px;color:#666">${ph.done} of ${ph.total} · do not close this</div>
      </div>`;
    }

    if (ph.name === 'done') {
      const r = ph.result, bad = !r.complete;
      return `<div class="result ${bad ? 'bad' : ''}">
        <h3>${describeResult(r)}</h3>
        ${bad ? `<p style="margin:0;font-size:13px;color:#444">The ${r.counts.succeeded} that succeeded are done and will not be touched again. A retry applies only to the ${r.counts.failed} below.</p>
          <table class="fails">${r.failed.slice(0, 5).map(x =>
            `<tr><td>${x.item.hostname}</td><td class="before">${fmt(x.before)} → ${fmt(x.after)}</td><td class="why">timed out</td></tr>`).join('')}
            ${r.counts.failed > 5 ? `<tr><td colspan="3" style="color:#999">… and ${r.counts.failed - 5} more</td></tr>` : ''}</table>` : ''}
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
      const ops = Array.isArray(this.#state.operand) ? this.#state.operand : [];
      const v = ops[0];
      if (v == null) return '';
      const have = (current.presence ?? []).find(x => x.value === v)?.count ?? 0;
      return `<div class="dist">
        <div class="cap">Currently</div>
        <div class="track"><span class="seg" style="flex:${have};background:${COLORS[0]}"></span
          ><span class="seg rest" style="flex:${total - have}"></span></div>
        <div class="keys"><span>${have.toLocaleString()} of ${total.toLocaleString()} already have
          <b>${v}</b> (${Math.round(have / total * 100)}%)</span></div>
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

    const colour = (v, i) => v.other ? '#c8c8c8' : COLORS[i % COLORS.length];
    const lbl = v => v.other || !field.unit ? fmt(v.value) : `${fmt(v.value)}${field.unit}`;
    return `<div class="dist">
      <div class="cap">Currently</div>
      <div class="track">${shown.map((v, i) =>
        `<span class="seg" style="flex:${v.count};background:${colour(v, i)}" title="${fmt(v.value)} ${v.count}"></span>`).join('')}</div>
      <div class="keys">${shown.map((v, i) =>
        `<span title="${lbl(v)} — ${v.count.toLocaleString()} of ${total.toLocaleString()} (${Math.round(v.count / total * 100)}%)"
          ><i style="background:${colour(v, i)}"></i>${lbl(v)} <b>${v.count.toLocaleString()}</b></span>`).join('')}</div>
    </div>`;
  }

  #operandHTML(field, method, operand) {
    if (method === 'clear' || field.type === 'boolean') return '';
    if (field.type === 'number') return `<span class="arrow">→</span><input id="operand" type="text" value="${operand ?? ''}" style="min-width:70px">`;
    const opts = field.options ?? [...new Set(this.items.flatMap(i => [].concat(i[field.key] ?? [])))].sort();
    const val = Array.isArray(operand) ? operand[0] ?? '' : operand ?? '';
    return `<span class="arrow">→</span><select id="operand">
      ${field.type === 'multi-value' ? '<option value="">—</option>' : ''}
      ${opts.map(o => `<option value="${o}" ${String(o) === String(val) ? 'selected' : ''}>${o}</option>`).join('')}
    </select>`;
  }

  #groupHTML(g, field) {
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

    return `<div class="group ${quiet ? 'quiet' : ''}">
      <button class="ghead" type="button" data-key="${g.key}" aria-expanded="${open}">
        <span class="caret" aria-hidden="true">${open ? '▼' : '►'}</span>
        <span class="name">${g.label}</span>
        <span class="pill">${quiet ? `${g.total} host${g.total === 1 ? '' : 's'}` : `${g.changing} will change`}</span>
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
