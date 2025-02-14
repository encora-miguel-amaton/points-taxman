import { AxiosError } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { API } from '@/services/api';

const endpoint = process.env.NEXT_PUBLIC_API || 'http://localhost:8080';

describe('API', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(API);
  });

  afterEach(() => {
    mock.reset();
  });

  describe('Configuration', () => {
    test('should set base URL correctly', () => {
      expect(API.defaults.baseURL).toBe(endpoint);
    });
  });

  describe('GET requests', () => {
    test('should successfully fetch data', async () => {
      const mockData = { data: 'test' };
      mock.onGet('/path').reply(200, mockData);

      const response = await API.get('/path');
      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockData);
    });

    test('should retry on 500 errors up to 3 times', async () => {
      mock
        .onGet('/retry-path')
        .replyOnce(500)
        .onGet('/retry-path')
        .replyOnce(500)
        .onGet('/retry-path')
        .reply(200, { data: 'success' });

      const response = await API.get('/retry-path');
      expect(response.status).toBe(200);
      expect(mock.history.get.length).toBe(3);
    });

    test('should not retry on 400 errors', async () => {
      mock.onGet('/400-error').reply(400, { error: 'Bad Request' });

      try {
        await API.get('/400-error');
      } catch (error) {
        expect(error instanceof AxiosError).toBe(true);
        if (error instanceof AxiosError) {
          expect(error.response?.status).toBe(400);
        }
        expect(mock.history.get.length).toBe(1);
      }
    });

    test('should handle network errors', async () => {
      mock.onGet('/network-error').networkError();

      try {
        await API.get('/network-error');
      } catch (error) {
        expect(error instanceof AxiosError).toBe(true);
        if (error instanceof AxiosError) {
          expect(error.message).toContain('Network Error');
        }
      }
    });

    test('should fail after maximum retries', async () => {
      mock.onGet('/max-retries').reply(500, { error: 'Server Error' });

      try {
        await API.get('/max-retries');
      } catch (error) {
        expect(error instanceof AxiosError).toBe(true);
        if (error instanceof AxiosError) {
          expect(error.response?.status).toBe(500);
        }
        expect(mock.history.get.length).toBe(4); // Initial request + 3 retries
      }
    }, 10000);

    test('should handle timeout errors', async () => {
      mock.onGet('/timeout').timeout();

      try {
        await API.get('/timeout');
      } catch (error) {
        expect(error instanceof AxiosError).toBe(true);
        if (error instanceof AxiosError) {
          expect(error.code).toBe('ECONNABORTED');
        }
      }
    });
  });

  describe('Request Headers', () => {
    test('should send custom headers', async () => {
      mock.onGet('/custom-headers').reply((config) => {
        expect(config.headers?.['Custom-Header']).toBe('test-value');
        return [200, { data: 'success' }];
      });

      await API.get('/custom-headers', {
        headers: {
          'Custom-Header': 'test-value',
        },
      });
    });
  });

  describe('Response Handling', () => {
    test('should handle JSON parsing errors', async () => {
      mock.onGet('/invalid-json').reply(200, 'Invalid JSON');

      try {
        await API.get('/invalid-json');
      } catch (error) {
        expect(error instanceof AxiosError).toBe(true);
        if (error instanceof AxiosError) {
          expect(error.message).toContain('JSON');
        }
      }
    });

    test('should handle large responses', async () => {
      const largeData = Array(1000).fill({ id: 1, name: 'test' });
      mock.onGet('/large-response').reply(200, largeData);

      const response = await API.get('/large-response');
      expect(response.data).toHaveLength(1000);
    });
  });
});
