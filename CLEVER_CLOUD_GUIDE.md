# 🚀 SmartPark PSSMS - Clever Cloud Deployment Guide

This guide explains how to host your Backend and Database on **Clever Cloud** and your Frontend on **Vercel/Netlify**.

---

## 1️⃣ Phase 1: Create MySQL Database
1. Log in to [Clever Cloud](https://console.clever-cloud.com/).
2. Click **"Create..."** -> **"An add-on"**.
3. Select **MySQL**.
4. Choose the **Free Plan (DEV)**.
5. Name it `smartpark-db` and click **Create**.
6. **IMPORTANT**: Go to the "Information" tab and copy these variables:
   - `MYSQL_ADDON_HOST`
   - `MYSQL_ADDON_USER`
   - `MYSQL_ADDON_PASSWORD`
   - `MYSQL_ADDON_DB`
   - `MYSQL_ADDON_PORT`

---

## 2️⃣ Phase 2: Deploy Backend (Node.js)
1. Click **"Create..."** -> **"An application"**.
2. Select **Node.js**.
3. Link your GitHub repository.
4. Select the **`backend-project`** folder (Clever Cloud will ask for the deployment path).
5. In the **Environment Variables** tab, add:
   - `DB_HOST`: (Paste `MYSQL_ADDON_HOST`)
   - `DB_USER`: (Paste `MYSQL_ADDON_USER`)
   - `DB_PASSWORD`: (Paste `MYSQL_ADDON_PASSWORD`)
   - `DB_NAME`: (Paste `MYSQL_ADDON_DB`)
   - `DB_PORT`: (Paste `MYSQL_ADDON_PORT`)
   - `PORT`: `8080` (Clever Cloud uses 8080 by default)
6. Click **Deploy**.
7. Once finished, copy your Backend URL (e.g., `https://app-xxxx.cleverapps.io`).

---

## 3️⃣ Phase 3: Deploy Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/).
2. Click **"Add New"** -> **"Project"**.
3. Import your GitHub repository.
4. Select the **`frontend-project`** folder as the root.
5. In the **Environment Variables** section, add:
   - `VITE_API_URL`: (Paste your Clever Cloud Backend URL)
6. Click **Deploy**.

---

## 4️⃣ Phase 4: Initialize the Cloud DB
1. Open your Clever Cloud MySQL dashboard.
2. Use a tool like **PHPMyAdmin** (built into Clever Cloud) or **MySQL Workbench**.
3. Copy the content of your `pssms_schema.sql` and execute it in the SQL tab of the cloud database.
4. Run the `reset_passwords.js` locally but update the `.env` temporarily with the Cloud DB credentials to set the admin passwords on the cloud.

---

## ✅ Success!
Your system is now live. 
- The **Assessor** can access the Frontend URL.
- The **Frontend** talks to the **Clever Cloud Backend**.
- The **Backend** stores data in the **Clever Cloud MySQL**.
