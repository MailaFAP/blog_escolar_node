import { User } from '../../domain/user';
import { UserRepository } from '../../domain/user-repository';

export class UpdateStudentUseCase {
  constructor(private readonly repository: UserRepository) {}

  async execute(id: number, input: { name: string; email: string }): Promise<User> {
    if (!Number.isInteger(id) || id <= 0) throw new Error('A valid student id is required.');
    if (typeof input.name !== 'string' || !input.name.trim()) throw new Error('Name is required.');
    if (typeof input.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) throw new Error('A valid email is required.');
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const current = await this.repository.getById(id);
    if (!current || current.role !== 'student') throw new Error('Student not found.');
    const existing = await this.repository.findByEmail(email);
    if (existing && existing.id !== id) throw new Error('Email is already in use.');
    try {
      const updated = await this.repository.updateStudent(id, name, email);
      if (!updated) throw new Error('Student not found.');
      return updated;
    } catch (error) {
      if ((error as { code?: string })?.code === '23505') throw new Error('Email is already in use.');
      throw error;
    }
  }
}