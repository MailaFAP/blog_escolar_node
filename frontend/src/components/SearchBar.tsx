import styled from 'styled-components';
import { Input } from './ui';

const Wrapper = styled.div`
  margin-bottom: 1.5rem;
`;

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  return (
    <Wrapper>
      <label htmlFor="post-search" style={{ display: 'none' }}>
        Buscar posts
      </label>
      <Input
        id="post-search"
        type="search"
        value={value}
        placeholder={placeholder || 'Buscar por palavra-chave...'}
        onChange={(event) => onChange(event.target.value)}
      />
    </Wrapper>
  );
}
