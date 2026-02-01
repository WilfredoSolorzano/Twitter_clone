# 🐦 Twitter Clone

Um clone completo do Twitter desenvolvido com Django REST Framework e React.

## 🚀 Funcionalidades

- ✅ **Autenticação de usuários** (registro/login)
- ✅ **Perfil personalizado** com foto e banner
- ✅ **Sistema de seguir/parar de seguir**
- ✅ **Postagens com texto e imagens**
- ✅ **Curtidas e comentários**
- ✅ **Feed personalizado** (apenas de quem você segue)
- ✅ **Interface moderna** com Tailwind CSS
- ✅ **Responsivo** para mobile e desktop

## 🛠️ Tecnologias

### Backend
- Python 3.12+
- Django 4.2
- Django REST Framework
- SQLite (desenvolvimento) / PostgreSQL (produção)
- Django REST Knox para autenticação

### Frontend
- React 18
- Tailwind CSS
- React Router DOM
- Axios para requisições HTTP
- React Icons



## 🚀 Instalação Local

### 1. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou venv\Scripts\activate  # Windows

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

### 2. Frontend
cd frontend
npm install
npm start

🌐 Acesso

    Frontend: http://localhost:3000

    Backend API: http://localhost:8000

    Admin Django: http://localhost:8000/admin

✨ Autor

Desenvolvido por Wilfredo Solorzano como projeto de portfólio. 
