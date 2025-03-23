# **🚀 Setup and Run the Project with Docker**

## **1️⃣ Clone the Repository**

Start by cloning the repository to your local machine:

```sh
git clone --recurse-submodules https://github.com/Moobbot/dicom-diagnosis.git
cd dicom-diagnosis
```

---

## **2️⃣ Build and Run the Docker Containers**

Before running the application, you need to create `.env` files for both the frontend and backend.

### Backend

```sh
cd ./backend
```

```sh
cp .env.example .env
```

```ini
# MongoDB connection string (replace 'localhost' and 'mydatabase' with your actual database host and name)
MONGO_DB_URI=<chuỗi kết nối DB>  # Ví dụ: mongodb://localhost:27017/dicom

# Base URL for the frontend application
FE_BASE_URL=http://localhost:3000

# Application environment:
# - development: for development purposes
# - production: for production deployment
# - test: for running tests
NODE_ENV=development

# The port on which the application server will run
PORT=8080

# Secret key used to sign and verify JSON Web Tokens (JWTs)
# Keep this value secure and private
JWT=accesssecretkey

# Access token expiration time in seconds
# Using the format: 15m, 30d, 1h, 1d
JWT_EXPIRATION=1m

# Secret key for signing and verifying refresh tokens
# Keep this value secure and private
JWT_REFRESH=refreshsecretkey

# Refresh token expiration time in seconds
# Using the format: 15m, 30d, 1h, 1d
JWT_REFRESH_EXPIRATION=7d

# Link connect SYBIL API
SYBIL_MODEL_BASE_URL=http://localhost:5000

LINK_SAVE_DICOM_UPLOADS = "./src/data/dicom/uploads"
LINK_SAVE_DICOM_RESULTS = "./src/data/dicom/results"
LINK_TEMPLATE_REPORT = "./src/data/report/format"
LINK_SAVE_REPORT = "./src/data/dicom/gen"

# Temporary file expiration time
TEMP_EXPIRATION = 1h
```

### Frontend

```sh
cd ../frontend
```

```sh
cp .env.example .env
```

```ini
# Base URL của API Backend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api # https://api.example.com

# Server configuration
PORT=3000

# Environment của ứng dụng (development, staging, production)
NODE_ENV=development

# Debug mode (Bật/tắt log chi tiết cho development)
NEXT_PUBLIC_DEBUG=true

# Login page
NEXT_PUBLIC_LOGIN_PAGE=/login
```

Now, build and start all services using Docker:

```sh
docker-compose up --build -d
```

📌 **Explanation:**

- `--build` ensures that Docker rebuilds images if there are changes.
- `-d` runs the containers in detached mode (in the background).

---

## **3️⃣ Verify Running Containers**

To check if all services are running correctly:

```sh
docker ps
```

If everything is set up properly, you should see the backend, frontend, database, and any other services running.

---

## **4️⃣ (First-time setup) Seed the Database**

If this is your first time running the project, you need to seed the database to create an **admin account**.

### **Find the correct backend container name**

Docker automatically generates a container name based on the project folder name and service name. Since your root project folder is **`dicom-diagnosis`**, the backend container name is likely:

```sh
dicom-diagnosis-backend-1
```

To confirm, run:

```sh
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
```

Look for the backend service name, which should appear as `dicom-diagnosis-backend-1`.

### **Run the seeding script inside the backend container**

Once you confirm the backend container name, run:

```sh
docker exec -it dicom-diagnosis-backend-1 npm run seed
```

📌 **Explanation:**

- `docker exec -it dicom-diagnosis-backend-1` enters the backend container.
- `npm run seed` runs the seeding script to populate the database.

After running this command, the **admin account will be created**.

---

## **5️⃣ Access the Application**

Now that everything is running, you can access the services at `http://localhost:3000`

---

## **6️⃣ Stopping and Restarting the Containers**

To **stop** all running containers:

```sh
docker-compose down
```

To **restart** the project:

```sh
docker-compose up -d
```

---

## **7️⃣ Troubleshooting**

📌 **Check logs for any errors:**

```sh
docker logs backend  # View backend logs
docker logs frontend # View frontend logs
docker logs mongodb  # View database logs
docker logs sybil # View sybil logs
```

📌 **If containers are not starting properly, try rebuilding:**

```sh
docker-compose down
docker-compose up --build -d
```

📌 **Check if services are running inside Docker network:**

```sh
docker network inspect moobbot
```
