// app.js - Добавляем обработку авторизации
let currentToken = null;

// Функция для авторизованных запросов
async function authFetch(url, options = {}) {
    if (!options.headers) options.headers = {};
    if (currentToken) {
        options.headers['Authorization'] = `Bearer ${currentToken}`;
    }
    const response = await fetch(url, options);
    if (response.status === 401) {
        // Обработка истечения токена
        localStorage.removeItem('token');
        window.location.reload();
    }
    return response;
}

// Обработка входа
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    });
    
    if (response.ok) {
        const data = await response.json();
        currentToken = data.access_token;
        localStorage.setItem('token', currentToken);
        fetchTasks();
    } else {
        alert('Ошибка авторизации!');
    }
});

// Обработка регистрации
document.getElementById('registerBtn').addEventListener('click', async () => {
    const username = prompt('Введите логин:');
    const password = prompt('Введите пароль:');
    
    const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            username: username,
            hashed_password: password
        })
    });
    
    if (response.ok) {
        alert('Регистрация успешна!');
    } else {
        alert('Ошибка регистрации!');
    }
});

// При загрузке страницы проверяем токен
window.addEventListener('load', () => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
        currentToken = savedToken;
        fetchTasks();
    }
});

// Модифицируем все fetch-запросы использовать authFetch вместо fetch