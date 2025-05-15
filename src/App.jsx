import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./database/authcontext";
import ProtectedRoute from "./components/ProtectedRoute"; 
import Login from './views/Login'
import Encabezado from "./components/Encabezado";
import Inicio from "./views/Inicio";
import Categorias from "./components/views/categorias";
import Productos from "./components/views/Productos";
import Catalogo from "./components/views/Catalogo";
import Clima from "./components/Clima/Clima"
import Pronunciacion from "./components/views/Pronunciacion";
import Estadisticas from "./components/views/Estadisticas";

import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
          <Encabezado />
          <main className="margen-superior-main">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/inicio" element={<ProtectedRoute element={<Inicio />} />} />
              <Route path="/categorias" element={<ProtectedRoute element={<Categorias />} />}/>
              <Route path="/productos" element={<ProtectedRoute element={<Productos />} />}/>
              <Route path="/Catalogo" element={<ProtectedRoute element={<Catalogo />} />}/>
              <Route path="/clima" element={<ProtectedRoute element={<Clima />} />}/>
              <Route path="/pronunciacion" element={<ProtectedRoute element={<Pronunciacion />} />}/>
              <Route path="/estadisticas" element={<ProtectedRoute element={<Estadisticas />} />}/>
            </Routes>
          </main>
      </Router>
    </AuthProvider>
  )
}

export default App;