const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const bodyParser = require("body-parser");

// Inisialisasi Firebase
const serviceAccount = require("./serviceAccountKey.json"); // Download dari Firebase Console
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
app.use(cors());
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
