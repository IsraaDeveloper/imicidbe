const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const bodyParser = require("body-parser");

// Inisialisasi Firebase
const serviceAccount = {
  type: "service_account",
  project_id: process.env.project_id,
  private_key: process.env.private_key.replace(/\\n/g, '\n'),
  client_email: process.env.client_email,
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
