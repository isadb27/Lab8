# 🎨 Meme Gallery - Web Application

## 📝 Description
This dynamic web application allows users to upload, store, and view memes in an interactive gallery. The project uses modern technologies to provide a smooth and attractive experience.

## 🚀 Main Features
- Image (meme) upload functionality
- Interactive visual gallery
- Cloud storage with Supabase Storage
- Dual deployment on Firebase Hosting and Netlify
- Development with TypeScript and Web Components

## 🛠️ Technologies Used
- **TypeScript**: Main programming language
- **Web Components**: For creating reusable web components
- **Supabase Storage**: Cloud file storage
- **Firebase Hosting**: Deployment and hosting
- **Netlify**: Alternative deployment and CDN

## 📋 Prerequisites
- Node.js (version 14 or higher)
- npm or yarn
- Supabase account
- Firebase account
- Netlify account

## ⚙️ Project Setup

### Installation
```bash
# Clone the repository
git clone [REPOSITORY_URL]

# Install dependencies
npm install
```

### Environment Variables
Create a `.env` file in the project root:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

## 🚀 Deployment

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Deploy
firebase deploy
```

### Netlify
1. Connect the repository with Netlify
2. Configure environment variables
3. Deploy automatically from the main branch

## 💻 Local Development
```bash
# Initialize project
npm init
```

## 🤝 Contributing
Contributions are welcome. Please follow these steps:
1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 👥 Authors
- [Your Name]

## 🙏 Acknowledgments
- Supabase for storage services
- Firebase and Netlify for hosting services 