// <bulk-edit> — the interface, at wireframe fidelity.
//
// Every number on screen comes from model.js. Nothing here counts anything,
// decides what is legal, or works out what would change. If a count is wrong,
// the model is wrong — there is no second place for it to go wrong.

import { summarise, methodsFor, METHOD_LABEL, DESTRUCTIVE, plan, describe, groupByTransition,
         reconcile, retryScope, describeResult } from './model.js';

const CSS = `
:host { display:block; font:14px/1.5 ui-sans-serif, system-ui, sans-serif; color:#1a1a1a; }
* { box-sizing:border-box; }
button, input, select { font:inherit; color:inherit; }

.bar { border:1px solid #d4d4d4; background:#fff; padding:14px 16px; }
.row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
select, input[type=text] { border:1px solid #b8b8b8; background:#fff; padding:6px 9px; min-width:130px; }
.arrow { color:#999; }

.dist { display:flex; flex-direction:column; gap:4px; min-width:210px; }
.dist .track { display:flex; height:9px; border:1px solid #c8c8c8; overflow:hidden; }
.dist .seg { min-width:3px; }
.dist .keys { display:flex; gap:11px; flex-wrap:wrap; font-size:11px; color:#666; }
.dist .keys i { font-style:normal; display:inline-block; width:7px; height:7px; margin-right:4px; border:1px solid #0003; }
.dist .cap { font-size:11px; color:#777; }

.apply { margin-left:auto; border:1px solid #1a1a1a; background:#1a1a1a; color:#fff; padding:8px 15px; cursor:pointer; }
.apply[disabled] { background:#fff; color:#999; border-color:#ccc; cursor:default; }
.apply.destructive { background:#8a2318; border-color:#8a2318; }

.summary { margin-top:9px; font-size:13px; color:#444; }
.summary b { color:#1a1a1a; }
.warn { margin-top:8px; font-size:12px; border-left:3px solid #8a2318; padding:5px 9px; color:#8a2318; background:#fbf2f0; }
.addop { margin-top:7px; font-size:12.5px; color:#666; }

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
  #phase = { name: 'editing' };   // editing | confirming | committing | done
  #retryOnly = null;

  set data({ items, fields }) { this.items = items; this.fields = fields; this.#reset(); this.#render(); }

  #reset() {
    const f = this.fields[0];
    this.#state = {
      fieldKey: f.key, method: methodsFor(f)[0], operand: this.#defaultOperand(f, methodsFor(f)[0]),
      excluded: new Set(), open: new Set(), showAll: new Set(), query: {},
    };
    this.#phase = { name: 'editing' };
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
      s.open.clear(); s.showAll.clear(); s.query = {};
    } else if (t.id === 'method') {
      s.method = t.value; s.operand = this.#defaultOperand(this.#field, t.value);
    } else if (t.id === 'operand') {
      s.operand = this.#field.type === 'number' ? Number(t.value)
                : this.#field.type === 'multi-value' ? (t.value ? [t.value] : [])
                : t.value;
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

  #render(opts = {}) {
    const { field, p, groups, current } = this.#compute();
    const s = this.#state;
    const methods = methodsFor(field);
    const destructive = DESTRUCTIVE.has(s.method);

    // groups start open when the whole selection is small enough to just read
    const autoOpen = this.items.length <= 25;

    this.shadowRoot.innerHTML = `
      <style>${CSS}</style>
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
        <div class="summary">${this.#needsValue(field, s) ? 'No value chosen yet.' : this.#summaryHTML(p)}</div>
        ${destructive && p.counts.changing ? `<div class="warn">${METHOD_LABEL[s.method]} discards values that are not shown anywhere else.</div>` : ''}
        <div class="addop">+ Add another operation</div>
      </div>

      ${this.#phaseHTML(p)}

      <div class="label">Transition groups</div>
      ${this.#needsValue(field, s) ? '<div class="empty">Choose a value to see what would change.</div>'
        : groups.length ? groups.map(g => this.#groupHTML(g, field, autoOpen)).join('')
        : '<div class="empty">Nothing selected.</div>'}
    `;

    if (opts.focus) {
      const el = this.shadowRoot.querySelector(opts.focus);
      if (el) { const v = el.value; el.focus(); el.setSelectionRange(v.length, v.length); }
    }
  }

  #needsValue(field, s) {
    if (s.method === 'clear' || field.type === 'boolean') return false;
    const v = s.operand;
    return Array.isArray(v) ? v.length === 0 : v === '' || v == null;
  }

  #act(name) {
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
    const vals = field.type === 'multi-value'
      ? (current.presence ?? []).map(x => ({ value: x.value, count: x.count }))
      : (current.values ?? []);
    if (!vals.length) return '';
    const total = this.items.length;
    return `<div class="dist">
      <div class="cap">Currently</div>
      <div class="track">${vals.map((v, i) =>
        `<span class="seg" style="flex:${v.count};background:${COLORS[i % COLORS.length]}"></span>`).join('')}</div>
      <div class="keys">${vals.map((v, i) =>
        `<span><i style="background:${COLORS[i % COLORS.length]}"></i>${fmt(v.value)} ${v.count} (${Math.round(v.count / total * 100)}%)</span>`).join('')}</div>
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

  #groupHTML(g, field, autoOpen) {
    const s = this.#state;
    const open = s.open.has(g.key) || (autoOpen && !s.open.size);
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
      <div class="ghead" data-key="${g.key}">
        <span class="caret">${open ? '▼' : '►'}</span>
        <span class="name">${g.label}</span>
        <span class="pill">${quiet ? `${g.total} host${g.total === 1 ? '' : 's'}` : `${g.changing} will change`}</span>
        ${g.excluded ? `<span class="exc">· ${g.excluded} excluded</span>` : ''}
      </div>
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
      <td><input type="checkbox" data-exclude="${r.id}" ${on ? 'checked' : ''}></td>
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

customElements.define('bulk-edit', BulkEdit);
