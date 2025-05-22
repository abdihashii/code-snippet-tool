const API_URL = 'http://localhost:8787';

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

  if (!response.ok) {
    throw new Error(`Failed to sign up ${email}`);
  }

  return response.json() as Promise<{ userData: any }>;
}
