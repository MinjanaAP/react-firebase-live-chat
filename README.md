# React Firebase Live Chat with Push Notifications

🚀 A real-time **Live Chat** application built with **React** and **Firebase**, featuring **Google Authentication**, **Firestore for messages**, and **Push Notifications** using Firebase Cloud Messaging (FCM).

![Live Chat Preview](https://your-image-link.com) *(Replace with actual image link)*

---

## **📢 Features**
✅ Google Login Authentication  
✅ Real-time messaging using Firestore  
✅ Push Notifications using Firebase Cloud Messaging (FCM)  
✅ Responsive and modern UI  
✅ Typing status indicator  
✅ User presence detection  

---

## **🚀 Getting Started**

### **1️⃣ Clone the Repository**
```bash
git clone https://github.com/MinjanaAP/react-firebase-live-chat.git
cd react-firebase-live-chat
```

### **2️⃣ Install Dependencies**
```bash
npm install
```

### **3️⃣ Setup Firebase**
1. Go to the [Firebase Console](https://console.firebase.google.com/).  
2. Create a new project and enable Firestore, Authentication, and Cloud Messaging (FCM).  
3. Get your Firebase config and add it to a `.env` file:  

```env
REACT_APP_API_KEY=your_api_key
REACT_APP_AUTH_DOMAIN=your_auth_domain
REACT_APP_PROJECT_ID=your_project_id
REACT_APP_STORAGE_BUCKET=your_storage_bucket
REACT_APP_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_APP_ID=your_app_id
```

---

## **📡 Firebase Configuration**

### **🔹 Authentication (Google Sign-In)**
1. Enable **Google Authentication** in Firebase Console.  
2. Install Firebase in the project:  
   ```bash
   npm install firebase
   ```

### **🔹 Firestore Database (Real-time Messages)**
1. Create a `messages` collection in Firestore.  
2. Add a document structure like:  

```json
{
    "senderId": "user123",
    "receiverId": "user456",
    "message": "Hello!",
    "timestamp": 1742806163
}
```

### **🔹 Firebase Cloud Messaging (Push Notifications)**
1. Enable Firebase Cloud Messaging (FCM).  
2. Add your FCM **Server Key** to Firebase Functions.  
3. Implement the **service worker** for push notifications.

---

## **🔥 Running the App**
```bash
npm start
```
Open **http://localhost:5173/** in your browser.

---

## **🚀 Deploying to Firebase Hosting**
```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

---

## **📄 Blog Post & Documentation**
Read the full step-by-step guide: **[Insert Blog Link]**

---

## **🤝 Contributing**
Feel free to fork this repository, submit issues, and create pull requests!

---

## **📜 License**
This project is **open-source** under the **MIT License**.

---

