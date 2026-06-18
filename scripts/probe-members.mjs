const API = 'https://svganchordev.net/fitnexia-api/v1';

async function main() {
  const creds = [
    ['gym@example.com', 'password123'],
    ['hub@gym.com', 'password123'],
    ['institution@test.com', 'password123'],
  ];
  let token = null;
  for (const [email, password] of creds) {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();
    if (res.ok && body.accessToken) {
      token = body.accessToken;
      console.log('logged in as', email);
      break;
    }
  }
  if (!token) {
    console.log('login failed for all creds');
    return;
  }
  const res = await fetch(`${API}/institutions/me/members?limit=5`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('status', res.status);
  const text = await res.text();
  console.log(text.slice(0, 8000));
}

main().catch(console.error);
