import { UpdatePostUseCase } from './update-post';
import { PostRepository } from '../../domain/post-repository';
import { Post } from '../../domain/post';

describe('UpdatePostUseCase', () => {
  let useCase: UpdatePostUseCase;
  let mockRepository: jest.Mocked<PostRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
      getById: jest.fn(),
      search: jest.fn(),
    } as unknown as jest.Mocked<PostRepository>;

    useCase = new UpdatePostUseCase(mockRepository);
  });

  it('should update a post successfully if post exists and user is admin', async () => {
    const existingPost = new Post(1, 'Title', 'Content', 'Author', new Date(), new Date(), 2);
    const input = { title: 'Updated Title' };
    const updatedPost = new Post(1, 'Updated Title', 'Content', 'Author', new Date(), new Date(), 2);

    mockRepository.getById.mockResolvedValue(existingPost);
    mockRepository.update.mockResolvedValue(updatedPost);

    const result = await useCase.execute(1, input, { id: 3, role: 'admin' });

    expect(result).toEqual(updatedPost);
    expect(mockRepository.getById).toHaveBeenCalledWith(1);
    expect(mockRepository.update).toHaveBeenCalledWith(1, input);
  });

  it('should update a post successfully if user is teacher and created the post', async () => {
    const existingPost = new Post(1, 'Title', 'Content', 'Author', new Date(), new Date(), 2);
    const input = { title: 'Updated Title' };
    const updatedPost = new Post(1, 'Updated Title', 'Content', 'Author', new Date(), new Date(), 2);

    mockRepository.getById.mockResolvedValue(existingPost);
    mockRepository.update.mockResolvedValue(updatedPost);

    const result = await useCase.execute(1, input, { id: 2, role: 'teacher' });

    expect(result).toEqual(updatedPost);
    expect(mockRepository.update).toHaveBeenCalledWith(1, input);
  });

  it('should throw an error if the post id is invalid', async () => {
    await expect(useCase.execute(0, { title: 'Updated' })).rejects.toThrow('A valid post id is required.');
    expect(mockRepository.getById).not.toHaveBeenCalled();
  });

  it('should throw an error if no fields are provided to update', async () => {
    await expect(useCase.execute(1, {})).rejects.toThrow('At least one field must be provided to update the post.');
    expect(mockRepository.getById).not.toHaveBeenCalled();
  });

  it('should throw an error if post is not found', async () => {
    mockRepository.getById.mockResolvedValue(null);

    await expect(useCase.execute(1, { title: 'Updated' })).rejects.toThrow('Post not found.');
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should throw an error of access denied if a teacher tries to update someone else\'s post', async () => {
    const existingPost = new Post(1, 'Title', 'Content', 'Author', new Date(), new Date(), 2); // createdBy = 2

    mockRepository.getById.mockResolvedValue(existingPost);

    await expect(
      useCase.execute(1, { title: 'Updated' }, { id: 3, role: 'teacher' }) // user id = 3
    ).rejects.toThrow('Access denied.');
    
    expect(mockRepository.update).not.toHaveBeenCalled();
  });

  it('should throw an error if update repository returns null', async () => {
    const existingPost = new Post(1, 'Title', 'Content', 'Author', new Date(), new Date(), 2);
    mockRepository.getById.mockResolvedValue(existingPost);
    mockRepository.update.mockResolvedValue(null);

    await expect(useCase.execute(1, { title: 'Updated' })).rejects.toThrow('Post not found.');
  });
});
