import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../auth/AuthContext';

const Nav = styled.nav`
  background: #1f2933;
  color: #fff;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const Brand = styled.span`
  font-weight: 700;
  font-size: 1.1rem;
`;

const Links = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const StyledNavLink = styled(NavLink)`
  color: #cbd2d9;
  text-decoration: none;
  font-size: 0.95rem;

  &.active {
    color: #fff;
    font-weight: 700;
  }

  &:hover {
    color: #fff;
  }
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid #cbd2d9;
  color: #fff;
  border-radius: 6px;
  padding: 0.35rem 0.75rem;
  cursor: pointer;

  &:hover {
    background: #323f4b;
  }
`;

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const canManagePosts = user?.role === 'teacher' || user?.role === 'admin';

  function handleLogout() {
    logout().then(() => navigate('/login', { replace: true }));
  }

  return (
    <Nav>
      <Brand>Blog Escolar</Brand>
      <Links>
        <StyledNavLink to="/" end>
          Posts
        </StyledNavLink>
        {canManagePosts && <StyledNavLink to="/posts/new">Nova postagem</StyledNavLink>}
        {canManagePosts && <StyledNavLink to="/admin">Administração</StyledNavLink>}
        {user?.role === 'admin' && <StyledNavLink to="/admin/users">Usuários</StyledNavLink>}
        {isAuthenticated && <StyledNavLink to="/account/password">Trocar senha</StyledNavLink>}
        {isAuthenticated ? (
          <>
            <span>Olá, {user?.name || user?.role}</span>
            <LogoutButton onClick={handleLogout}>Sair</LogoutButton>
          </>
        ) : (
          <StyledNavLink to="/login">Entrar (professores)</StyledNavLink>
        )}
      </Links>
    </Nav>
  );
}
