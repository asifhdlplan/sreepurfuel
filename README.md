# Fuel Update Mawna Sreepur

মাওনা, শ্রীপুর এলাকার ফিলিং স্টেশনগুলোর জ্বালানি availability দেখার এবং ব্যবহারকারীর লাইভ আপডেট নেওয়ার Bangla-first web app।

## ফিচার

- Leaflet map with Mawna default center
- Bangla UI, labels, form messages, popup and admin table
- Firestore live listeners for real-time updates
- Station search, fuel filter and nearby station button
- Color status: সবুজ = স্টক আছে, হলুদ = কম, লাল = নেই
- Firebase Functions API:
  - `GET /stations`
  - `GET /updates/:station_id`
  - `POST /update`

## Firebase সেটআপ

1. Firebase Console থেকে একটি project তৈরি করুন।
2. Firestore Database চালু করুন।
3. `index.html`-এর `firebaseConfig` object-এ নিজের config বসান।
4. Firebase CLI login ও project select করুন:

```bash
firebase login
firebase use --add
```

5. Functions dependencies install করুন:

```bash
cd functions
npm install
cd ..
```

6. Deploy করুন:

```bash
firebase deploy
```

## Google Maps

`index.html`-এ `googleMapsApiKey` variable-এ Google Maps JavaScript API key বসালে marker, Bangla popup, এবং Places nearby gas station discovery চালু হবে। key না থাকলে app Google Maps embed search view দেখাবে, যাতে Mawna/Sreepur/Gazipur এলাকার filling station search result দেখা যায়।

Google Cloud Console-এ এই API গুলো enable করুন:

- Maps JavaScript API
- Places API

## Vercel Frontend

Frontend static, তাই Vercel-এ repo import করলেই `index.html` serve করা যাবে। Firebase config বসানো থাকলে Vercel frontend থেকেও Firestore live updates কাজ করবে।

## API ব্যবহার

Firebase Hosting rewrite থাকলে API path:

```text
/api/stations
/api/updates/mawna-chowrasta-filling
/api/update
```

Cloud Function direct URL ব্যবহার করলে endpoint-এর শেষে একই route বসাতে হবে।
