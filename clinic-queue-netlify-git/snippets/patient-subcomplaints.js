
/**
 * patient-subcomplaints.js
 * Drop-in: shows sub-complaint checkboxes once a primary complaint is selected
 * and sends them as `complaintDetails` with /api/tickets-create.
 */
(() => {
  const SUBS = {"Respiratory": ["Cough", "Shortness of breath", "Sore throat", "Runny nose", "Fever", "Wheezing", "Chest tightness", "Chest pain with breathing", "Hoarseness", "Loss of smell", "Sinus pressure", "Post-nasal drip", "Night cough", "Productive cough", "Dry cough"], "Gastrointestinal": ["Abdominal pain", "Nausea", "Vomiting", "Diarrhea", "Constipation", "Heartburn", "Bloating", "Gas", "Loss of appetite", "Blood in stool", "Black stool", "Reflux after meals", "Upper abdominal pain", "Lower abdominal pain", "Weight loss"], "Dermatological": ["Rash", "Itching", "Hives", "Wound", "Infection", "Redness", "Swelling", "Blistering", "Dry skin", "Cracked skin", "Scaling", "Weeping lesion", "Painful lesion", "Acne breakout", "Eczema flare"], "Musculoskeletal": ["Back pain", "Neck pain", "Joint pain", "Muscle pain", "Sprain/strain", "Swelling", "Stiffness", "Limited range of motion", "Knee pain", "Shoulder pain", "Hip pain", "Ankle pain", "Injury/trauma", "Spasm", "Tingling in limbs"], "Neurological": ["Headache", "Migraine", "Dizziness", "Vertigo", "Numbness", "Tingling", "Weakness", "Memory issues", "Confusion", "Speech difficulty", "Vision disturbance", "Balance problems", "Tremor", "Seizure", "Face droop"], "ENT": ["Ear pain", "Hearing changes", "Tinnitus", "Sinus pain/pressure", "Sore throat", "Tonsil pain", "Nasal congestion", "Runny nose", "Post-nasal drip", "Hoarseness", "Difficulty swallowing", "Mouth ulcers", "Tooth pain", "Jaw pain", "Facial pain"], "Ophthalmologic": ["Red eye", "Eye pain", "Discharge", "Itchy eyes", "Tearing", "Light sensitivity", "Blurred vision", "Double vision", "Foreign body sensation", "Vision loss", "Floaters", "Flashes of light", "Eyelid swelling", "Stye", "Chemical exposure"], "Urologic": ["Painful urination", "Urgency", "Frequency", "Blood in urine", "Cloudy urine", "Foul-smelling urine", "Flank pain", "Lower abdominal pain", "Incontinence", "Nocturia", "Weak stream", "Dribbling", "Incomplete emptying", "Kidney stone history", "Testicular pain"], "Gynecologic": ["Pelvic pain", "Vaginal bleeding", "Spotting", "Discharge", "Itching", "Odor", "Painful intercourse", "Missed period", "Cramping", "Pregnancy concern", "Breast pain", "Breast lump", "Postpartum concern", "Hot flashes", "IUD concern"], "Cardiovascular": ["Chest pain", "Palpitations", "Shortness of breath on exertion", "Leg swelling", "Dizziness", "Fainting", "Rapid heartbeat", "Slow heartbeat", "High blood pressure reading", "Low blood pressure symptoms", "Exercise intolerance", "Claudication", "Orthopnea", "PND (night breathlessness)", "Family history concern"], "General": ["Fever", "Fatigue", "Chills", "Night sweats", "Unexplained weight loss", "Poor appetite", "Dehydration", "Heat intolerance", "Cold intolerance", "Generalized pain", "Sleep disturbance", "Jet lag", "Medication question", "Allergic reaction", "Travel-related illness"], "Mental health": ["Anxiety", "Panic", "Low mood", "Irritability", "Stress", "Insomnia", "Poor concentration", "Loss of interest", "Appetite change", "Suicidal thoughts", "Self-harm thoughts", "Mania symptoms", "Substance use concern", "Grief", "Work burnout"]};

  const select = () => document.querySelector('#complaint, select[name="complaint"], [data-complaint-select]');

  function host(afterEl){
    let c = document.getElementById('complaint-details');
    if(!c){
      c = document.createElement('div');
      c.id = 'complaint-details';
      afterEl.insertAdjacentElement('afterend', c);
    }
    return c;
  }

  function selected(){
    return Array.from(document.querySelectorAll('input[name="complaintDetails[]"]:checked')).map(i=>i.value);
  }

  function render(complaint){
    const s = select();
    if(!s) return;
    const h = host(s);
    h.innerHTML = '';
    const list = SUBS[complaint];
    if(!list){ h.hidden = true; return; }
    h.hidden = false;

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
    h.appendChild(fs);
  }

  function patchSubmit(){
    const form = document.querySelector('form#form, form[data-ticket-form], form');
    if(!form) return;
    form.addEventListener('submit', (e)=>{
      try{
        // If fetch is used later, this ensures payload has complaintDetails
        const det = selected();
        if(det.length){
          const hidden = document.getElementById('complaintDetailsHidden') || Object.assign(document.createElement('input'), {type:'hidden', id:'complaintDetailsHidden', name:'complaintDetails'});
          hidden.value = JSON.stringify(det);
          form.appendChild(hidden);
        }
      }catch{}
    }, true);
    // Patch window.fetch to merge complaintDetails into JSON bodies sent to /tickets-create
    if(window.__subComplaintsFetchPatched) return;
    window.__subComplaintsFetchPatched = true;
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
              const det = selected();
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
    const s = select();
    if(s){ if(s.value) render(s.value); s.addEventListener('change', ()=> render(s.value)); }
    patchSubmit();
  });
})();
