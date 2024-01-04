import axios, { AxiosResponse } from 'axios';

interface LoginResponse {
  accessToken: string;
}

export const loginUser = async (credentials: { id: string; password: string }): Promise<AxiosResponse<LoginResponse>> => {
  const response = await axios.post("http://localhost:8000/api/login/", credentials);
  return response;
};

export const fetchData = async (accessToken: string): Promise<AxiosResponse> => {
  const response = await axios.get('/api/data', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    // 다른 필요한 옵션들 추가
  });
  return response;
};
