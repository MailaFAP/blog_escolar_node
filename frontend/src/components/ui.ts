import styled from 'styled-components';

export const PageContainer = styled.main`
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;

  @media (min-width: 768px) {
    padding: 2rem 1.5rem 4rem;
  }
`;

export const Card = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem 1.25rem;
`;

export const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
  border: none;
  border-radius: 6px;
  padding: 0.6rem 1.1rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s ease;
  background: ${({ $variant }) =>
    $variant === 'danger' ? '#d64545' : $variant === 'secondary' ? '#e2e8f0' : '#2f6fed'};
  color: ${({ $variant }) => ($variant === 'secondary' ? '#1f2933' : '#fff')};

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 6px;
  font-size: 0.95rem;

  &:focus {
    outline: 2px solid #2f6fed;
    outline-offset: 1px;
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: 0.6rem 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: 2px solid #2f6fed;
    outline-offset: 1px;
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 6px;
  font-size: 0.95rem;
`;

export const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.35rem;
`;

export const Field = styled.div`
  margin-bottom: 1.1rem;
`;

export const ErrorText = styled.p`
  color: #d64545;
  font-weight: 500;
`;
