import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';
import LandingPage from '@/pages/LandingPage';
import BlogHomePage from '@/pages/BlogHomePage';
import BlogPage from '@/pages/BlogPage';
import ShopPage from '@/pages/ShopPage';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminSettings from '@/pages/AdminSettings';
import CreateBlog from '@/pages/CreateBlog';
import EditBlog from '@/pages/EditBlog';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/blog" element={<BlogHomePage />} />
          <Route path="/blog/:id" element={<BlogPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/blogadmin" element={<AdminLogin />} />
          <Route path="/blogadmin/dashboard" element={<AdminDashboard />} />
          <Route path="/blogadmin/settings" element={<AdminSettings />} />
          <Route path="/blogadmin/create" element={<CreateBlog />} />
          <Route path="/blogadmin/edit/:id" element={<EditBlog />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;