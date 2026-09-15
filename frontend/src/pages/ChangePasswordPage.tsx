import { useState } from 'react';
import type { FormEvent } from 'react';
import { changePassword } from '../api/auth';
import { Button, Card, ErrorText, Field, Input, Label, PageContainer } from '../components/ui';

export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError('A nova senha deve ter ao menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação não confere com a nova senha.');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Não foi possível trocar a senha. Verifique a senha atual.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <h1>Trocar senha</h1>
      <Card style={{ maxWidth: 420 }}>
        <form onSubmit={handleSubmit} noValidate>
          {error && <ErrorText role="alert">{error}</ErrorText>}
          {success && <p role="status">Senha alterada com sucesso.</p>}

          <Field>
            <Label htmlFor="current-password">Senha atual</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </Field>

          <Field>
            <Label htmlFor="new-password">Nova senha</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </Field>

          <Field>
            <Label htmlFor="confirm-password">Confirmar nova senha</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </Field>

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Salvando...' : 'Salvar nova senha'}
          </Button>
        </form>
      </Card>
    </PageContainer>
  );
}
