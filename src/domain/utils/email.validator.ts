// Tipo para resultado de validación
type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

// Validación básica (solo @ y dominio)
export function validateEmailBasic(email: string): boolean {
  const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return basicRegex.test(email);
}

// Validación completa con detalles
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  
  // Verificaciones básicas
  if (!email || typeof email !== 'string') {
    errors.push('Email es requerido y debe ser texto');
    return { isValid: false, errors };
  }
  
  if (!email.includes('@')) {
    errors.push('Email debe contener @');
  }
  
  if (!email.includes('.')) {
    errors.push('Email debe contener un dominio válido');
  }
  
  // Regex más completa
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    errors.push('Formato de email inválido');
  }
  
  // Verificar longitud
  if (email.length > 254) {
    errors.push('Email demasiado largo');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validador con dominios específicos
export function validateEmailWithDomains(
  email: string, 
  allowedDomains: string[] = []
): ValidationResult {
  const basicValidation = validateEmail(email);
  
  if (!basicValidation.isValid) {
    return basicValidation;
  }
  
  if (allowedDomains.length > 0) {
    const domain = email.split('@')[1];
    if (!allowedDomains.includes(domain)) {
      return {
        isValid: false,
        errors: [`Dominio ${domain} no está permitido`]
      };
    }
  }
  
  return { isValid: true, errors: [] };
}

// Tipo para emails validados
export type ValidEmail = string & { readonly __brand: unique symbol };

// Type guard para emails
export function isValidEmail(email: string): email is ValidEmail {
  return validateEmail(email).isValid;
}