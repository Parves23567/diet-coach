# My Diet & Nutrition Coach: GitHub + Vercel + Firebase

## ফাইল তালিকা
- `index.html` : পুরো অ্যাপ (Firebase config ভেতরে বসানো আছে)
- `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png` : হোম স্ক্রিনে অ্যাপের মতো ইনস্টল
- `api/ai.js` : AI প্রক্সি (Vercel ফাংশন), Anthropic key এখানে সার্ভারে থাকে
- `firestore.rules` : Firestore নিরাপত্তা নিয়ম (Firebase Console-এ পেস্ট করতে হবে)
- `vercel.json` : ছোট কনফিগ

## ধাপ ১: GitHub
1. github.com এ নতুন রিপো বানান, নাম `diet-coach`। Private রাখতে পারেন।
2. "Add file" > "Upload files" দিয়ে `index.html`, `manifest.webmanifest`, `sw.js`, `icon-192.png`, `icon-512.png`, `vercel.json` আপলোড করুন। Commit করুন।
3. `api/ai.js` ফোল্ডারসহ লাগবে। "Add file" > "Create new file" চাপুন। নামের ঘরে `api/ai.js` লিখুন (স্ল্যাশ দিলে ফোল্ডার বানাবে)। ফাইলের লেখা পেস্ট করে Commit করুন।

## ধাপ ২: Vercel
1. vercel.com এ GitHub দিয়ে সাইন আপ করুন (Hobby, ফ্রি)।
2. "Add New" > "Project" > `diet-coach` রিপো Import করুন।
3. Framework: "Other" থাকুক। কিছু বদলাবেন না। Deploy চাপুন।
4. Deploy শেষে ডোমেইন পাবেন, যেমন `diet-coach-xxxx.vercel.app`।

## ধাপ ৩: Firebase
1. Firebase Console > Authentication > Settings > Authorized domains > "Add domain"। Vercel ডোমেইনটি (`diet-coach-xxxx.vercel.app`) যোগ করুন। এটা না করলে Google লগইন চলবে না।
2. Authentication > Sign-in method > Google চালু আছে কি দেখুন।
3. Firestore Database > Rules ট্যাবে `firestore.rules` এর লেখা পেস্ট করে Publish করুন।

## ধাপ ৪: AI চালু (Vercel Environment Variables)
Vercel > প্রজেক্ট > Settings > Environment Variables:
- `ANTHROPIC_API_KEY` = আপনার Anthropic API key (console.anthropic.com)
- `ALLOWED_EMAILS` = আপনার Google ইমেইল (একাধিক হলে কমা দিয়ে)
- `MAX_PER_DAY` = 60 (ঐচ্ছিক, দিনে সর্বোচ্চ অনুরোধ)

এরপর Deployments > সর্বশেষটির ⋯ > Redeploy করুন।
key কখনো GitHub-এ বা অ্যাপের কোডে রাখবেন না।

## ব্যবহার
- ডোমেইন খুলে "Google দিয়ে লগইন" চাপুন। তথ্য ক্লাউডে সেভ হবে।
- Chrome মেনু > "Add to Home screen" দিলে অ্যাপ আইকন বসবে।
- AI চ্যাট আর খাবারের ছবির পুষ্টি বিশ্লেষণ লগইনের পর চলবে। খরচ আপনার Anthropic অ্যাকাউন্ট থেকে যাবে।

## নোট
- Firebase config (apiKey ইত্যাদি) প্রকাশ্য থাকা স্বাভাবিক। নিরাপত্তা আসে Firestore Rules আর `ALLOWED_EMAILS` থেকে।
- আপডেট করতে GitHub-এ `index.html` বদলালে Vercel নিজে ডিপ্লয় করবে।
