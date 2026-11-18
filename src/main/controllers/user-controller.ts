import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../application/usecases/create-user';
import { ListUsersUseCase } from '../../application/usecases/list-users';
import { UpdateTeacherUseCase } from '../../application/usecases/update-teacher';
import { UpdateStudentUseCase } from '../../application/usecases/update-student';
import { UserRepository } from '../../domain/user-repository';

export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
    private readonly repository: UserRepository,
    private readonly updateTeacherUseCase: UpdateTeacherUseCase
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.createUserUseCase.execute(req.body);
      res.status(201).json(user.toSafeJSON());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      res.status(400).json({ message });
    }
  };

  createTeacher = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }

    try {
      const { name, email, password } = req.body;
      const user = await this.createUserUseCase.execute({ name, email, password, role: 'teacher' });
      res.status(201).json(user.toSafeJSON());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      res.status(400).json({ message });
    }
  };

  listTeachers = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }
    try {
      const users = await this.listUsersUseCase.execute();
      res.status(200).json(users.filter((user) => user.role === 'teacher').map((user) => user.toSafeJSON()));
    } catch {
      res.status(500).json({ message: 'Unable to list teachers.' });
    }
  };

  getTeacher = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ message: 'A valid teacher id is required.' }); return; }
    try {
      const user = await this.repository.getById(id);
      if (!user || user.role !== 'teacher') { res.status(404).json({ message: 'Teacher not found.' }); return; }
      res.status(200).json(user.toSafeJSON());
    } catch {
      res.status(500).json({ message: 'Unable to load teacher.' });
    }
  };

  updateTeacher = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      res.status(403).json({ message: 'Access denied.' });
      return;
    }
    try {
      const { name, email } = req.body ?? {};
      const user = await this.updateTeacherUseCase.execute(Number(req.params.id), { name, email });
      res.status(200).json(user.toSafeJSON());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      const status = message === 'Teacher not found.' ? 404 : message === 'Email is already in use.' ? 409 :
        ['Name is required.', 'A valid email is required.', 'A valid teacher id is required.'].includes(message) ? 400 : 500;
      res.status(status).json({ message: status === 500 ? 'Unable to update teacher.' : message });
    }
  };

  deleteTeacher = async (req: Request, res: Response): Promise<void> => {
    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') { res.status(403).json({ message: 'Access denied.' }); return; }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ message: 'A valid teacher id is required.' }); return; }
    if (req.user.id === id) { res.status(400).json({ message: 'You cannot delete your own account.' }); return; }
    try {
      if (!await this.repository.deleteTeacher(id)) { res.status(404).json({ message: 'Teacher not found.' }); return; }
      res.status(204).send();
    } catch {
      res.status(500).json({ message: 'Unable to delete teacher.' });
    }
  };

  createStudent = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) { res.status(403).json({ message: 'Access denied.' }); return; }
    try {
      const { name, email, password } = req.body ?? {};
      const user = await this.createUserUseCase.execute({ name, email, password, role: 'student' });
      res.status(201).json(user.toSafeJSON());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      res.status(400).json({ message });
    }
  };

  listStudents = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) { res.status(403).json({ message: 'Access denied.' }); return; }
    try {
      const users = await this.listUsersUseCase.execute();
      res.status(200).json(users.filter((user) => user.role === 'student').map((user) => user.toSafeJSON()));
    } catch { res.status(500).json({ message: 'Unable to list students.' }); }
  };

  getStudent = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) { res.status(403).json({ message: 'Access denied.' }); return; }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ message: 'A valid student id is required.' }); return; }
    try {
      const student = await this.repository.getById(id);
      if (!student || student.role !== 'student') { res.status(404).json({ message: 'Student not found.' }); return; }
      res.status(200).json(student.toSafeJSON());
    } catch { res.status(500).json({ message: 'Unable to load student.' }); }
  };

  updateStudent = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) { res.status(403).json({ message: 'Access denied.' }); return; }
    try {
      const { name, email } = req.body ?? {};
      const student = await new UpdateStudentUseCase(this.repository).execute(Number(req.params.id), { name, email });
      res.status(200).json(student.toSafeJSON());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      const status = message === 'Student not found.' ? 404 : message === 'Email is already in use.' ? 409 :
        ['Name is required.', 'A valid email is required.', 'A valid student id is required.'].includes(message) ? 400 : 500;
      res.status(status).json({ message: status === 500 ? 'Unable to update student.' : message });
    }
  };

  deleteStudent = async (req: Request, res: Response): Promise<void> => {
    if (!req.user) { res.status(403).json({ message: 'Access denied.' }); return; }
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) { res.status(400).json({ message: 'A valid student id is required.' }); return; }
    if (req.user.id === id) { res.status(400).json({ message: 'You cannot delete your own account.' }); return; }
    try {
      if (!await this.repository.deleteStudent(id)) { res.status(404).json({ message: 'Student not found.' }); return; }
      res.status(204).send();
    } catch { res.status(500).json({ message: 'Unable to delete student.' }); }
  };

  list = async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await this.listUsersUseCase.execute();
      res.status(200).json(users.map((user) => user.toSafeJSON()));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      res.status(500).json({ message });
    }
  };
}
