document.addEventListener('DOMContentLoaded', async () => {
  const token = sessionStorage.getItem('token');
  const dropdown = document.getElementById('equipment_id');
  const spinner = document.getElementById('spinner');
  const form = document.getElementById('mobileUnitForm');
  const message = document.getElementById('formMessage');

  if (!token) {
    alert('You must be logged in. Redirecting to login...');
    window.location.href = 'index.html';
    return;
  }

  // ✅ Load available imaging equipment
  try {
    const response = await fetch('https://n8n-blgy.onrender.com/webhook/list-available-imaging-equipments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const equipmentList = await response.json();
    dropdown.innerHTML = '<option value="">-- Select Equipment --</option>';
    equipmentList.forEach(eq => {
      const option = document.createElement('option');
      option.value = eq.equipment_id; // assuming each equipment item has 'id' and 'name'
      option.textContent = `${eq.equipment_id} – ${eq.equipment_name}`;
      dropdown.appendChild(option);
	  document.getElementById('formContainer').style.display = 'block';
	  document.getElementById('loadingNotice').style.display = 'none';

    });

  } catch (err) {
    console.error('Failed to load equipment list:', err);
	document.getElementById('loadingNotice').textContent = '⚠️ Failed to load equipment list. Please try again later.';
    dropdown.innerHTML = '<option value="">⚠️ Failed to load equipment</option>';
  }

  // ✅ Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    spinner.style.display = 'block';
    message.textContent = '';
    message.style.color = '';

    const payload = {
      unit_name: form.unit_name.value.trim(),
      license_plate: form.license_plate.value.trim(),
      state: form.state.value.trim().toUpperCase(),
      vin: form.vin.value.trim(),
      make: form.make.value.trim(),
      model: form.model.value.trim(),
      year: form.year.value ? parseInt(form.year.value) : null,
      location: form.location.value.trim(),
      equipment_id: form.equipment_id.value,
      notes: form.notes.value.trim(),
      is_active: form.is_active.checked
    };

    try {
      const response = await fetch('https://n8n-blgy.onrender.com/webhook/add-mobile-unit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });


      const text = await response.text();
      spinner.style.display = 'none';

      if (text.includes('Success')) {
        message.style.color = 'green';
        message.textContent = '✅ Mobile unit successfully created.';
        form.reset();
      } else {
        message.style.color = 'red';
        message.textContent = `⚠️ ${text}`;
      }

    } catch (err) {
      spinner.style.display = 'none';
      console.error('Submission failed:', err);
      message.style.color = 'red';
      message.textContent = '❌ Error submitting form. Please try again.';
    }
  });
});
