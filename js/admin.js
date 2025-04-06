const USER_STORAGE_KEY = 'equipmentAppUsers';

function getUsers() {
  const data = localStorage.getItem(USER_STORAGE_KEY);
  return data ? JSON.parse(data).users : [];
}

function saveUsers(users) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ users }));
}

function renderUsers() {
  const tbody = document.getElementById('userList');
  tbody.innerHTML = '';

  const users = getUsers();
  users.forEach((user, index) => {
    const tr = document.createElement('tr');

    const tdUsername = document.createElement('td');
    tdUsername.textContent = user.username;

    const tdRole = document.createElement('td');
    tdRole.textContent = user.role;

    const tdActions = document.createElement('td');

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
      if (confirm(`Delete user "${user.username}"?`)) {
        users.splice(index, 1);
        saveUsers(users);
        renderUsers();
      }
    };

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset Password';
    resetBtn.onclick = () => {
      const newPass = prompt(`Enter new password for "${user.username}":`);
      if (newPass) {
        const hash = bcrypt.hashSync(newPass, bcrypt.genSaltSync(10));
        users[index].passwordHash = hash;
        saveUsers(users);
        alert('Password reset successfully.');
      }
    };

    tdActions.appendChild(resetBtn);
    tdActions.appendChild(deleteBtn);

    tr.appendChild(tdUsername);
    tr.appendChild(tdRole);
    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const role = sessionStorage.getItem('role');
  const username = sessionStorage.getItem('username');

  if (role !== 'admin') {
    alert('Access denied. Admins only.');
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('adminNotice').textContent = `Logged in as Admin: ${username}`;

  renderUsers();

  document.getElementById('addUserForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const uname = document.getElementById('new-username').value.trim();
    const pass = document.getElementById('new-password').value;
    const role = document.getElementById('new-role').value;

    if (!uname || !pass) {
      alert('Please fill out all fields.');
      return;
    }

    const users = getUsers();
    if (users.find(u => u.username === uname)) {
      alert('User already exists.');
      return;
    }

    const hash = bcrypt.hashSync(pass, bcrypt.genSaltSync(10));
    users.push({ username: uname, passwordHash: hash, role });
    saveUsers(users);
    renderUsers();
    e.target.reset();
  });
});
