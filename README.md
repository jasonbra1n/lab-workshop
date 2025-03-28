# LAB: Digital Workshop

Welcome to **LAB: Digital Workshop**, an open-source single-page application (SPA) by [Jason Brain](https://jasonbrain.com). This project is a creative sandbox featuring a growing collection of interactive tools designed to help you work, learn, rest, and play—all in one place. Hosted at [lab.jasonbrain.com](https://lab.jasonbrain.com), it’s built with HTML, CSS, and JavaScript, and styled with a light/dark theme toggle for accessibility.

## Features

- **Modular Toolset:** Tools are organized into four pillars:
  - **Factory (Work 🔧):** Productivity-focused utilities.
  - **Classroom (Learn 📚):** Educational and insightful calculators.
  - **Retreat (Rest 🌿):** Relaxing tools (coming soon).
  - **Arcade (Play 🎮):** Fun, interactive experiences.
- **Responsive Design:** Works seamlessly on desktop and mobile.
- **Theme Support:** Switch between light and dark modes with a single click.
- **Analytics:** Tracks usage via Google Analytics and AdSense integration.

## Current Tools

### Factory: Work Tools
- **Image to WebP Converter:** Convert images to WebP format with drag-and-drop support and ZIP download.
- **Year Progress Calculator:** Visualize your year’s progress with a dynamic chart.
- **Days Between Dates:** Calculate the number of days between two dates, with an option to include the end date.
- **Math Calculator:** Perform basic arithmetic operations with history and clipboard support.
- **DJ Audio Visualizer:** Create audio visualizations (in development).

### Classroom: Learn Tools
- **Life Path Calculator:** Compute your numerology-based life path number and personality traits.
- **Gematria Calculator:** Calculate gematria values for words using multiple systems, with customizable options and reduced value display.

### Retreat: Rest Tools
- *Coming soon...*

### Arcade: Play Tools
- **DJ Audio Visualizer:** Create audio visualizations (in development).
- **Radio Stream Player:** Stream your favorite radio stations, including ETN-FM, Psyndora Psytrance, Proton Radio (Melodic House), and PsyStation Progressive Psytrance, with play/pause and volume controls.

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, etc.).
- Optional: Git and a local server (e.g., `live-server`) for development.

### Installation
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/[your-username]/lab-digital-workshop.git
   cd lab-digital-workshop
   ```
2. **Open Locally:**
   - Open `index.html` in a browser, or
   - Use a local server: `npx live-server` (requires Node.js).
3. **Explore:**
   - Click the pillar buttons (Work 🔧, Learn 📚, Rest 🌿, Play 🎮) to reveal tools.
   - Select a tool to load it dynamically into the console area.

### Deployment
- Hosted via GitHub Pages at `lab.jasonbrain.com`. To deploy your own:
  1. Push to your GitHub repository.
  2. Enable GitHub Pages in Settings > Pages, selecting the `main` branch and `/` (root).

## Contributing

Contributions are welcome! Whether it’s adding new tools, fixing bugs, or enhancing the UI:
1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-tool-name`.
3. Add your tool in the `tools/` folder (follow the structure: `index.html`, `script.js`, `styles.css`).
4. Update `index.html` to include your tool in the appropriate pillar.
5. Submit a pull request with a description of your changes.

## License

This project is open-source under the [MIT License](LICENSE). Feel free to use, modify, and share!

## Contact

Created by Jason Brain. Reach out via [jasonbrain.com](https://jasonbrain.com) or open an issue here on GitHub.
