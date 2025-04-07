document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('equipmentForm');
  const message = document.getElementById('formMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

	const spinner = document.getElementById('spinner');
	const message = document.getElementById('formMessage');
	spinner.style.display = 'block';
	message.textContent = '';
	message.style.color = '';


    const token = sessionStorage.getItem('token');
    if (!token) {
      alert('You are not logged in. Redirecting to login...');
      window.location.href = 'index.html';
      return;
    }

    const equipmentName = document.getElementById('equipment-name').value.trim();
    const scanType = document.getElementById('scan-type').value;
    const manufacturer = document.getElementById('manufacturer').value.trim();

    const formData = new FormData(form);
	const payload = {
		"equipment-name": formData.get("equipment-name"),
		"scan-type": formData.get("scan-type"),
		"manufacturer": formData.get("manufacturer")
};

		console.log("Payload being sent:", payload);

    try {
      const response = await fetch('https://n8n-blgy.onrender.com/webhook/add-new-equipment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const text = await response.text();
	  spinner.style.display = 'none';


      if (text.includes('Success - equipment has been added')) {
        form.reset();
        message.style.color = 'green';
        message.textContent = '✅ Equipment added successfully.';
      } else {
        message.style.color = 'red';
        message.innerHTML = `⚠️ ${text}`;
      }

    } catch (error) {
      console.error('Submission error:', error);
	  spinner.style.display = 'none';
      message.style.color = 'red';
      message.textContent = 'An error occurred while submitting the form.';
    }
  });
});
