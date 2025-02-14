import axios, { isAxiosError } from 'axios';
import axiosRetry from 'axios-retry';

const endpoint = process.env.NEXT_PUBLIC_API || 'http://localhost:8080';

export const API = axios.create({ baseURL: endpoint });

axiosRetry(API, {
  retries: 3,
  retryDelay: (count) => {
    console.warn(`Unable to fetch rates, retrying. Retries so far: ${count}`);
    return count * 1000;
  },
  retryCondition: (error) => {
    if (error?.response && isAxiosError(error)) {
      // Tax service seems to be failing at irregular intervals
      return error.response.status === 500;
    }

    return false;
  },
});
