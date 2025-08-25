// /snippets/complaint-details.js
// Adds dynamic sub-category checkboxes under the primary complaint selector
// and includes them in the payload sent to /api/tickets-create as `complaintDetails`.
(function () {
  'use strict';
  const MAP = {
    "Respiratory": ["Cough","Shortness of breath","Sore throat","Runny/blocked nose","Fever/chills"],
    "Gastrointestinal": ["Nausea","Vomiting","Diarrhea","Abdominal pain","Heartburn"],
    "Neurological": ["Headache","Dizziness","Weakness","Numbness/tingling","Confusion"],
    "Dermatological": ["Rash","Itching","Wound","Infection","Allergic reaction"],
    "Musculoskeletal": ["Back pain","Joint pain","Muscle pain","Injury/trauma","Swelling"],
    "Cardiovascular": ["Chest pain","Palpitations","Leg swelling","Fainting/near-fainting"],
    "ENT": ["Ear pain","Hearing loss","Nose bleed","Sinus pain/pressure"],
    "Ophthalmology": ["Eye pain","Red eye","Vision changes","Discharge"],
    "Urology": ["Painful urination","Frequency/urgency","Blood in urine","Flank pain"],
    "Gynecology": ["Vaginal bleeding","Pelvic pain","Pregnancy related","Discharge/itching"],
    "General": ["Fever","Fatigue","Weight loss","Night sweats"]
  };

  function $(sel,root){return (root||document).querySelector(sel);}
  function $all(sel,root){return Array.from((root||document).querySelectorAll(sel));}
  function el(tag, attrs={}, children=[]) {
    const n = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)) {
      if (k==='class') n.className = v;
      else if (k==='for') n.htmlFor = v;
      else n.setAttribute(k,v);
    }
    for (const c of [].concat(children)) {
      if (typeof c === 'string') n.appendChild(document.createTextNode(c)); else if (c) n.appendChild(c);
    }
    return n;
  }

  function ensureStyles() {
    if ($('#complaint-details-style')) return;
    const css = `
      #complaint-details { display:none; margin-top: .75rem; padding:.75rem; border:1px solid rgba(0,0,0,.08); border-radius:.5rem; background:rgba(0,0,0,.02); }
      #complaint-details.active { display:block; }
      #complaint-details h4 { margin:0 0 .5rem 0; font-size: .95rem; font-weight:600; }
      #complaint-details .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap:.5rem .75rem; }
      #complaint-details label { display:flex; align-items:center; gap:.5rem; font-size:.95rem; }
      #complaint-details input[type="checkbox"] { transform: scale(1.1); }
    `;
    document.head.appendChild(el('style',{id:'complaint-details-style'},[css]));
  }

  function mountUI(selectEl) {
    ensureStyles();
    let box = $('#complaint-details');
    if (!box) {
      box = el('div',{id:'complaint-details'});
      selectEl.parentElement.insertAdjacentElement('afterend', box);
    }
    function render() {
      const val = selectEl.value;
      box.innerHTML = '';
      if (!val || !MAP[val]) { box.classList.remove('active'); return; }
      const opts = MAP[val];
      const grid = el('div',{class:'grid'}, opts.map((txt,i)=>{
        const id = `sub_${val.replace(/\s+/g,'_').toLowerCase()}_${i}`;
        return el('label',{'for':id},[el('input',{type:'checkbox',value:txt,id}), txt]);
      }));
      box.appendChild(el('h4',{},[`Select relevant details (${val})`]));
      box.appendChild(grid);
      box.classList.add('active');
    }
    selectEl.addEventListener('change', render);
    render();
    return box;
  }

  function getChecked(box){
    return $all('input[type="checkbox"]:checked', box).map(i=>i.value);
  }

  function intercept() {
    const orig = window.fetch;
    window.fetch = function(input, init) {
      try {
        const url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.includes('/api/tickets-create') && init && init.method && init.method.toUpperCase()==='POST' && init.body) {
          const box = $('#complaint-details');
          if (box) {
            const chosen = getChecked(box);
            if (chosen.length) {
              const data = JSON.parse(init.body);
              data.complaintDetails = chosen;
              init.body = JSON.stringify(data);
            }
          }
        }
      } catch (e) { /* ignore */ }
      return orig.apply(this, arguments);
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const select = $('#complaint, select[name="complaint"]');
    if (!select) return;
    const box = mountUI(select);
    intercept();
  });
})();