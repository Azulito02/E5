import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import logo from "../assets/react.svg";
import { useAuth } from "../database/authcontext";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../App.css";
import {Container, Navbar, Offcanvas, NavDropdown } from "react-bootstrap"; 
import { useTranslation } from 'react-i18next';


const Encabezado = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    try {
      setIsCollapsed(false);
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminPassword");
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleToggle = () => setIsCollapsed(!isCollapsed);

  const handleNavigate = (path) => {
    navigate(path);
    setIsCollapsed(false);
  };

  const cambiarIdioma = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <Navbar expand="sm" fixed="top" className="color-navbar">
      <Container>
        <Navbar.Brand
          onClick={() => handleNavigate("/inicio")}
          className="text-white"
          style={{ cursor: "pointer" }}
        >
          <img
            alt="Logo"
            src={logo}
            width="30"
            height="30"
            className="d-inline-block align-top"
          />{" "}
          <strong>Ferretería</strong>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="offcanvasNavbar-expand-sm" onClick={handleToggle} />
        <Navbar.Offcanvas
          id="offcanvasNavbar-expand-sm"
          aria-labelledby="offcanvasNavbarLabel-expand-sm"
          placement="end"
          show={isCollapsed}
          onHide={() => setIsCollapsed(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title
              id="offcanvasNavbarLabel-expand-sm"
              className={isCollapsed ? "color-texto-marca" : "text-white"}
            >
              Menú
            </Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">
              <Nav.Link onClick={() => handleNavigate("/inicio")} className={isCollapsed ? "color-texto-marca" : "text-white"}>
                {isCollapsed && <i className="bi-house-door-fill me-2"></i>}
                <strong>{t('inicio')}</strong>
              </Nav.Link>

              <Nav.Link onClick={() => handleNavigate("/categorias")} className={isCollapsed ? "color-texto-marca" : "text-white"}>
                {t('categorias')}
              </Nav.Link>

              <Nav.Link onClick={() => handleNavigate("/productos")} className={isCollapsed ? "color-texto-marca" : "text-white"}>
                {t('productos')}
              </Nav.Link>

              <Nav.Link onClick={() => handleNavigate("/catalogo")} className={isCollapsed ? "color-texto-marca" : "text-white"}>
                {t('catalogo')}
              </Nav.Link>

              <Nav.Link onClick={() => handleNavigate("/libros")} className={isCollapsed ? "color-texto-marca" : "text-white"}>
                {t('libros')}
              </Nav.Link>

              <Nav.Link onClick={() => handleNavigate("/clima")} className={isCollapsed ? "color-texto-marca" : "text-white"}>
                {isCollapsed && <i className="bi-cloud-sun-fill me-2"></i>}
                <strong>{t('clima')}</strong>
              </Nav.Link>

              <Nav.Link onClick={() => handleNavigate("/pronunciacion")} className={isCollapsed ? "color-texto-marca" : "text-white"}>
                {t('pronunciacion')}
              </Nav.Link>

              <Nav.Link onClick={() => handleNavigate("/Estadisticas")} className={isCollapsed ? "color-texto-marca" : "text-white"}>
                {t('estadisticas')}
              </Nav.Link>

              <NavDropdown
                title={
                  <span>
                    <i className="bi-translate me-2"></i>
                    {isCollapsed && <span>{t('idioma')}</span>}
                  </span>
                }
                id="basic-nav-dropdown"
                className={isCollapsed ? "color-texto-marca" : "text-white"}
              >
                <NavDropdown.Item onClick={() => cambiarIdioma('es')} className="text-black">
                  <strong>{t('español')}</strong>
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => cambiarIdioma('en')} className="text-black">
                  <strong>{t('ingles')}</strong>
                </NavDropdown.Item>
              </NavDropdown>

              {isLoggedIn ? (
                <Nav.Link onClick={handleLogout} className={isCollapsed ? "text-black" : "text-white"}>
                  {t('cerrarSesion')}
                </Nav.Link>
              ) : location.pathname === "/" ? (
                <Nav.Link onClick={() => handleNavigate("/")} className={isCollapsed ? "text-black" : "text-white"}>
                  {t('menu.iniciarSesion')}
                </Nav.Link>
              ) : null}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default Encabezado;