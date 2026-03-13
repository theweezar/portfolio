# Portfolio

A modern, responsive portfolio website designed for showcasing professional experience and skills. Built with vanilla JavaScript and Handlebars templating for easy customization and maintenance.

## Features

- **Responsive Design**: Optimized for desktop and mobile viewing
- **Printable Layout**: Designed for generating PDF resumes via browser print
- **Modular Sections**: Organized into distinct sections for easy content management
- **Customizable Data**: All content stored in JSON format for simple updates
- **Pagination Support**: Automatic page breaks for print-friendly output

## Sections

The portfolio includes the following sections:

- Personal Information
- Professional Profile
- Technical Skills
- Work Experience
- Achievements
- Soft Skills
- Education
- Certifications
- Projects

## Technologies Used

- **JavaScript**: ES6+ with modules
- **Handlebars**: Templating engine for dynamic content rendering
- **CSS**: Custom styling with Google Fonts integration
- **HTML5**: Semantic markup
- **esbuild**: Fast bundling and minification

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Development

Open `index.html` in your browser to view the portfolio. The page will automatically render content from `data.json`.

### Production Build

Run the build command to bundle JavaScript:
```bash
npm run build
```

The bundled file will be created at `dist/main.js`.

### Customization

1. Edit `data.json` to update content for each section
2. Modify templates in `index.html` if needed
3. Update styles in `style.css` and `resumeicon.css`
4. Add or modify icons in the `icons/` directory

### Generating PDF

1. Open the portfolio in your browser
2. Use the browser's print function (Ctrl+P / Cmd+P)
3. Select "Save as PDF" or print to PDF
4. The pagination system will ensure proper page breaks

## Project Structure

```
portfolio/
├── index.html          # Main HTML file with templates
├── main.js            # JavaScript entry point
├── page.js            # Pagination logic
├── data.json          # Content data
├── style.css          # Main styles
├── resumeicon.css     # Icon styles
├── package.json       # Project configuration
├── dist/              # Build output
│   └── main.js
└── icons/             # Icon assets
    ├── calendar.svg
    ├── link.svg
    ├── location.svg
    └── resumeicons-d3ea7c5ce15461b709f9.woff
```

## Browser Support

- Chrome/Chromium (recommended for PDF generation)
- Firefox
- Safari
- Edge

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.