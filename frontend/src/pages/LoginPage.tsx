import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button, Card, ErrorText, Field, Input, Label, PageContainer } from '../components/ui';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Informe email e senha.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      const redirectTo = (location.state as { from?: string } | null)?.from || '/';
      navigate(redirectTo, { replace: true });
    } catch {
      setError('Email ou senha inválidos.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <h1>Entrar</h1>
      <Card style={{ maxWidth: 420 }}>
        <form onSubmit={handleSubmit} noValidate>
          {error && <ErrorText role="alert">{error}</ErrorText>}

          <Field>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>

          <Field>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          Ainda não tem conta? <Link to="/register">Criar conta</Link>
        </p>
      </Card>
    </PageContainer>
  );
}
