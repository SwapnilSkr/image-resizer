# Image Resizer

A fast, private, and browser-based image resizing tool.

## Getting Started

To run this application:

```bash
bun install
bun --bun run dev
```

## Building For Production

To build this application for production:

```bash
bun --bun run build
```

## Features

- **Client-Side Processing**: All image processing happens in your browser - no files are uploaded to any server
- **Multiple Formats**: Supports JPEG, PNG, and WebP output formats
- **Aspect Ratio Control**: Lock or unlock aspect ratio when resizing
- **Quick Presets**: Common image sizes for social media (1080p, 720p, Thumbnail, Twitter, Instagram)
- **Quality Control**: Adjust compression quality (1-100%)
- **Dark Mode**: Toggle between light and dark themes
- **Real-time Preview**: See the resized image before downloading
- **File Size Comparison**: View original vs new file sizes with compression ratio

## Usage

1. Drag and drop an image or click "Select Image"
2. Adjust dimensions (width/height) manually or use quick presets
3. Set quality and output format
4. Click "Resize Image" to process
5. Preview and download your resized image

## Tech Stack

- **React 19** with TypeScript
- **TanStack Router** for client-side routing
- **Tailwind CSS** for styling
- **Vite** for build tooling
- **Biome** for linting and formatting

## Privacy

All image processing is performed locally in your browser using the HTML5 Canvas API. No images or personal data are ever sent to any server, ensuring complete privacy and security.

## License

MIT
