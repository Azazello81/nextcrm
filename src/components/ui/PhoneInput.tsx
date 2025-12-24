import React, { forwardRef } from 'react';
import { PatternFormat } from 'react-number-format';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import { normalizePhone, PHONE_MASK } from '@/lib/validation/phone';

export type PhoneInputProps = Omit<TextFieldProps, 'value' | 'onChange'> & {
  /** Normalized digits-only phone number (E.164 without plus), e.g. 79001234567 */
  value?: string | null;
  /** Called with normalized digits (or null) and raw masked string */
  onChange?: (normalized: string | null, rawValue?: string) => void;
  mask?: string;
};

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { value, onChange, mask = PHONE_MASK, ...textFieldProps },
  ref,
) {
  const digits = value || '';
  const displayValue = digits.startsWith('7') ? digits : digits ? '7' + digits : '';

  const { defaultValue: _dv, type: _type, ...restTextFieldProps } = textFieldProps;

  return (
    <PatternFormat
      format="+7 (###) ### ## ##"
      allowEmptyFormatting={true}
      mask=" "
      value={displayValue}
      onValueChange={({ value: rawDigits, formattedValue }) => {
        const normalized = normalizePhone(rawDigits);
        onChange?.(normalized, formattedValue);
      }}
      isAllowed={(values) => {
        const { value } = values;
        // Разрешаем только если количество цифр <= 11 (7 + 10 цифр номера)
        return !value || value.length <= 11;
      }}
      placeholder="+7 (   )       "
      customInput={TextField}
      inputRef={ref}
      {...restTextFieldProps}
    />
  );
});

export default PhoneInput;

export function NativePhoneInput({
  value,
  onChange,
  mask = PHONE_MASK,
  className,
  placeholder,
  ...rest
}: {
  value?: string | null;
  onChange?: (normalized: string | null, rawValue?: string) => void;
  mask?: string;
  className?: string;
  placeholder?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  const digits = value || '';
  const displayValue = digits.startsWith('7') ? digits : digits ? '7' + digits : '';

  const NativeInput = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
  >((props, inputRef) => <input ref={inputRef} {...props} />);
  NativeInput.displayName = 'NativeMaskedInput';

  const { defaultValue: _dv, type: _type, ...restInputProps } = rest;

  return (
    <PatternFormat
      format="+7 (###) ### ## ##"
      allowEmptyFormatting={true}
      mask=" "
      value={displayValue}
      onValueChange={({ value: rawDigits, formattedValue }) => {
        const normalized = normalizePhone(rawDigits);
        onChange?.(normalized, formattedValue);
      }}
      isAllowed={(values) => {
        const { value } = values;
        // Разрешаем только если количество цифр <= 11 (7 + 10 цифр номера)
        return !value || value.length <= 11;
      }}
      customInput={NativeInput}
      className={className}
      placeholder={placeholder || '+7 (   )       '}
      {...restInputProps}
    />
  );
}
