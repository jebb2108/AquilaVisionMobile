const PATIENT_PHONE_MASK_SLOTS = [4, 5, 6, 9, 10, 11, 13, 14, 16, 17];

export function getPatientPhoneState(value) {
  const rawValue = String(value || '').trim();
  const digits = rawValue.replace(/\D/g, '');
  const hasExplicitPlus = rawValue.startsWith('+');

  if (!digits) {
    return {
      countryCode: '7',
      localDigits: '',
      hasDigits: false,
      hasExplicitPlus,
    };
  }

  if (hasExplicitPlus) {
    return {
      countryCode: digits[0],
      localDigits: digits.slice(1, 11),
      hasDigits: true,
      hasExplicitPlus,
    };
  }

  if (digits.startsWith('9')) {
    return {
      countryCode: '7',
      localDigits: digits.slice(0, 10),
      hasDigits: true,
      hasExplicitPlus: false,
    };
  }

  if (digits.startsWith('7') || digits.startsWith('8')) {
    return {
      countryCode: '7',
      localDigits: digits.slice(1, 11),
      hasDigits: true,
      hasExplicitPlus: false,
    };
  }

  return {
    countryCode: digits[0],
    localDigits: digits.slice(1, 11),
    hasDigits: true,
    hasExplicitPlus: false,
  };
}

export function buildPatientPhoneMaskFromState(countryCode, localDigits) {
  const digits = String(localDigits || '').split('');
  const masked = `+${countryCode} (___) ___-__-__`.split('');

  PATIENT_PHONE_MASK_SLOTS.forEach((slotIndex, digitIndex) => {
    if (digits[digitIndex]) {
      masked[slotIndex] = digits[digitIndex];
    }
  });

  return masked.join('');
}

export function buildPatientPhoneMask(value) {
  const phoneState = getPatientPhoneState(value);
  return buildPatientPhoneMaskFromState(phoneState.countryCode, phoneState.localDigits);
}

export function countPatientLocalDigitsBeforeCaret(value, caretPosition) {
  const rawValue = String(value || '');
  const digits = rawValue.replace(/\D/g, '');
  const digitsBeforeCaret = rawValue.slice(0, caretPosition).replace(/\D/g, '');

  if (!digitsBeforeCaret.length) return 0;
  if (rawValue.trim().startsWith('+')) return Math.max(digitsBeforeCaret.length - 1, 0);
  if (digits.startsWith('9')) return Math.min(digitsBeforeCaret.length, 10);
  return Math.max(digitsBeforeCaret.length - 1, 0);
}

export function getPatientPhoneCaretPosition(maskedValue, localDigitCount) {
  if (!maskedValue) return 0;
  if (!localDigitCount) return PATIENT_PHONE_MASK_SLOTS[0];
  if (localDigitCount >= PATIENT_PHONE_MASK_SLOTS.length) return maskedValue.length;
  return PATIENT_PHONE_MASK_SLOTS[localDigitCount];
}

export function extractPatientPhoneDigits(value) {
  return getPatientPhoneState(value).localDigits;
}

export function isPatientPhoneComplete(value) {
  return extractPatientPhoneDigits(value).length === 10;
}

export function formatPhoneNumber(value) {
  const rawValue = String(value || '').trim();
  const digits = rawValue.replace(/\D/g, '');

  if (!digits) return '';

  let normalizedDigits = digits;

  if (normalizedDigits.length === 10) {
    normalizedDigits = `7${normalizedDigits}`;
  } else if (normalizedDigits.length === 11 && normalizedDigits.startsWith('8')) {
    normalizedDigits = `7${normalizedDigits.slice(1)}`;
  }

  if (normalizedDigits.length === 11 && normalizedDigits.startsWith('7')) {
    return `+7 (${normalizedDigits.slice(1, 4)}) ${normalizedDigits.slice(4, 7)}-${normalizedDigits.slice(7, 9)}-${normalizedDigits.slice(9, 11)}`;
  }

  return rawValue;
}
