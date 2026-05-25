import "./globals.css";

export const metadata = {
  title: "Clínica Psicologia",
  description: "Sistema de Clínica",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">

      <body className="bg-gray-100">

        {children}

      </body>

    </html>
  );
}