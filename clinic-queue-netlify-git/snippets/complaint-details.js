/* Sub-complaints helper for Check-in
   - Shows context options after a primary complaint is selected
   - Quietly appends `complaintDetails` to the POST body for /api/tickets-create
   - Keeps existing UI/flow intact
*/
(() => {
  const SUBS = {
    "Respiratory": [
      "Cough","Shortness of breath","Sore throat","Runny nose","Fever","Wheezing","Chest discomfort"
    ],
    "Gastrointestinal": [
      "Abdominal pain","Nausea","Vomiting","Diarrhea","Constipation","Heartburn","Blood in stool"
    ],
    "Dermatological": [
      "Rash","Itching","Hives","Wound","Infection","Eczema flare","Psoriasis flare"
    ],
    "Musculoskeletal": [
      "Back pain","Neck pain","Joint pain","Sprain/strain","Swelling","Injury/trauma"
    ],
    "Neurological": [
      "Headache","Dizziness","Numbness or tingling","Weakness","Migraine","Seizure"
    ],
    "ENT": [
      "Ear pain","Hearing changes","Sinus pain/pressure","Sore throat","Nasal congestion"
    ],
    "Ophthalmologic": [
      "Red eye","Eye pain","Discharge","Vision changes","Injury/foreign body"
    ],
    "Urologic": [
      "Painful urination","Urgency/frequency","Blood in urine","Flank pain"
    ],
    "Gynecologic": [
      "Pelvic pain","Vaginal bleeding","Discharge","Pregnancy concern"
    ],
    "Cardiovascular": [
      "Chest pain","Palpitations","Leg swelling"
    ],
    "General": [
      "Fever","Fatigue","Chills","Night sweats"
    ],
    "Mental health": [
      "Anxiety","Low mood","Panic","Stress"
    ]
  };

  function $(sel){ return document.querySelector(sel); }
  function findComplaintSelect() {
    return document.querySelector('#complaint, select[name="complaint"], [data-complaint-select]');
  }

  function ensureContainer(afterEl) {
    let c = document.getElementById('complaint-details');
    if (!c) {
      c = document.createElement('div');
      c.id = 'complaint-details';
      c.style.marginTop = '12px';
      afterEl.insertAdjacentElement('afterend', c);
    }
    return c;
  }

  function render(complaint) {
    const select = findComplaintSelect();
    if (!select) return;
    const container = ensureContainer(select);
    container.innerHTML = '';

    const list = SUBS[complaint];
    if (!list || !list.length) { container.hidden = true; return; }
    container.hidden = false;

    const fs = document.createElement('fieldset');
    fs.style.border = 'none';
    fs.style.padding = '0';
    fs.style.margin = '0';

    const lg = document.createElement('legend');
    lg.textContent = 'Details (optional)';
    lg.style.fontSize = '0.95rem';
    lg.style.margin = '6px 0';
    fs.appendChild(lg);

    const wrap = document.createElement('div');
    wrap.style.display = 'grid';
    wrap.style.gridTemplateColumns = 'repeat(auto-fit, minmax(180px, 1fr))';
    wrap.style.gap = '8px 12px';

    list.forEach(label => {
      const id = 'sub_'+label.toLowerCase().replace(/[^a-z0-9]+/g,'_');
      const lab = document.createElement('label');
      lab.style.display = 'flex';
      lab.style.alignItems = 'center';
      lab.style.gap = '8px';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.value = label;
      cb.name = 'complaintDetails[]';
      cb.id = id;

      const span = document.createElement('span');
      span.textContent = label;

      lab.appendChild(cb);
      lab.appendChild(span);
      wrap.appendChild(lab);
    });

    fs.appendChild(wrap);
    container.appendChild(fs);
  }

  function selectedDetails() {
    return Array.from(document.querySelectorAll('input[name="complaintDetails[]"]:checked'))
                .map(i => i.value);
  }

  function patchFetchOnce() {
    if (window.__complaintFetchPatched) return;
    window.__complaintFetchPatched = true;

    const orig = window.fetch;
    window.fetch = function(input, init) {
      try {
        const url = typeof input === 'string' ? input : input.url;
        const method = (init?.method || (typeof input !== 'string' && input.method) || 'GET').toUpperCase();
        const isCreate = /\/tickets-create(?:\?|$)/.test(url);
        if (isCreate && method === 'POST') {
          let bodyText = init?.body || (typeof input !== 'string' ? input.body : null);
          if (typeof bodyText === 'string' && bodyText.trim().startsWith('{')) {
            const data = JSON.parse(bodyText);
            if (!Array.isArray(data.complaintDetails)) {
              const det = selectedDetails();
              if (det.length) data.complaintDetails = det;
            }
            const copyInit = { ...(init || {}), body: JSON.stringify(data) };
            return orig.call(this, url, copyInit);
          }
        }
      } catch (e) { /* swallow */ }
      return orig.call(this, input, init);
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const sel = findComplaintSelect();
    if (!sel) return;
    render(sel.value);
    sel.addEventListener('change', () => render(sel.value));
    patchFetchOnce();
  });

  // expose map for possible future UI
  window.__SUB_COMPLAINTS = SUBS;
})();