import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { SettingsProvider } from "./context/SettingsContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from './context/CartContext';
import AppRoutes from "./routes/AppRoutes";


function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider> 
              <AppRoutes />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>  
    </BrowserRouter>

  );
}

export default App;