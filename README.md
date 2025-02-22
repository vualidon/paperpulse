# PaperPulse 📚

PaperPulse is a modern web application for exploring and discussing academic papers. It features a beautiful dark/light mode interface, AI-powered paper discussions, and Obsidian note generation capabilities.

## Features 🚀

- **Paper Exploration**: Browse and search through academic papers with a modern interface
- **Smart Filtering**: Filter papers by tags, search terms, and sort by various criteria
- **Dark/Light Mode**: Beautiful theme support for comfortable reading
- **AI Discussion**: Have intelligent conversations about papers using Google's Gemini AI
- **Obsidian Notes**: Generate structured notes for your Obsidian vault
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Prerequisites 📋

Before you begin, ensure you have:
- Node.js 18+ installed
- A Google AI API key for Gemini

## Getting Started 🏁

1. Clone the repository:
```bash
git clone [<repository-url>](https://github.com/vualidon/paperpulse.git)
cd paperpulse
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_GOOGLE_API_KEY=your_google_ai_api_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production 🏗️

To create a production build:

```bash
npm run build
```

The build output will be in the `dist` directory.

## Deployment 🚀

This project can be deployed to Netlify:

1. Push your code to a Git repository
2. Connect your repository to Netlify
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add your environment variables in Netlify's dashboard
5. Deploy!

## Technology Stack 💻

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini AI
- **State Management**: TanStack Query & Zustand
- **UI Components**: Headless UI
- **Icons**: Heroicons
- **Development**: Vite

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments 🙏

- [Hugging Face](https://huggingface.co/) for the papers API
- [Google Gemini](https://ai.google.dev/) for AI capabilities
- [Tailwind CSS](https://tailwindcss.com/) for the styling system
- [Headless UI](https://headlessui.com/) for accessible components
