# 📧 Gmail AI Reply Assistant

A Chrome extension that supercharges your Gmail experience by adding an **AI-powered reply button** directly in the Gmail compose window. Choose your preferred tone and generate smart, context-aware email replies in seconds.

---

## ✨ Features

- 🤖 **AI-Generated Replies** — Automatically generates a reply based on the email you're reading
- 🎯 **Tone Selection** — Choose from three tones via a dropdown:
  - 💼 Professional
  - 😊 Friendly
  - 😎 Casual
- ⚡ **Seamless Gmail Integration** — Adds an "AI Reply" button before Gmail's Send button
- 🔒 **No extra login required** — Works directly inside Gmail

---

## 🚀 Demo

<img width="1726" height="1031" alt="Screenshot 2026-02-27 at 8 37 13 PM" src="https://github.com/user-attachments/assets/e8a2682a-f032-4e9b-abc1-5aa8174cdb3a" />
<img width="1726" height="1031" alt="Screenshot 2026-02-27 at 8 37 22 PM" src="https://github.com/user-attachments/assets/21eeaf01-1f3a-4ef0-a0d1-cd378e5dc971" />

![email_writer_demo](https://github.com/user-attachments/assets/517bcfc7-47d5-46db-95d5-c317d90082a5)

---

## 🛠️ Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Frontend  | JavaScript, Chrome Extension API |
| Backend   | Java, Spring Boot       |
| AI        | Groq API |
| Deployment | AWS EC2 |

---

## 📦 Installation (Developer Mode)

Since this extension is not yet published on the Chrome Web Store, you can install it manually:

1. **Clone this repository**
   ```bash
   git clone https://github.com/sneha1010/Email_Writer_extension.git
   ```

2. **Load the Extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer Mode** (toggle in the top right)
   - Click **"Load unpacked"**
   - Select the `email-writer-ext/` folder from this repo

4. **Open Gmail** and compose or reply to an email — you'll see the **AI Reply** button before to the Send button!

---

## 🧑‍💻 How It Works

1. User opens an email in Gmail
2. Clicks the **AI Reply** button added by the extension
3. Selects a tone from the dropdown (Professional / Friendly / Casual)
4. The extension sends the email content to the **Spring Boot backend hosted on AWS EC2**
5. The backend calls an AI API and returns a generated reply
6. The reply is automatically inserted into the Gmail compose box

> Built with ❤️ to make email replies faster and smarter.
