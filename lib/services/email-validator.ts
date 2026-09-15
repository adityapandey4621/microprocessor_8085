import validate from 'deep-email-validator';

export async function validateEmailStrict(email: string): Promise<{ valid: boolean; reason?: string }> {
  try {
    const res = await validate({
      email: email,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP: true, // Turned back on to aggressively block non-existent mailboxes
    });

    if (res.valid) {
      return { valid: true };
    }

    // Identify the reason it failed
    const failedValidators = Object.keys(res.validators).filter((k) => {
      const validator = res.validators[k as keyof typeof res.validators];
      return validator && !validator.valid;
    });

    if (failedValidators.includes('disposable')) {
      return { valid: false, reason: 'Disposable email addresses are not allowed.' };
    }

    if (failedValidators.includes('mx')) {
      return { valid: false, reason: 'The email domain does not have a valid mail server.' };
    }

    if (failedValidators.includes('smtp')) {
      return { valid: false, reason: 'The specific mailbox does not appear to exist on this server.' };
    }

    if (failedValidators.includes('regex')) {
      return { valid: false, reason: 'The email format is invalid.' };
    }

    return { valid: false, reason: 'Email validation failed.' };
  } catch (error) {
    console.error('Email validation error:', error);
    // If our validation library crashes for some reason, we could choose to allow it or deny it.
    // Denying by default is safer for stopping spam.
    return { valid: false, reason: 'Could not verify email at this time.' };
  }
}
