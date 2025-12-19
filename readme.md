# 📘The Dynamic Vision - Student Management System

Live link : https://the-dynamic-vision.onrender.com/home \
A complete web-based student management system for coaching centers.
Built with **Node.js, Express, MongoDB, and EJS**.

> Designed to automate student records, payment tracking, and monthly fees — with GitHub Actions automation.

## Project Overview

## ![image](./public/home.png)

## ![image](./public/view.png)

## 🚀 Features

- **🎓 Student Management** : Add, edit, delete student profiles, Track classes, parent details, contact info, Auto-manage monthly fee status,View all students in a clean dashboard.

- **💳 Smart Payment Tracking** : Add payments with date and amount, Automatic due calculation, Full payment history.

- **📅 Automation** : Automatically adds monthly due fees, Runs using **GitHub Actions**, Secure environment variables through **GitHub secrets**.
- **📄 Dashboard & UI** : Built with EJS templates,Responsive frontend,Clean layout for managing students.
- **🛠️ Admin Tools** : Add/remove students,Edit details,View fee status,Manage payment records.
- **💬 SMS/WhatsApp fee reminders** : Monthly fees reminder.

## **📂 Project Structure**

<pre>
├── .github
│   └── workflows
├── controllers    → Request handlers
├── middleware     → Custom middleware
├── models         → Database schemas
├── public/        → Static assets
│   ├── css
│   ├── img
│   └── js
├── routes         → Express routes
├── services
├── utils          → Helper functions
├── views/         → EJS templates
│   ├── includes
│   ├── layouts
│   └── listings
├── .env
├── .gitignore
├── index.js
├── package.json
└── package-lock.json

</pre>

## 🛠️ Tech Stack

Mobile-friendly PWA version
| Technology | Purpose |
| ----------------------- | --------------------------- |
| **Node.js** | Backend runtime |
| **Express.js** | Server framework |
| **MongoDB + Mongoose** | Database & ORM |
| **EJS Template Engine** | UI rendering |
| **GitHub Actions** | Free automated monthly fees |

## 🖼️ Screenshot

## ![image](./public/pic2.png)

## ![image](./public/addStudent.png)

## ⚙️ Installation & Setup

Follow these steps to set up and run the project locally:

1.  **Clone the Repository:**

    ```bash
    git clone https://github.com/vikrant-vikrant/Dynamic-Vision
    cd DynamicVision
    ```

2.  **Install Dependencies:**

    ```bash
    npm install
    ```

3.  **Set Up Environment Variables:**

    Configure the following environment variables by creating a .env file in the root of your project:

    Example :-

    ```bash

    #https://www.mongodb.com/ (MongoDb Atlas) (Change key)
    ATLASDB_URL=mongodb+srv://demo:kL089dndd@cluster0.kkdnvkdkds.mongodb.net/?retryWrites=true&w=majority

    #Add Random Secret Key
    SECRET=IamHereToHelpYou
    ```

    Replace the values with your specific configurations.

4.  **Run the Application:**

    ```bash
    node index.js
    ```

5.  **Open in Your Browser:**

    Open `http://localhost:8000/home` in your web browser.

## Future Enhancements

- Student attendance system

- Teacher login panel

- Admin analytics dashboard

## Author

VIKRANT \
LinkedIn : https://www.linkedin.com/in/vikrant-vikrant-0a58b636b/

## Thank You

Thank you for exploring Student Management System! Your feedback is valuable. If you have any suggestions or thoughts, feel free to share them with us. 😊 \
If you find this project helpful, don’t forget to ⭐ star the repository!

---
