import { DeletePostUseCase } from './delete-post';
import { PostRepository } from '../../domain/post-repository';
import { Post } from '../../domain/post';

describe('DeletePostUseCase', () => {
  let useCase: DeletePostUseCase;
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

    useCase = new DeletePostUseCase(mockRepository);
  });

  it('should delete a post successfully if user is admin', async () => {
    const existingPost = new Post(1, 'Title', 'Content', 'Author', new Date(), new Date(), 2);
    
    mockRepository.getById.mockResolvedValue(existingPost);
    mockRepository.delete.mockResolvedValue(true);

    await useCase.execute(1, { id: 3, role: 'admin' });

    expect(mockRepository.getById).toHaveBeenCalledWith(1);
    expect(mockRepository.delete).toHaveBeenCalledWith(1);
  });

  it('should delete a post successfully if user is teacher and created the post', async () => {
    const existingPost = new Post(1, 'Title', 'Content', 'Author', new Date(), new Date(), 2);
    
    mockRepository.getById.mockResolvedValue(existingPost);
    mockRepository.delete.mockResolvedValue(true);

    await useCase.execute(1, { id: 2, role: 'teacher' });

    expect(mockRepository.delete).toHaveBeenCalledWith(1);
  });

  it('should throw an error if the post id is invalid', async () => {
    await expect(useCase.execute(0)).rejects.toThrow('A valid post id is required.');
    expect(mockRepository.getById).not.toHaveBeenCalled();
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw an error if post is not found', async () => {
    mockRepository.getById.mockResolvedValue(null);

    await expect(useCase.execute(1)).rejects.toThrow('Post not found.');
    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw an error of access denied if a teacher tries to delete someone else\'s post', async () => {
    const existingPost = new Post(1, 'Title', 'Content', 'Author', new Date(), new Date(), 2);

    mockRepository.getById.mockResolvedValue(existingPost);

    await expect(
      useCase.execute(1, { id: 3, role: 'teacher' })
    ).rejects.toThrow('Access denied.');

    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw an error if delete repository returns false', async () => {
    const existingPost = new Post(1, 'Title', 'Content', 'Author', new Date(), new Date(), 2);
    
    mockRepository.getById.mockResolvedValue(existingPost);
    mockRepository.delete.mockResolvedValue(false);

    await expect(useCase.execute(1)).rejects.toThrow('Post not found.');
  });
});
