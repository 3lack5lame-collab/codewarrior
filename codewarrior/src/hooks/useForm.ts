import { useState, useCallback } from 'react';

type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: any) => boolean | string;
  message?: string;
};

type ValidationRules = {
  [key: string]: ValidationRule;
};

interface UseFormReturn<T> {
  values: T;
  errors: { [K in keyof T]?: string };
  touched: { [K in keyof T]?: boolean };
  handleChange: (name: keyof T) => (value: any) => void;
  handleBlur: (name: keyof T) => () => void;
  handleSubmit: (onSubmit: (values: T) => void) => void;
  reset: () => void;
  isValid: boolean;
  isDirty: boolean;
}

export const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules
): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<{ [K in keyof T]?: string }>({});
  const [touched, setTouched] = useState<{ [K in keyof T]?: boolean }>({});
  const [isDirty, setIsDirty] = useState(false);

  const validateField = useCallback((name: keyof T, value: any): string => {
    if (!validationRules || !validationRules[name as string]) return '';

    const rules = validationRules[name as string];

    if (rules.required && !value) {
      return rules.message || 'This field is required';
    }

    if (rules.minLength && value.length < rules.minLength) {
      return rules.message || `Minimum length is ${rules.minLength}`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.message || `Maximum length is ${rules.maxLength}`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message || 'Invalid format';
    }

    if (rules.validate) {
      const result = rules.validate(value);
      if (typeof result === 'string') return result;
      if (!result) return rules.message || 'Invalid value';
    }

    return '';
  }, [validationRules]);

  const handleChange = useCallback((name: keyof T) => (value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name: keyof T) => () => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  const validateAll = useCallback((): boolean => {
    const newErrors: { [K in keyof T]?: string } = {};
    let isValid = true;

    Object.keys(values).forEach(key => {
      const error = validateField(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  const handleSubmit = useCallback((onSubmit: (values: T) => void) => {
    const allTouched: { [K in keyof T]: boolean } = {} as { [K in keyof T]: boolean };
    Object.keys(values).forEach(key => {
      allTouched[key as keyof T] = true;
    });
    setTouched(allTouched);

    if (validateAll()) {
      onSubmit(values);
    }
  }, [values, validateAll]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsDirty(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    isValid,
    isDirty,
  };
};