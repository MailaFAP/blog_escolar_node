import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { createUser, listUsers } from '../api/users';
import { Button, Card, ErrorText, Field, Input, Label, PageContainer, Select } from '../components/ui';
import type { AuthenticatedUser, UserRole } from '../types';

export function UsersAdminPage() {
  const [users, setUsers] = useState<AuthenticatedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setListError(null);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch {
      setListError('Não foi possível carregar os usuários.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!name.trim() || !email.trim() || password.length < 8) {
      setFormError('Preencha nome, email e uma senha com ao menos 8 caracteres.');
      return;
    }

    setSubmitting(true);
    try {
      await createUser({ name: name.trim(), email: email.trim(), password, role });
      setName('');
      setEmail('');
      setPassword('');
      setRole('teacher');
      await loadUsers();
    } catch {
      setFormError('Não foi possível criar o usuário. Verifique se o email já está em uso.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <h1>Usuários</h1>

      <Card style={{ marginBottom: '2rem', maxWidth: 420 }}>
        <h2>Novo usuário</h2>
        <form onSubmit={handleSubmit} noValidate>
          {formError && <ErrorText role="alert">{formError}</ErrorText>}

          <Field>
            <Label htmlFor="new-user-name">Nome</Label>
            <Input id="new-user-name" value={name} onChange={(event) => setName(event.target.value)} required />
          </Field>

          <Field>
            <Label htmlFor="new-user-email">Email</Label>
            <Input
              id="new-user-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>

          <Field>
            <Label htmlFor="new-user-password">Senha</Label>
            <Input
              id="new-user-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>

          <Field>
            <Label htmlFor="new-user-role">Papel</Label>
            <Select id="new-user-role" value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              <option value="teacher">Professor(a)</option>
              <option value="admin">Administrador(a)</option>
            </Select>
          </Field>

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Criando...' : 'Criar usuário'}
          </Button>
        </form>
      </Card>

      <h2>Usuários cadastrados</h2>
      {listError && <ErrorText>{listError}</ErrorText>}
      {loading ? (
        <p>Carregando...</p>
      ) : (
        users.map((user) => (
          <Card key={user.id} style={{ marginBottom: '0.75rem' }}>
            <strong>{user.name}</strong> — {user.email} ({user.role})
          </Card>
        ))
      )}
    </PageContainer>
  );
}
