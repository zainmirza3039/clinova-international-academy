export type FormFieldKind = 'text' | 'email' | 'url';

export interface FormFieldRule {
  required?: boolean;
  maxLength: number;
  kind?: FormFieldKind;
}

export type FormFieldRules = Record<string, FormFieldRule>;

export interface ValidatedForm {
  values: Record<string, string | null>;
  error?: string;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateFormFields(
  rawValues: Record<string, unknown>,
  rules: FormFieldRules,
): ValidatedForm {
  const values: Record<string, string | null> = {};

  for (const [name, rule] of Object.entries(rules)) {
    const value = String(rawValues[name] ?? '').trim();

    if (!value) {
      if (rule.required) {
        return { values, error: 'Please complete all required fields.' };
      }
      values[name] = null;
      continue;
    }

    if (value.length > rule.maxLength) {
      return { values, error: 'One or more fields are too long. Please shorten your response.' };
    }

    if (rule.kind === 'email' && (value.length < 3 || !emailPattern.test(value))) {
      return { values, error: 'Please enter a valid email address.' };
    }

    if (rule.kind === 'url' && !isHttpUrl(value)) {
      return { values, error: 'Please enter a valid website URL beginning with http:// or https://.' };
    }

    values[name] = value;
  }

  return { values };
}
