import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Components
import Navbar from './components/common/Navbar';
import ScrollToTop from './components/common/ScrollToTop';
import ErrorBoundary from './components/common/ErrorBoundary';

// Auth Pages
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Buyer / Public Pages
import Home from './pages/buyer/Home';
import ProductPage from './pages/buyer/ProductPage';
import Courses from './pages/buyer/Courses';
import CoursePage from './pages/buyer/CoursePage';
import Cart from './pages/buyer/Cart';
import MyLearning from './pages/buyer/MyLearning';
import MyOrders from './pages/buyer/MyOrders';
import Classroom from './pages/buyer/Classroom';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import MyProducts from './pages/seller/MyProducts';
import AddProduct from './pages/seller/AddProduct';
import MyCourses from './pages/seller/MyCourses';
import AddCourse from './pages/seller/AddCourse';
import StudioSettings from './pages/seller/StudioSettings';
import SellerOrders from './pages/seller/SellerOrders';
import Earnings from './pages/seller/Earnings';

// One-time cleanup: remove old stale mock order data from previous versions
if (!localStorage.getItem('cc_orders_cleaned_v2')) {
  localStorage.removeItem('cc_shared_orders');
  localStorage.setItem('cc_orders_cleaned_v2', '1');
}

function App() {
  const { user, loading, isSeller } = useAuth();

  // Show loading spinner while auth initializes
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FDFBF7',
      }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid #e0d6ca',
          borderTopColor: '#A0522D',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <Routes>
        {/* Public Landing & Catalog Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/marketplace" element={<Home />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:id" element={<CoursePage />} />

        {/* Auth Routes — redirect if already logged in */}
        <Route path="/login" element={
          !user ? <LoginPage /> : (isSeller ? <Navigate to="/seller" /> : <Navigate to="/marketplace" />)
        } />
        <Route path="/signup" element={
          !user ? <SignupPage /> : (isSeller ? <Navigate to="/seller" /> : <Navigate to="/marketplace" />)
        } />

        {/* Protected Buyer Routes */}
        <Route path="/cart" element={user ? <Cart /> : <Navigate to="/login?redirect=/cart" />} />
        <Route path="/my-learning" element={user ? <MyLearning /> : <Navigate to="/login?redirect=/my-learning" />} />
        <Route path="/my-orders" element={user ? <MyOrders /> : <Navigate to="/login?redirect=/my-orders" />} />
        <Route path="/classroom" element={user ? <Classroom /> : <Navigate to="/login?redirect=/classroom" />} />

        {/* Protected Seller Studio Routes */}
        <Route path="/seller" element={<ErrorBoundary><SellerDashboard /></ErrorBoundary>} />
        <Route path="/seller/orders" element={<ErrorBoundary><SellerOrders /></ErrorBoundary>} />
        <Route path="/seller/products" element={<ErrorBoundary><MyProducts /></ErrorBoundary>} />
        <Route path="/seller/add-product" element={<ErrorBoundary><AddProduct /></ErrorBoundary>} />
        <Route path="/seller/courses" element={<ErrorBoundary><MyCourses /></ErrorBoundary>} />
        <Route path="/seller/add-course" element={<ErrorBoundary><AddCourse /></ErrorBoundary>} />
        <Route path="/seller/settings" element={<ErrorBoundary><StudioSettings /></ErrorBoundary>} />
        <Route path="/seller/earnings" element={<ErrorBoundary><Earnings /></ErrorBoundary>} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;