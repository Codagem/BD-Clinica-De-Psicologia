import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Clínica Psicologia",
  description: "Sistema de Clínica",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-100">

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1d3557",
              color: "#fff",
              borderRadius: "18px",
              padding: "14px",
            },
          }}
        />

        {children}

      </body>
    </html>
  );
}