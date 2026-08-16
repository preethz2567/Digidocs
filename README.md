# DigiDocs

> **Pronunciation:** /ˈdɪdʒɪdɒks/ (dih-jih-docs)

DigiDocs is a modern, enterprise-grade document management system designed to make storing, finding, and sharing your files completely frictionless. Built with a robust Java/Spring Boot backend and a lightning-fast React frontend, DigiDocs provides a seamless, dynamic user experience with high performance.

##  Key Features

* **Advanced Document Management:** Upload, rename, star, and delete documents with ease.
* **Intelligent Soft Deletion (Trash):** Accidental deletions are a thing of the past. Deleted files go to a recycle bin where they can be restored or permanently purged.
* **In-App Rich Previews:** View PDFs and images directly inside the application—no need to download files just to see what they are!
* **Secure File Sharing:** Generate secure, expiring share links for any document, and easily revoke access at any time.
* **Bulk Actions:** Select multiple documents to download as a single `.zip` file, delete in bulk, or share instantly.
* **Custom Context Menus:** Right-click any document to access quick actions just like a native desktop application.
* **Flexible Views:** Toggle between a dense List view and a highly visual Grid view.

## 🛠️ Tech Stack

### Frontend
* **React 18** (Vite)
* **TypeScript**
* **Lucide React** (Icons)
* **Zustand** (State Management)
* **React Router DOM** (Navigation)

### Backend
* **Java 21**
* **Spring Boot 3.x**
* **Spring Security & JWT** (Authentication)
* **Spring Data JPA** (Database ORM)
* **H2 Database** (Local Storage / Embedded)
* **Maven** (Build Tool)

##  Getting Started

### Prerequisites
- Node.js (v18+)
- Java 21 JDK
- Maven (or use the included wrapper)

### Running the Backend

1. Navigate to the `backend` directory.
2. Compile and run the Spring Boot application:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
3. The API will start on `http://localhost:8080`.

### Running the Frontend

1. Navigate to the `frontend` directory.
2. Install dependencies and start the development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. The application will start on `http://localhost:5173`.
