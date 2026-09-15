import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, ErrorText, Field, Input, Label, Textarea } from '../components/ui';
import type { CreatePostInput, Post, UpdatePostInput } from '../types';

interface PostFormProps {
  initialValues?: Partial<Post>;
  submitLabel: string;
  onSubmit: (input: CreatePostInput & UpdatePostInput) => Promise<void>;
}

export function PostForm({ initialValues, submitLabel, onSubmit }: PostFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [content, setContent] = useState(initialValues?.content ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError('Título e conteúdo são obrigatórios.');
      return;
    }

    setSubmitting(true);
    try {
      // The author is never editable: the backend fills it in from the logged-in user on create
      // and keeps the original author on edit when this field is omitted.
      const payload: CreatePostInput & UpdatePostInput = { title: title.trim(), content: content.trim() };
      if (initialValues?.author) {
        payload.author = initialValues.author;
      }
      await onSubmit(payload);
    } catch {
      setError('Não foi possível salvar o post. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <ErrorText role="alert">{error}</ErrorText>}

      <Field>
        <Label htmlFor="post-title">Título</Label>
        <Input
          id="post-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </Field>

      <Field>
        <Label htmlFor="post-content">Conteúdo</Label>
        <Textarea
          id="post-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          required
        />
      </Field>

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Salvando...' : submitLabel}
      </Button>
    </form>
  );
}
