const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const bodyParser = require("body-parser");

// Inisialisasi Firebase
const serviceAccount = {
    "type": "service_account",
    "project_id": "imicid",
    "private_key_id": "2af1b22a965dfa7fc37e72975af8861a77c158fb",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDEFgmtIv8UBANN\nA5Di3cgCU54r3TFOZTWAakdXDDnEz+oep5DFhfY2Zw0ZJ7KUVStcJvSjAZeS3bXk\nah1t9Tvtgt1+AzwYSEXHjzVOcL8kUeZwzF7gIyN9A+FP3QuwRBsakKFC5HXVxXQg\nKFRhKE6iO/zSr8UqawqMlk/D9w4gHHffnq2vJJVnslmUFnNqsVWqGN/lmWzAeFRY\nSilBBu3rwfB5zp1Yp5DOraCHOZA02FpVuZqRpvaHOFdWhhJXXjDj+cTmxRkb4nj2\neFmuUf0tHtB/IeVGCrwqlk70+SWdm41WPSGc1gw6EPmVtTkiUDWVPK0kWQUfo7UR\nYk5LbaT5AgMBAAECggEACrYZeTe8L1+4vnA/beUnk9j1fvfqRZoJviYQF5U3YqTo\n6RvGMMQMmxQuBv3AJ5IveC04l97yZLdvxDZ3vRX0XBkV+Fg85CauiSQtiUdnaZh/\nuhGv7RZ+Tcn0eOReSxatVFoqNPk95puOqGMLmPMWuI4GVYv8fUCzptJfMRlB0Ecl\nWWkSk7AqjAtYIHd/n44fFq9tgqkAq5otu5Msu6KYanGXUC3V/6eJItmXdmRau+qC\nGPFCcKbulzZfUKWjTnD2OSjx+WurhsNH9vAOjHlYsEFmJiF3C03a+6x3fCua1QAh\nmjXA6KLeExgB4P7oQIBPA//Wv7oqRyzSAccaesUFcQKBgQDk4Iso/dcKex8vtESa\nuSZVxtkDVJZ9Lpy0m8sNglT/KhXb4P67Yn26XmRdsEXHZuupjPPG1VW8wZADPxDw\nBoxGaC1aUs6sVMUez4qltoJBc8n9XInZHZ55A8BNWUZf1nCEf4AC+htn8v0KM8t8\n2SuDGgPvdNHYle5CuIini7bjkwKBgQDbUrX8fHoBCnkfTfgrI4urKgF+Bq11rR0H\nuiSzJEj0ZyRf+7KNMGeQedD2LxBOphO7sV0u1/bkqrOWzrylUDqOg93tIEmXy32M\n6Ekgn29BwlXMBJaIhwkhk5FrG+gL0Bv5gvobmrxzOcV+Cp3Y7m4+Cy2s1zioS2r+\nUVV8SDAEwwKBgQCn/BqHUo/TdHx2QeQcf4ogaNr8s8fkRyLi+Hm3B5Kk2VnD0UaF\neAt5jzAxB2Cfsu2Cux5tMEVGTfcKOu6OjO/F+U5YPfDM0UcAjyle6S5/JaH6IEJY\npYGbpmItIzoguz5IMWBeTv1wdQq9wzg2ARsLlTuQM/iU8641MEW0Wzo3mwKBgHSU\nno+7Ss7K1l9BfqzPlCpDhc+LlSB8CHZXB7MBkpX3TWqHy/0owaQWXHC/y5dCyDJ4\nsON5gI9D/XooIjZtUvL2PT0ScIvzaqU/w79HgEggGKL9vVaNENl8K0wX5VyCHpye\ndnu94HYPO18oHYd2Fbt9DaZWMJOkoxbT/PC3Hm8pAoGAMzcKeVbPDFz6sSDls8PP\nGeuuRLn5dAGCdlQiIx7TF1q0F6b1RJQbRQwojYLlLgUrXnWCuhLRrZr+0aHNRx5r\npLhoq/+ABnlKRa2eQ7Sr189nxYEOgJtFE4yU38TC0K+eI7gjrW7BPrPjVlmASODx\nJ+mgCPPwKZIivHMfzNN1lfk=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@imicid.iam.gserviceaccount.com",
    "client_id": "112014896506141502069",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40imicid.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
app.use(cors({
    origin: "https://imicid.netlify.app", // Ganti dengan domain frontend kamu
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true
}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "https://imicid.netlify.app");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.use(bodyParser.json());

// **Generate random slug jika tidak diberikan custom slug**
function generateSlug() {
    return Math.random().toString(36).substr(2, 6);
}

// **API untuk membuat short link**
app.post("/shorten", async (req, res) => {
    const { long_url, custom_slug } = req.body;
    let slug = custom_slug || generateSlug();

    // **Cek apakah slug sudah digunakan**
    const doc = await db.collection("short_links").doc(slug).get();
    if (doc.exists) {
        return res.status(400).json({ error: "Slug sudah digunakan!" });
    }

    // **Simpan link di Firestore**
    await db.collection("short_links").doc(slug).set({
        long_url,
        created_at: admin.firestore.Timestamp.now(),
    });

    res.json({ short_url: `https://imicidbe.vercel.app/${slug}` });
});

// **Redirect short link ke URL asli**
app.get("/:slug", async (req, res) => {
    const slug = req.params.slug;
    const doc = await db.collection("short_links").doc(slug).get();

    if (!doc.exists) {
        return res.status(404).send("Link tidak ditemukan!");
    }

    res.redirect(doc.data().long_url);
});

app.listen(3000, () => console.log("Server running on port 3000"));
