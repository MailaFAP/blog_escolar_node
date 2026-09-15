import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Button, Card, ErrorText, Field, Input, Label, PageContainer } from '../components/ui';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim()) {
      setError('Preencha nome e email.');
      return;
    }

    if (password.length < 8) {
      setError('A senha deve ter ao menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('A confirmação não confere com a senha.');
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password, 'teacher');
      navigate('/', { replace: true });
    } catch {
      setError('Não foi possível criar a conta. O email já pode estar em uso.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <h1>Criar conta de professor(a)</h1>
      <Card style={{ maxWidth: 420 }}>
        <p>Contas são exclusivas para professores(as). Alunos(as) e visitantes podem ler os posts sem login.</p>
        <form onSubmit={handleSubmit} noValidate>
          {error && <ErrorText role="alert">{error}</ErrorText>}

          <Field>
            <Label htmlFor="register-name">Nome</Label>
            <Input id="register-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </Field>

          <Field>
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>

          <Field>
            <Label htmlFor="register-password">Senha</Label>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>

          <Field>
            <Label htmlFor="register-confirm-password">Confirmar senha</Label>
            <Input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </Field>

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Criando conta...' : 'Criar conta'}
          </Button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </Card>
    </PageContainer>
  );
}
