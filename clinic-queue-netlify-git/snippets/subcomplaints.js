
// /snippets/subcomplaints.js
// Adds dynamic sub-category checkboxes under the primary complaint selector
// and appends the chosen values to the patient's notes before submitting.
(function () {
  const SUBCATS = {
    "Respiratory": ["Cough", "Shortness of breath", "Sore throat", "Runny/blocked nose", "Fever/chills"],
    "Gastrointestinal": ["Nausea", "Vomiting", "Diarrhea", "Abdominal pain", "Heartburn"],
    "Neurological": ["Headache", "Dizziness", "Weakness", "Numbness/tingling", "Confusion"],
    "Dermatological": ["Rash", "Itching", "Wound", "Infection", "Allergic reaction"],
    "Musculoskeletal": ["Back pain", "Joint pain", "Muscle pain", "Injury/trauma", "Swelling"],
    "Cardiovascular": ["Chest pain", "Palpitations", "Leg swelling", "Fainting/near-fainting"],
    "ENT": ["Ear pain", "Hearing loss", "Nose bleed", "Sinus pain/pressure"],
    "Ophthalmology": ["Eye pain", "Red eye", "Vision changes", "Discharge"],
    "Urology": ["Painful urination", "Frequency/urgency", "Blood in urine", "Flank pain"],
    "Gynecology": ["Vaginal bleeding", "Pelvic pain", "Pregnancy related", "Discharge/itching"]
  };

  function el(tag, attrs={}, children=[]) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k,v]) => {
      if (k === 'class') node.className = v;
      else if (k === 'for') node.htmlFor = v;
      else node.setAttribute(k, v);
    });
    children.forEach(c => node.append(c));
    return node;
  }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(() => {
    const form = document.querySelector('form#checkinForm, form[data-checkin], form[action*="tickets-create"]') || document.querySelector('form');
    const select = document.querySelector('#complaint, select[name="complaint"]');
    if (!form || !select) return;

    // Container just after the complaint select
    const container = el('div', { id: 'subcomplaints', class: 'mt-3 space-y-2' });
    select.closest('div')?.after(container);

    function renderSubcats() {
      container.innerHTML = '';
      const group = select.value;
      const options = SUBCATS[group] || [];
      if (!options.length) return;

      container.append(
        el('div', { class: 'text-sm text-gray-600' }, ['Select all that apply (optional):'])
      );

      const grid = el('div', { class: 'grid grid-cols-1 sm:grid-cols-2 gap-2' });
      options.forEach((label, i) => {
        const id = `subc_${i}`;
        const checkbox = el('input', { type: 'checkbox', id, value: label, class: 'mr-2 accent-indigo-600' });
        checkbox.dataset.role = 'subcomplaint';
        const lbl = el('label', { for: id, class: 'cursor-pointer select-none text-gray-800' }, [label]);
        grid.append(el('div', { class: 'flex items-center p-2 rounded border border-gray-200 hover:bg-gray-50' }, [checkbox, lbl]));
      });
      container.append(grid);
    }

    renderSubcats();
    select.addEventListener('change', renderSubcats);

    // On submit, gather checked boxes and append to notes (or create hidden field)
    form.addEventListener('submit', () => {
      const chosen = Array.from(container.querySelectorAll('input[type="checkbox"][data-role="subcomplaint"]:checked'))
        .map(i => i.value);
      if (!chosen.length) return;
      const notes = document.querySelector('#notes, textarea[name="notes"]');
      const line = `Details: ${chosen.join(', ')}`;
      if (notes) {
        const sep = notes.value && !notes.value.endsWith('\n') ? '\n' : '';
        notes.value = (notes.value || '') + sep + line;
      } else {
        // fall back: hidden field named details (picked up by most form->object serializers)
        const hidden = el('input', { type: 'hidden', name: 'details', value: chosen.join(', ') });
        form.append(hidden);
      }
    }, { capture: true });
  });
})();
