# main.py
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
import sqlite3

from pydantic import BaseModel

# Конфигурация JWT
SECRET_KEY = "ваш_секретный_ключ"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Модель пользователя
class User(BaseModel):
    username: str

class UserInDB(User):
    hashed_password: str

# Модифицированная модель задачи
class Task(BaseModel):
    title: str
    completed: bool = False
    user_id: int  # Добавляем привязку к пользователю

# Инициализация БД (добавляем таблицу users)
conn = sqlite3.connect('tasks.db')
cursor = conn.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        hashed_password TEXT
    )
''')
cursor.execute('''
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        completed BOOLEAN,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )
''')
conn.commit()

# Функции для работы с пользователями
def get_user(username: str):
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    if user:
        return UserInDB(id=user[0], username=user[1], hashed_password=user[2])

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user or not pwd_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Неверные учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = get_user(username)
    if user is None:
        raise credentials_exception
    return user

# Эндпоинты для аутентификации
@app.post("/register")
async def register(user: UserInDB):
    hashed_password = pwd_context.hash(user.hashed_password)
    try:
        cursor.execute(
            "INSERT INTO users (username, hashed_password) VALUES (?, ?)",
            (user.username, hashed_password)
        )
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")
    return {"message": "Пользователь успешно зарегистрирован"}

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Модифицированные эндпоинты задач с проверкой авторизации
@app.get("/tasks")
async def get_tasks(current_user: User = Depends(get_current_user)):
    cursor.execute("SELECT * FROM tasks WHERE user_id = ?", (current_user.id,))
    tasks = cursor.fetchall()
    return [{"id": t[0], "title": t[1], "completed": bool(t[2])} for t in tasks]

@app.post("/tasks")
async def create_task(task: Task, current_user: User = Depends(get_current_user)):
    cursor.execute(
        "INSERT INTO tasks (title, completed, user_id) VALUES (?, ?, ?)",
        (task.title, task