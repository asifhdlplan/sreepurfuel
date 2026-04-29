const admin = require("firebase-admin");
const cors = require("cors");
const express = require("express");
const { onRequest } = require("firebase-functions/v2/https");

admin.initializeApp();

const db = admin.firestore();
const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "20kb" }));
app.use((req, _res, next) => {
  if (req.url.startsWith("/api/")) {
    req.url = req.url.slice(4);
  }
  next();
});

const sampleStations = [
  {
    id: "mawna-chowrasta-filling",
    name: "মাওনা চৌরাস্তা ফিলিং স্টেশন",
    location: "মাওনা চৌরাস্তা, শ্রীপুর, গাজীপুর",
    lat: 24.0985,
    lng: 90.4125,
    fuels: ["petrol", "octane", "diesel"]
  },
  {
    id: "sreepur-highway-pump",
    name: "শ্রীপুর হাইওয়ে পাম্প",
    location: "ঢাকা-ময়মনসিংহ মহাসড়ক, মাওনা",
    lat: 24.0958,
    lng: 90.4194,
    fuels: ["octane", "diesel"]
  },
  {
    id: "gazipur-energy-station",
    name: "গাজীপুর এনার্জি স্টেশন",
    location: "মাওনা বাজার রোড",
    lat: 24.1037,
    lng: 90.4066,
    fuels: ["petrol", "diesel"]
  },
  {
    id: "mawna-bazar-filling",
    name: "মাওনা বাজার ফিলিং",
    location: "মাওনা বাজার, শ্রীপুর",
    lat: 24.1012,
    lng: 90.4158,
    fuels: ["petrol", "octane", "diesel"]
  },
  {
    id: "sterling-filling-station-mawna",
    name: "স্টার্লিং ফিলিং স্টেশন",
    location: "মাওনা ফ্লাইওভার এলাকা, শ্রীপুর, গাজীপুর",
    lat: 24.0969,
    lng: 90.4096,
    fuels: ["petrol", "octane", "diesel"]
  },
  {
    id: "mouna-bazar-padma-dealer",
    name: "মাওনা বাজার পেট্রোল পাম্প",
    location: "মাওনা বাজার, শ্রীপুর, গাজীপুর",
    lat: 24.1018,
    lng: 90.4132,
    fuels: ["petrol", "octane", "diesel"]
  },
  {
    id: "jaina-bazar-filling-station",
    name: "জৈনা বাজার ফিলিং স্টেশন",
    location: "জৈনা বাজার, শ্রীপুর, গাজীপুর",
    lat: 24.0731,
    lng: 90.4277,
    fuels: ["petrol", "octane", "diesel"]
  },
  {
    id: "telihati-filling-station",
    name: "তেলিহাটি ফিলিং স্টেশন",
    location: "তেলিহাটি, শ্রীপুর, গাজীপুর",
    lat: 24.1239,
    lng: 90.4308,
    fuels: ["petrol", "diesel"]
  },
  {
    id: "rajendrapur-highway-filling",
    name: "রাজেন্দ্রপুর হাইওয়ে ফিলিং স্টেশন",
    location: "রাজেন্দ্রপুর, গাজীপুর",
    lat: 24.0065,
    lng: 90.3899,
    fuels: ["petrol", "octane", "diesel"]
  },
  {
    id: "sreepur-pourashava-filling",
    name: "শ্রীপুর পৌরসভা ফিলিং স্টেশন",
    location: "শ্রীপুর পৌর এলাকা, গাজীপুর",
    lat: 24.2015,
    lng: 90.4803,
    fuels: ["petrol", "octane", "diesel"]
  }
];

app.get("/stations", async (_req, res) => {
  const snapshot = await db.collection("stations").get();
  if (snapshot.empty) {
    await seedStations();
    return res.json(sampleStations);
  }
  res.json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
});

app.get("/updates/:station_id", async (req, res) => {
  const snapshot = await db
    .collection("updates")
    .where("stationId", "==", req.params.station_id)
    .orderBy("createdAt", "desc")
    .limit(25)
    .get();

  res.json(snapshot.docs.map((doc) => serializeUpdate(doc.id, doc.data())));
});

app.post("/update", async (req, res) => {
  const payload = validateUpdate(req.body);
  if (!payload.valid) {
    return res.status(400).json({ message: payload.message });
  }

  const update = {
    stationId: req.body.stationId,
    fuelType: req.body.fuelType,
    status: req.body.status,
    refillTime: String(req.body.refillTime || "").slice(0, 120),
    comment: String(req.body.comment || "").slice(0, 500),
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const created = await db.collection("updates").add(update);
  res.status(201).json({ id: created.id, ...update, createdAt: new Date().toISOString() });
});

function validateUpdate(body) {
  const fuelTypes = ["petrol", "octane", "diesel"];
  const statuses = ["available", "low", "empty"];
  if (!body || typeof body !== "object") {
    return { valid: false, message: "অনুরোধটি সঠিক নয়।" };
  }
  if (!body.stationId || typeof body.stationId !== "string") {
    return { valid: false, message: "স্টেশন নির্বাচন করুন।" };
  }
  if (!fuelTypes.includes(body.fuelType)) {
    return { valid: false, message: "সঠিক জ্বালানির ধরন নির্বাচন করুন।" };
  }
  if (!statuses.includes(body.status)) {
    return { valid: false, message: "সঠিক স্ট্যাটাস নির্বাচন করুন।" };
  }
  return { valid: true };
}

function serializeUpdate(id, data) {
  return {
    id,
    ...data,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null
  };
}

async function seedStations() {
  const batch = db.batch();
  sampleStations.forEach((station) => {
    batch.set(db.collection("stations").doc(station.id), station, { merge: true });
  });
  await batch.commit();
}

exports.api = onRequest({ region: "asia-south1" }, app);
