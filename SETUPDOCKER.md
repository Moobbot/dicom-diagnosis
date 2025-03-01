## **🚀 Setup and Run the Project with Docker**

### **1️⃣ Clone the Repository**
Start by cloning the repository to your local machine:

```sh
git clone --recurse-submodules https://github.com/Moobbot/dicom-diagnosis.git
cd dicom-diagnosis
```

---

### **2️⃣ Build and Run the Docker Containers**
Before running the application, you need to create `.env` files for both the frontend and backend. 

Now, build and start all services using Docker:

```sh
docker-compose up --build -d
```

📌 **Explanation:**
- `--build` ensures that Docker rebuilds images if there are changes.
- `-d` runs the containers in detached mode (in the background).

---

### **3️⃣ Verify Running Containers**
To check if all services are running correctly:

```sh
docker ps
```

If everything is set up properly, you should see the backend, frontend, database, and any other services running.

---

### **4️⃣ (First-time setup) Seed the Database**

If this is your first time running the project, you need to seed the database to create an **admin account**.

#### **Find the correct backend container name**
Docker automatically generates a container name based on the project folder name and service name. Since your root project folder is **`dicom-diagnosis`**, the backend container name is likely:

```sh
dicom-diagnosis-backend-1
```

To confirm, run:
```sh
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
```
Look for the backend service name, which should appear as `dicom-diagnosis-backend-1`.

#### **Run the seeding script inside the backend container**
Once you confirm the backend container name, run:

```sh
docker exec -it dicom-diagnosis-backend-1 npm run seed
```

📌 **Explanation:**
- `docker exec -it dicom-diagnosis-backend-1` enters the backend container.
- `npm run seed` runs the seeding script to populate the database.

After running this command, the **admin account will be created**.

---

### **5️⃣ Access the Application**
Now that everything is running, you can access the services at `http://localhost:3000`


---

### **6️⃣ Stopping and Restarting the Containers**
To **stop** all running containers:

```sh
docker-compose down
```

To **restart** the project:

```sh
docker-compose up -d
```

---

### **7️⃣ Troubleshooting**
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