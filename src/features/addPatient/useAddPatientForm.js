import { useMemo, useRef, useState } from 'react';
import { OPERATION_TYPES, createCanonicalPatient } from '../../data/clinicPatients';
import {
  buildPatientPhoneMask,
  buildPatientPhoneMaskFromState,
  countPatientLocalDigitsBeforeCaret,
  formatPhoneNumber,
  getPatientPhoneCaretPosition,
  getPatientPhoneState,
  isPatientPhoneComplete,
} from '../../domain/patient/phoneMask';

const initialForm = {
  patientName: '',
  birthDate: '',
  gender: 'male',
  phone: '',
  cardNumber: '',
  eye: 'OU',
  type: 'femto',
  operationStart: '',
  flapThickness: 100,
  ringDiameter: 9.0,
  operationCount: 1,
  specialNotes: '',
};

const formatBirthDateInput = (value) => {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 8);
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 4),
    digits.slice(4, 8),
  ].filter(Boolean);

  return parts.join('.');
};

export function useAddPatientForm({ onAddPatient }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const phoneInputRef = useRef(null);

  const isFemto = form.type === 'femto';
  const isFrk = form.type === 'frk';

  const operationLabel = useMemo(() => {
    return OPERATION_TYPES.find(item => item.value === form.type)?.label || form.type.toUpperCase();
  }, [form.type]);

  const updateField = (field, value) => {
    setError('');
    setForm(prev => {
      const next = { ...prev, [field]: value };

      if (field === 'type' && value === 'frk') {
        next.operationCount = 1;
      }

      return next;
    });
  };

  const setPhoneField = (value, caretPosition) => {
    updateField('phone', value);

    window.requestAnimationFrame(() => {
      phoneInputRef.current?.setSelectionRange(caretPosition, caretPosition);
    });
  };

  const syncPhoneMask = (input) => {
    const rawValue = input.value.trim();
    const phoneState = getPatientPhoneState(rawValue);
    const caretPosition = input.selectionStart ?? rawValue.length;
    const localDigitsBeforeCaret = countPatientLocalDigitsBeforeCaret(input.value, caretPosition);
    let nextValue = '';

    if (!rawValue) {
      setPhoneField('', 0);
      return;
    }

    if (!phoneState.hasDigits && phoneState.hasExplicitPlus) {
      nextValue = '+';
    } else {
      nextValue = phoneState.hasDigits ? buildPatientPhoneMask(rawValue) : '';
    }

    const nextCaretPosition = nextValue === '+'
      ? 1
      : getPatientPhoneCaretPosition(nextValue, localDigitsBeforeCaret);

    setPhoneField(nextValue, nextCaretPosition);
  };

  const handlePhoneChange = (event) => {
    syncPhoneMask(event.target);
  };

  const handlePhoneKeyDown = (event) => {
    if (event.key !== 'Backspace' && event.key !== 'Delete') return;
    if (!event.currentTarget.value) return;

    const selectionStart = event.currentTarget.selectionStart ?? 0;
    const selectionEnd = event.currentTarget.selectionEnd ?? selectionStart;
    const phoneState = getPatientPhoneState(event.currentTarget.value);
    const localDigits = phoneState.localDigits.split('');

    if (!localDigits.length) {
      event.preventDefault();
      setPhoneField('', 0);
      return;
    }

    let removeStart = countPatientLocalDigitsBeforeCaret(event.currentTarget.value, selectionStart);
    let removeEnd = countPatientLocalDigitsBeforeCaret(event.currentTarget.value, selectionEnd);

    if (selectionStart === selectionEnd) {
      if (event.key === 'Backspace') {
        removeStart = Math.max(removeStart - 1, 0);
        removeEnd = Math.max(removeEnd, removeStart);
      } else {
        removeEnd = Math.min(removeStart + 1, localDigits.length);
      }
    }

    if (removeStart === removeEnd) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    localDigits.splice(removeStart, removeEnd - removeStart);

    const nextDigits = localDigits.join('').slice(0, 10);

    if (!nextDigits) {
      setPhoneField('', 0);
      return;
    }

    const nextValue = buildPatientPhoneMaskFromState(phoneState.countryCode, nextDigits);
    const nextCaretPosition = getPatientPhoneCaretPosition(
      nextValue,
      Math.min(removeStart, nextDigits.length)
    );

    setPhoneField(nextValue, nextCaretPosition);
  };

  const handlePhoneBlur = () => {
    const phoneState = getPatientPhoneState(form.phone);

    if (!phoneState.localDigits.length) {
      updateField('phone', '');
      return;
    }

    updateField(
      'phone',
      isPatientPhoneComplete(form.phone)
        ? formatPhoneNumber(form.phone)
        : buildPatientPhoneMask(form.phone)
    );
  };

  const updateBirthDate = (value) => {
    updateField('birthDate', formatBirthDateInput(value));
  };

  const cycleValue = (field, values) => {
    setError('');
    setForm(prev => {
      const currentIndex = values.findIndex(value => String(value) === String(prev[field]));
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % values.length;
      const nextValue = values[nextIndex];

      const next = {
        ...prev,
        [field]: nextValue,
      };

      if (field === 'type' && nextValue === 'frk') {
        next.operationCount = 1;
      }

      return next;
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setError('');
  };

  const submitPatient = (event) => {
    event.preventDefault();

    if (!form.patientName.trim()) {
      setError('Введите ФИО пациента');
      return;
    }

    if (!form.cardNumber.trim()) {
      setError('Введите №');
      return;
    }

    if (!form.operationStart.trim()) {
      setError('Укажите время операции');
      return;
    }

    const patient = createCanonicalPatient({
      ...form,
      id: `manual-${Date.now()}`,
      operationCount: isFrk ? 1 : form.operationCount,
      operationTitle: operationLabel,
    });

    onAddPatient(patient);
    resetForm();
  };

  return {
    error,
    form,
    isFemto,
    isFrk,
    operationLabel,
    phoneInputRef,
    cycleValue,
    handlePhoneBlur,
    handlePhoneChange,
    handlePhoneKeyDown,
    submitPatient,
    updateBirthDate,
    updateField,
  };
}
