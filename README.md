# Fullstack Application  

This is a Fullstack application that includes a **React frontend** and a **Flask backend** with a **PostgreSQL database** running in a Docker container.  

## **Getting Started**  

Follow the steps below to set up and run the project on your local machine.  

---

## **1. Setup PostgreSQL using Docker**  

Ensure you have Docker installed and running. Then, start the PostgreSQL container using:  

```sh
docker-compose up -d

Once the container is running, you can check the PostgreSQL database at:
📌 URL: http://localhost:5050
🧑‍💻 Username: admin@example.com
🔑 Password: admin

cd backend

# Create virtual environment
python -m venv venv

# Activate the virtual environment (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

python app.py

#In powershell install the dependencies
npm install

npm run dev
