import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { PrivateRoute } from './auth/PrivateRoute';
import { Navbar } from './components/Navbar';
import { GlobalStyle } from './styles/GlobalStyle';
import { PostListPage } from './pages/PostListPage';
import { PostReadPage } from './pages/PostReadPage';
import { PostCreatePage } from './pages/PostCreatePage';
import { PostEditPage } from './pages/PostEditPage';
import { AdminPage } from './pages/AdminPage';
import { UsersAdminPage } from './pages/UsersAdminPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GlobalStyle />
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<PostListPage />} />
          <Route path="/posts/:id" element={<PostReadPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/account/password" element={<ChangePasswordPage />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={['teacher', 'admin']} />}>
            <Route path="/posts/new" element={<PostCreatePage />} />
            <Route path="/posts/:id/edit" element={<PostEditPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin/users" element={<UsersAdminPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
