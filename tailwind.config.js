module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Adjust the paths according to your project structure
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0465A1',
        primaryDark: '#035288',
        error: '#dc2626',
        errorLight: '#fff5f5',
        errorBorder: '#fee2e2',
        warning: '#ff4444',
        textPrimary: '#333',
        textSecondary: '#666',
        background: 'rgba(4, 101, 161, 0.08)',
      },
      boxShadow: {
        sm: '0 2px 4px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
    },
  },
  plugins: [],
}; 