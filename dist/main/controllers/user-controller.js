"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
class UserController {
    constructor(createUserUseCase, listUsersUseCase) {
        this.createUserUseCase = createUserUseCase;
        this.listUsersUseCase = listUsersUseCase;
        this.create = async (req, res) => {
            try {
                const user = await this.createUserUseCase.execute(req.body);
                res.status(201).json(user.toSafeJSON());
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unexpected error';
                res.status(400).json({ message });
            }
        };
        this.createTeacher = async (req, res) => {
            if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
                res.status(403).json({ message: 'Access denied.' });
                return;
            }
            try {
                const { name, email, password } = req.body;
                const user = await this.createUserUseCase.execute({ name, email, password, role: 'teacher' });
                res.status(201).json(user.toSafeJSON());
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unexpected error';
                res.status(400).json({ message });
            }
        };
        this.list = async (_req, res) => {
            try {
                const users = await this.listUsersUseCase.execute();
                res.status(200).json(users.map((user) => user.toSafeJSON()));
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unexpected error';
                res.status(500).json({ message });
            }
        };
    }
}
exports.UserController = UserController;
