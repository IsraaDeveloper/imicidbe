const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const bodyParser = require("body-parser");

// Inisialisasi Firebase
admin.initializeApp({
        credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
        universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
    }),
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

    res.json({ short_url: `https://imicid.my.id/${slug}` });
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
