import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { SiteProvider } from './context/SiteContext';
import ScrollToTop from './components/routing/ScrollToTop';
import Loading from './components/routing/Loading';
import { ProtectedRoute, GuestRoute } from './components/routing/ProtectedRoute';
import CustomerRoutes from './routes/CustomerRoutes';
import AdminRoutes from './routes/AdminRoutes';
import VendorRoutes from './routes/VendorRoutes';
import VendorLogin from './pages/vendor/VendorLogin';
import VendorRegister from './pages/vendor/VendorRegister';
import VendorForgotPassword from './pages/vendor/VendorForgotPassword';

function App() {
  return (
    <GoogleOAuthProvider clientId={"504641950387-22jfhmu4d767n7i091nsk09dud5hj52r.apps.googleusercontent.com"}>
      <SiteProvider>
        <ScrollToTop />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/vendor/login" element={<GuestRoute><VendorLogin /></GuestRoute>} />
            <Route path="/vendor/register" element={<GuestRoute><VendorRegister /></GuestRoute>} />
            <Route path="/vendor/forgot-password" element={<GuestRoute><VendorForgotPassword /></GuestRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute roles={['admin', 'subadmin']}><AdminRoutes /></ProtectedRoute>} />
            <Route path="/vendor/*" element={<ProtectedRoute roles={['vendor']}><VendorRoutes /></ProtectedRoute>} />
            <Route path="/*" element={<CustomerRoutes />} />
          </Routes>
        </Suspense>
      </SiteProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
