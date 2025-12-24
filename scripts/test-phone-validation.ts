import assert from 'assert';
import {
  normalizePhone,
  isValidPhone,
  formatPhone,
  normalizePhoneE164,
} from '../src/lib/validation/phone';

console.log('Testing phone validation utils...');

assert.strictEqual(normalizePhone('+7 (900) 123-45-67'), '79001234567');
assert.strictEqual(normalizePhone('8 (900) 123-45-67'), '79001234567');
assert.strictEqual(normalizePhone('9001234567'), '79001234567');
assert.strictEqual(normalizePhoneE164('9001234567'), '+79001234567');
assert.strictEqual(isValidPhone('+79001234567'), true);
assert.strictEqual(isValidPhone('123'), false);
assert.strictEqual(formatPhone('+79001234567'), '+7 (900) 123-45-67');
// Edge cases
assert.strictEqual(formatPhone(undefined), null);
assert.strictEqual(formatPhone(null), null);
assert.strictEqual(formatPhone(normalizePhone('8 900 1234567')), '+7 (900) 123-45-67');
assert.strictEqual(isValidPhone(''), false);

console.log('All phone tests passed.');
