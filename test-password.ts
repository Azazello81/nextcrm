import { PasswordService } from './src/lib/auth/password';

async function test() {
  const hash = await PasswordService.hashPassword('test123');
  console.log('Hash:', hash);

  const isValid = await PasswordService.verifyPassword('test123', hash);
  console.log('Password valid:', isValid);
}

test();
