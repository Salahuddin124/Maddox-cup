export const metadata = {
  title: "MADDOXX CUP — Team registration",
  description:
    "Register your five-player roster for the MADDOXX CUP Dota 2 tournament.",
};

export const viewport = {
  themeColor: "#14213d",
};

export default function RootLayout({ children }) {
  return (
    // public/admin-theme.js runs while the head is parsed, so the admin theme
    // is applied before the first paint. It writes data-theme on <html>, which
    // is why that attribute is allowed to differ from the server HTML.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="/admin-theme.js" />
      </head>
      <body>{children}</body>
    </html>
  );
}
