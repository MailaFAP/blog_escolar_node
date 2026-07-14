import { CreatePostUseCase } from './create-post';
import { PostRepository } from '../../domain/post-repository';
import { Post } from '../../domain/post';

describe('CreatePostUseCase', () => {
  let useCase: CreatePostUseCase;
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

    useCase = new CreatePostUseCase(mockRepository);
  });

  it('should create a post successfully with title, content, author and url', async () => {
    const input = {
      title: 'Post Title',
      content: 'This is a test post content',
      author: 'Prof. Carlos',
      url: 'https://example.com/post-image.jpg',
      createdBy: 1,
    };

    const mockPost = new Post(
      1,
      input.title,
      input.content,
      input.author,
      new Date(),
      new Date(),
      input.createdBy,
      input.url
    );

    mockRepository.create.mockResolvedValue(mockPost);

    const result = await useCase.execute(input);

    expect(result).toEqual(mockPost);
    expect(mockRepository.create).toHaveBeenCalledWith(input);
  });

  it('should throw an error if title is empty', async () => {
    const input = {
      title: '',
      content: 'Test content',
      author: 'Prof. Carlos',
      url: 'https://example.com/post-image.jpg',
    };

    await expect(useCase.execute(input)).rejects.toThrow('Title is required.');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should throw an error if content is empty', async () => {
    const input = {
      title: 'Test Title',
      content: '   ',
      author: 'Prof. Carlos',
    };

    await expect(useCase.execute(input)).rejects.toThrow('Content is required.');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should throw an error if author is empty', async () => {
    const input = {
      title: 'Test Title',
      content: 'Test Content',
      author: '',
    };

    await expect(useCase.execute(input)).rejects.toThrow('Author is required.');
    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
