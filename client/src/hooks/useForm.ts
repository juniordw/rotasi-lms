// src/hooks/useForm.ts
import { useState, ChangeEvent, FormEvent } from 'react';

type ValidationRules<T> = {
  [K in keyof T]?: {
    required?: boolean;
    minLength?: number;
    pattern?: RegExp;
    custom?: (value: any, formValues: T) => boolean;
    errorMessage?: string;
  };
};

type ValidationErrors<T> = {
  [K in keyof T]?: string;
};

export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: ValidationRules<T>,
  onSubmit?: (values: T) => void | Promise<void>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name as keyof T]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    if (!validationRules) return true;

    const newErrors: ValidationErrors<T> = {};
    let isValid = true;

    for (const field in validationRules) {
      const rules = validationRules[field];
      const value = values[field];

      if (rules?.required && (!value || (typeof value === 'string' && !value.trim()))) {
        newErrors[field] = rules.errorMessage || 'Field ini wajib diisi';
        isValid = false;
        continue;
      }

      if (rules?.minLength && typeof value === 'string' && value.length < rules.minLength) {
        newErrors[field] = rules.errorMessage || `Minimal ${rules.minLength} karakter`;
        isValid = false;
        continue;
      }

      if (rules?.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        newErrors[field] = rules.errorMessage || 'Format tidak valid';
        isValid = false;
        continue;
      }

      if (rules?.custom && !rules.custom(value, values)) {
        newErrors[field] = rules.errorMessage || 'Input tidak valid';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const isValid = validate();
    if (!isValid || !onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setFieldValue: (name: keyof T, value: any) => 
      setValues(prev => ({ ...prev, [name]: value })),
    resetForm: () => {
      setValues(initialValues);
      setErrors({});
    }
  };
}