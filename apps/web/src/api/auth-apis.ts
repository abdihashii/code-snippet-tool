const API_URL = 'http://localhost:8787';

interface ApiSuccessResponse {
  userData: any;
  success: true;
}

interface ApiErrorResponse {
  error: string;
  success: false;
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

export async function signUp(
  email: string,
  password: string,
  confirmPassword: string,
) {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    body: JSON.stringify({ email, password, confirmPassword }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const responseData: ApiResponse = await response.json();

  // Check if the response indicates an error
  if (!response.ok || !responseData.success) {
    const errorMessage = 'error' in responseData
      ? responseData.error
      : `HTTP ${response.status}: Failed to sign up ${email}`;

    throw new Error(errorMessage);
  }

  return responseData.userData;
}
