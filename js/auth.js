const USER_STORAGE_KEY = 'equipmentAppUsers';

// 🔄 Utility: Get user list from localStorage
function getUsers() {
  const data = localStorage.getItem(USER_STORAGE_KEY);
  return data ? JSON.parse(data) : { users: [] };
}

// 🔄 Utility: Save user list to localStorage
function saveUsers(users) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ users }));
}

// 🔍 Check if admin user exists
function hasAdminUser() {
  const { users } = getUsers();
  return users.some(user => user.role === 'admin');
}

// 🛠 First-Time Admin Setup Logic (for setup.html)
document.addEventListener('DOMContentLoaded', () => {
  const setupForm = document.getElementById('setupForm');
  if (setupForm) {
    if (hasAdminUser()) {
      window.location.href = 'index.html';
      return;
    }

    setupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const errorMsg = document.getElementById('errorMsg');

      if (!username || !password) {
        errorMsg.textContent = 'Please fill in all fields.';
        return;
      }

      try {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const users = getUsers().users;
        users.push({ username, passwordHash: hash, role: 'admin' });
        saveUsers(users);

        alert('Admin account created! Please log in.');
        window.location.href = 'index.html';
      } catch (err) {
        console.error('SETUP ERROR:', err);
        errorMsg.textContent = 'An error occurred. Please try again.';
      }
    });
  }

  // 🔐 Login Logic (for index.html)
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const errorMsg = document.getElementById('errorMsg');

      const { users } = getUsers();
      const user = users.find(u => u.username === username);
      if (!user) {
        errorMsg.textContent = 'User not found.';
        return;
      }

      const valid = bcrypt.compareSync(password, user.passwordHash);
      if (!valid) {
        errorMsg.textContent = 'Invalid password.';
        return;
      }

      // ✅ JWT creation (using jwt-simple)
      const payload = {
        sub: user.username,
        role: user.role,
        iss: 'static-site',
        iat: Math.floor(Date.now() / 1000)
      };

      const secret = '*Parivar98'; // 🔐 Use the same as in your n8n webhook node
      const token = jwt.encode(payload, secret);

      // 💾 Store login session
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('username', user.username);
      sessionStorage.setItem('role', user.role);

      // ➡ Redirect to menu
      window.location.href = 'menu.html';
    });
  }
});
