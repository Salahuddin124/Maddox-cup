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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
