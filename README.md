# DAO AI Assistant

An AI-powered dApp that simplifies DAO governance through intelligent proposal summarization and drafting, powered by local open-source AI models.

---

## ✨ Core Features

### 🔗 **Web3 & Blockchain**
- **Wallet Connection**: Seamless integration with MetaMask and other Web3 wallets.
- **Network Detection**: Automatically identifies the connected blockchain network.
- **On-Chain History**: Persist chat history and important conversations to the blockchain via smart contracts.
- **Fee System**: Simple on-chain fee mechanism for data storage, with discounts for premium users.

### 🤖 **AI-Powered Capabilities**
- **Proposal Summarization**: Uses advanced AI to generate concise summaries of complex DAO proposals.
- **Proposal Drafting**: Helps users craft well-structured governance proposals from simple ideas.
- **Local First AI**: Privacy-focused by design, using local Ollama integration to run open-source models.
- **Multiple Model Support**: Flexibility to choose between different AI models like `Gemma`, `Llama3`, and `Qwen`.

### 🎨 **Modern UI/UX**
- **Responsive Design**: Fully responsive, mobile-first interface that works on any device.
- **Streaming Responses**: ChatGPT-like streaming for real-time AI feedback.
- **Engaging Loaders**: Dynamic and informative loading indicators.
- **Intuitive Navigation**: Clean, tab-based navigation with a persistent header.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Ollama

Install Ollama from [https://ollama.ai](https://ollama.ai)

Pull a recommended model (choose one based on your hardware):

```bash
# For systems with 8GB+ VRAM (recommended)
ollama pull llama3.1:8b-instruct

# For lower-end systems (4GB+ VRAM)
ollama pull phi3.5:3.8b-instruct

# For systems with 16GB+ VRAM (best performance)
ollama pull qwen2:7b-instruct
```

Start Ollama server:

```bash
ollama serve
```

Verify Ollama is running by visiting: http://localhost:11434

### 3. Start the Development Environment

In a single terminal, run the following command to start the frontend, backend, and websocket servers:

```bash
./start-dev-env.bat
```

This will open separate windows for each service.

### 4. Open the Application

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### Connecting Your Wallet

1. Click "Connect Wallet" in the application
2. Approve the connection in MetaMask
3. Your wallet address and network will be displayed

### Summarizing Proposals

1. Navigate to the "Summarize Proposal" tab
2. Paste a DAO proposal text into the textarea
3. Click "🤖 Generate Summary"
4. Review the AI-generated summary highlighting key points

### Drafting Proposals

1. Navigate to the "Draft Proposal" tab
2. Enter a title (optional) and your proposal ideas
3. Click "🤖 Generate Proposal"
4. Review and copy the structured proposal draft

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Ollama API Configuration
OLLAMA_API_URL=http://localhost:11434

# Server Configuration
PORT=3001

# Optional: Specify default model name
DEFAULT_MODEL=llama3.1:8b-instruct
```

### Model Selection

You can use different models by modifying the `DEFAULT_MODEL` in your environment file. Recommended models:

- **llama3.1:8b-instruct** - Best overall performance
- **qwen2:7b-instruct** - Excellent for summarization
- **phi3.5:3.8b-instruct** - Most efficient for lower-end hardware
- **deepseek-r1:7b** - Best for reasoning tasks

## Project Structure

```
dao-ai-assistant/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── WalletConnection.tsx
│   ├── ProposalSummarizer.tsx
│   └── ProposalDrafter.tsx
├── server/                # Express API server
│   └── index.js          # Main server file
├── package.json
├── tailwind.config.js
└── next.config.js
```

## API Endpoints

The backend server exposes the following endpoints:

- `GET /health` - Health check
- `POST /api/summarize-proposal` - Generate proposal summary
- `POST /api/draft-proposal` - Generate proposal draft
- `GET /api/ollama-status` - Check Ollama connection and available models

## Troubleshooting

### Common Issues

**1. "Unable to connect to Ollama"**
- Ensure Ollama is installed and running: `ollama serve`
- Check if the service is accessible: `curl http://localhost:11434/api/tags`
- Verify the model is pulled: `ollama list`

**2. "Request timed out"**
- Large texts or complex requests may take 30-120 seconds
- Ensure your system has sufficient RAM/VRAM for the model
- Try a smaller model if performance is poor

**3. "Wallet connection failed"**
- Ensure MetaMask is installed and unlocked
- Try refreshing the page
- Check browser console for detailed error messages

**4. Models not loading**
- Pull the model manually: `ollama pull model-name`
- Check available models: `ollama list`
- Ensure sufficient disk space (models are 2-8GB+)

### Hardware Requirements

**Minimum Requirements:**
- 8GB RAM
- 4GB available disk space
- Modern CPU (Intel i5 or AMD Ryzen 5 equivalent)

**Recommended Requirements:**
- 16GB RAM
- 8GB VRAM (for GPU acceleration)
- 10GB available disk space
- NVIDIA RTX 3060 or equivalent

## Development

### Adding New Features

1. **New AI Endpoints**: Add routes in `server/index.js`
2. **UI Components**: Create new components in `components/`
3. **Styling**: Use Tailwind CSS classes, extend in `tailwind.config.js`

### Testing

Test the application with the provided sample content:

1. Use the "Load Sample Proposal" button in the Summarizer
2. Use the "Load Sample Ideas" button in the Drafter
3. Test with different model configurations

## Deployment

### Frontend Deployment (Vercel/Netlify)

```bash
npm run build
```

Deploy the `out/` directory to your preferred platform.

### Backend Deployment

The backend requires a server environment with Ollama installed. For production:

1. Set up a VPS with GPU support
2. Install Ollama and pull required models
3. Deploy the Express server
4. Update frontend API endpoints

## 🗺️ Project Roadmap

For a detailed look at our future plans, including advanced features and long-term vision, please see our [Project Roadmap](ROADMAP.md).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- **Ollama** for providing excellent local AI model hosting
- **Meta's Llama** models for powerful open-source AI
- **Ethers.js** for Web3 integration
- **Next.js** and **Tailwind CSS** for the frontend framework

---

**Note**: This application runs AI models locally for privacy and independence from cloud services. Ensure your hardware meets the requirements for optimal performance. 