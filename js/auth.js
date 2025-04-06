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
