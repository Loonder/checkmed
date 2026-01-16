/**
 * CheckMed - Validation Utilities
 * Server-safe validation functions for forms and API
 */

// ============================================================
// CPF Validation (Brazilian Tax ID)
// ============================================================

/**
 * Validates a Brazilian CPF number
 * @param cpf - The CPF string to validate (with or without formatting)
 * @returns true if valid, false otherwise
 */
export function isValidCPF(cpf: string): boolean {
    // Remove non-numeric characters
    const cleanCPF = cpf.replace(/\D/g, '');

    // Must have 11 digits
    if (cleanCPF.length !== 11) return false;

    // Reject known invalid patterns (all same digits)
    if (/^(\d)\1+$/.test(cleanCPF)) return false;

    // Validate first check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(cleanCPF.charAt(9))) return false;

    // Validate second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    checkDigit = 11 - (sum % 11);
    if (checkDigit >= 10) checkDigit = 0;
    if (checkDigit !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
}

/**
 * Formats a CPF string to the standard format: 000.000.000-00
 */
export function formatCPF(cpf: string): string {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11) return cpf;
    return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// ============================================================
// Email Validation
// ============================================================

/**
 * Validates email format (RFC 5322 simplified)
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
}

// ============================================================
// Phone Validation (Brazilian)
// ============================================================

/**
 * Validates Brazilian phone number
 * Accepts: (11) 99999-9999, 11999999999, etc.
 */
export function isValidBrazilianPhone(phone: string): boolean {
    const clean = phone.replace(/\D/g, '');
    // 10 digits (landline) or 11 digits (mobile)
    return clean.length === 10 || clean.length === 11;
}

/**
 * Formats phone to standard: (00) 00000-0000
 */
export function formatPhone(phone: string): string {
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 11) {
        return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    if (clean.length === 10) {
        return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
}

// ============================================================
// Sanitization
// ============================================================

/**
 * Sanitize text input - removes potential XSS vectors
 */
export function sanitizeText(input: string): string {
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .trim();
}

/**
 * Sanitize for database - basic SQL injection prevention
 * Note: Always use parameterized queries. This is a secondary layer.
 */
export function sanitizeForDB(input: string): string {
    return input
        .replace(/'/g, "''")
        .replace(/;/g, '')
        .replace(/--/g, '')
        .trim();
}

// ============================================================
// Name Validation
// ============================================================

/**
 * Validates a person's name
 * - At least 2 characters
 * - Only letters, spaces, and common accents
 */
export function isValidName(name: string): boolean {
    if (!name || name.trim().length < 2) return false;
    // Allow letters, spaces, accents, hyphens, apostrophes
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    return nameRegex.test(name.trim());
}

// ============================================================
// Password Validation
// ============================================================

export interface PasswordStrength {
    isValid: boolean;
    score: number; // 0-4
    feedback: string[];
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('Mínimo 8 caracteres');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Inclua letra maiúscula');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Inclua letra minúscula');

    if (/[0-9]/.test(password)) score++;
    else feedback.push('Inclua um número');

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else feedback.push('Inclua caractere especial');

    return {
        isValid: score >= 3 && password.length >= 6,
        score: Math.min(score, 4),
        feedback
    };
}

// ============================================================
// Date Validation
// ============================================================

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d > new Date();
}

/**
 * Check if date is a valid Date object
 */
export function isValidDate(date: unknown): date is Date {
    return date instanceof Date && !isNaN(date.getTime());
}

// ============================================================
// Tenant/Slug Validation
// ============================================================

/**
 * Validates a URL-safe slug
 */
export function isValidSlug(slug: string): boolean {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
}
