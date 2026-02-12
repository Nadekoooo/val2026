# Valentine's Website 💕

A responsive, interactive Valentine's website with an artsy, whimsical, digital scrapbook vibe.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Google Fonts (Fraunces, Inter, Caveat)

## Design System

### Colors
- `paper`: #fdfbf7 (warm off-white background)
- `ink`: #2d2a2e (soft black for text)
- `accent-pink`: #eebbc3
- `accent-green`: #b8c6db
- `accent-yellow`: #f6e27f

### Typography
- **Headings**: Fraunces (serif) - elegant and classy
- **Body**: Inter (sans-serif) - clean and readable
- **Decorative**: Caveat (handwritten) - playful and personal

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open** [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
valentine-website/
├── app/
│   ├── layout.tsx       # Root layout with navbar
│   ├── page.tsx         # Homepage
│   └── globals.css      # Global styles with paper texture
├── lib/
│   └── fonts.ts         # Font configuration
└── tailwind.config.ts   # Tailwind custom theme
```

## Features

- ✨ Grainy paper texture overlay for authentic scrapbook feel
- 🎨 Custom color palette with pastel tones
- 📱 Mobile-first responsive design
- 🎭 Organic rotations and spacing for imperfect, crafted look
- 💫 Smooth hover animations and transitions

## Next Steps (Phase 2+)

- [ ] Create "Memories" page with photo gallery
- [ ] Add "Mission" page with interactive elements
- [ ] Implement Framer Motion animations
- [ ] Add more decorative components
