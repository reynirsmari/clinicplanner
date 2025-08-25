/**
 * patient-subcomplaints.js
 * Renders sub-complaint checkboxes after a primary complaint is selected
 * and appends them to the JSON for /api/tickets-create as `complaintDetails`.
 */
(() => {
  const SUBS = {
    "Respiratory": ["Cough","Shortness of breath","Sore throat","Runny nose","Fever","Wheezing","Chest discomfort"],
    "Gastrointestinal": ["Abdominal pain","Nausea","Vomiting","Diarrhea","Constipation","Heartburn","Blood in stool"],
    "Dermatological": ["Rash","Itching","Hives","Wound","Infection","Eczema flare","Psoriasis flare"],
    "Musculoskeletal": ["Back pain","Neck pain","Joint pain","Sprain/strain","Swelling","Injury/trauma"],
    "Neurological": ["Headache","Dizziness","Numbness or tingling","Weakness","Migraine","Seizure"],
    "ENT": ["Ear pain","Hearing changes","Sinus pain/pressure","Sore throat","Nasal congestion"],
    "Ophthalmologic": ["Red eye","Eye pain","Discharge","Vision changes","Injury/foreign body"],
    "Urologic": ["Painful urination","Urgency/frequency","Blood in urine","Flank pain"],
    "Gynecologic": ["Pelvic pain","Vaginal bleeding","Discharge","Pregnancy concern"],
    "Cardiovascular": ["Chest pain","Palpitations","Leg swelling"],
    "General": ["Fever","Fatigue","Chills","Night sweats"],
    "Mental health": ["Anxiety","Low mood","Panic","Stress"]
  };

  const sel = () => document.querySelector('#complaint, select[name="complaint"], [data-complaint-select]');

  function container(afterEl){
    let c = document.getElementById('complaint-details');
    if(!c){
      c = document.createElement('div');
      c.id = 'complaint-details';
      afterEl.insertAdjacentElement('afterend', c);
    }
    return c;
  }

  function selectedDetails(){
    return Array.from(document.querySelectorAll('input[name="complaintDetails[]"]:checked')).map(i=>i.value);
  }

  function render(complaint){
    const s = sel();
    if(!s) return;
    const host = container(s);
    host.innerHTML = '';
    const list = SUBS[complaint];
    if(!list){ host.hidden = true; return; }
    host.hidden = false;

    const fs = document.createElement('fieldset');
    fs.style.border = '1px solid #e5e7eb';
    fs.style.borderRadius = '12px';
    fs.style.padding = '12px';

    const lg = document.createElement('legend');
    lg.textContent = 'Details (optional)';
    lg.style.fontSize = '0.95rem';
    lg.style.padding = '0 6px';
    fs.appendChild(lg);

    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(160px, 1fr))';
    grid.style.gap = '8px 12px';

    for(const label of list){
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
      grid.appendChild(lab);
    }
    fs.appendChild(grid);
    host.appendChild(fs);
  }

  function patchFetch(){
    if(window.__subComplaintsPatched) return;
    window.__subComplaintsPatched = true;
    const orig = window.fetch;
    window.fetch = function(input, init){
      try{
        const url = typeof input === 'string' ? input : input.url;
        const method = (init?.method || (typeof input !== 'string' && input.method) || 'GET').toUpperCase();
        if(/\/tickets-create(?:\?|$)/.test(url) && method === 'POST'){
          let bodyText = init?.body || (typeof input !== 'string' ? input.body : null);
          if(typeof bodyText === 'string' && bodyText.trim().startsWith('{')){
            const data = JSON.parse(bodyText);
            if(!Array.isArray(data.complaintDetails)){
              const det = selectedDetails();
              if(det.length) data.complaintDetails = det;
            }
            const next = { ...(init||{}), body: JSON.stringify(data) };
            return orig.call(this, url, next);
          }
        }
      }catch{}
      return orig.call(this, input, init);
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const s = sel();
    if(!s) return;
    if(s.value) render(s.value);
    s.addEventListener('change', ()=> render(s.value));
    patchFetch();
  });
})(); 
