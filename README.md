# Scanix

Event registration + QR check-in. React/Vite/Tailwind frontend, Node/Express/MongoDB backend.

## Requirements
- Node 18+ (20+ recommended)
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

## Run (two terminals)

    cd backend
    cp .env.example .env
    npm install
    npm run dev          # http://localhost:5000

    cd frontend
    npm install
    npm run dev          # http://localhost:5173

Vite proxies `/api` to the backend, so no frontend env is needed locally.

## Try it
1. Open http://localhost:5173 -> "Host an event" -> create an event.
2. Copy the registration link, open it, register, and get the QR.
3. On the host page click "Open scanner" and scan the QR.
   Scan again -> "Already Checked In". Scan any other QR -> "Invalid QR".

Camera access works on `localhost` on the same computer. To test the scanner on a phone you need HTTPS (ngrok / Cloudflare Tunnel / deployed build).

## Host key
Creating an event returns a secret `hostKey`, placed in the private host URL (`/host/:id?key=...`).
The scan endpoint requires it (`x-host-key` header). Bookmark that URL; it is shown only once.

## Class attendance (current main flow)
- Teacher: "Start a class" shows a QR that changes every `QR_ROTATE_SECONDS` (default 2) seconds, and a scan is accepted for `QR_GRACE_SLOTS` more slots (default 4, so a scan counts for up to about 10 seconds), with a live list of who is present.
- Student: "Mark my attendance" -> enter name + roll number once -> scan the teacher's QR.
- To test on phones, open the app through your computer's LAN IP or an HTTPS tunnel on BOTH the teacher screen and the phones (the QR contains the teacher's page address, so `localhost` will not work for phones).
- The original event/registration pages still exist in the code but are not linked from the landing page.

## Theme
The header has a light/dark toggle. The choice is saved on the device and defaults to the phone/computer setting.
