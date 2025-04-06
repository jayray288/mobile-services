// utils: simulate persistent user storage in localStorage
const USER_STORAGE_KEY = 'equipmentAppUsers';

// Helper to get users
function getUsers() {
  const data = localStorage.getItem(USER_STORAGE_KEY);
  return data ? JSON.parse(data) : { users: [] };
}

// Helper to save users
function saveUsers(users) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ users }));
}

// Helper to check if admin exists
function hasAdminUser() {
  const { users } = getUsers();
  return users.some(user => user.role === 'admin');
}

// Only run on setup.html
document.addEventListener('DOMContentLoaded', () => {
  const setupForm = document.getElementById('setupForm');
  if (setupForm) {
    // Redirect if admin already exists
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
        console.error(err);
        errorMsg.textContent = 'An error occurred. Please try again.';
      }
    });
  }
});

// Login Page Logic
document.addEventListener('DOMContentLoaded', () => {
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

      // ✅ Create JWT token for n8n webhook
      const payload = {
        sub: user.username,
        role: user.role,
        iss: 'static-site'
      };

      const token = window.jwt.sign(payload, '*Parivar98');  // use same secret as n8n webhook

      // Store JWT and user info
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('username', user.username);
      sessionStorage.setItem('role', user.role);

      // Redirect to menu
      window.location.href = 'menu.html';
    });
  }
});
