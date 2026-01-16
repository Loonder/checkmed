import { describe, it, expect } from 'vitest';
import {
    isValidCPF,
    formatCPF,
    isValidEmail,
    isValidBrazilianPhone,
    formatPhone,
    isValidName,
    validatePassword,
    sanitizeText,
    isValidSlug
} from './validations';

describe('Validation Utilities', () => {

    describe('CPF Validation', () => {
        it('should validate correct CPF', () => {
            expect(isValidCPF('52998224725')).toBe(true);  // Generated valid CPF
            expect(isValidCPF('529.982.247-25')).toBe(true);
        });

        it('should invalidate incorrect CPF', () => {
            expect(isValidCPF('11111111111')).toBe(false);
            expect(isValidCPF('12345678900')).toBe(false);
            expect(isValidCPF('abc')).toBe(false);
        });

        it('should format CPF correctly', () => {
            expect(formatCPF('11122233344')).toBe('111.222.333-44');
            expect(formatCPF('111222333')).toBe('111222333'); // Too short
        });
    });

    describe('Email Validation', () => {
        it('should validate valid emails', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
        });

        it('should invalidate invalid emails', () => {
            expect(isValidEmail('invalid')).toBe(false);
            expect(isValidEmail('test@')).toBe(false);
            expect(isValidEmail('@domain.com')).toBe(false);
        });
    });

    describe('Phone Validation', () => {
        it('should validate valid brazilian phones', () => {
            expect(isValidBrazilianPhone('11999998888')).toBe(true); // Cell
            expect(isValidBrazilianPhone('1133334444')).toBe(true);  // Landline
        });

        it('should format phones correctly', () => {
            expect(formatPhone('11999998888')).toBe('(11) 99999-8888');
            expect(formatPhone('1133334444')).toBe('(11) 3333-4444');
        });
    });

    describe('Name Sanitization', () => {
        it('should sanitize HTML tags', () => {
            const malicious = '<script>alert(1)</script>';
            expect(sanitizeText(malicious)).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
        });

        it('should validate simple names', () => {
            expect(isValidName('John Doe')).toBe(true);
            expect(isValidName('J')).toBe(false);
        });
    });

    describe('Password Validation', () => {
        it('should calculate password strength', () => {
            // Weak
            expect(validatePassword('123').isValid).toBe(false);
            // Strong
            const strong = validatePassword('StrongP@ss1');
            expect(strong.isValid).toBe(true);
            expect(strong.score).toBeGreaterThanOrEqual(3);
        });
    });

    describe('Slug Validation', () => {
        it('should validate url slugs', () => {
            expect(isValidSlug('my-clinic-1')).toBe(true);
            expect(isValidSlug('Invalid Slug')).toBe(false);
            expect(isValidSlug('sh')).toBe(false); // Too short
        });
    });
});
