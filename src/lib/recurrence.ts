// 🎓 RECURRENCE UTILITIES - Funções para gerar datas recorrentes
// Este arquivo tem as funções que fazem a "mágica" de criar as datas repetidas!

import { addDays, addWeeks, addMonths } from 'date-fns';
import type { RecurrenceRule } from '@/types/recurrence';

/**
 * Função principal: Gera todas as datas de uma série recorrente
 * 
 * @param startDate - Data inicial (ex: 15/jan/2026 às 10h)
 * @param rule - Regra de recorrência (ex: "toda segunda por 8 semanas")
 * @returns Array de datas [15/jan, 22/jan, 29/jan, 05/fev...]
 */
export function generateRecurringDates(
    startDate: Date,
    rule: RecurrenceRule
): Date[] {
    // Se não repete, retorna só a data inicial
    if (rule.frequency === 'never') {
        return [startDate];
    }

    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    let occurrenceCount = 0;

    // Define limite máximo (pra não criar infinito por acidente!)
    const maxOccurrences = rule.count || 52; // Padrão: 52 semanas = 1 ano
    const maxDate = rule.endDate ? new Date(rule.endDate) : null;

    // Loop: Gera datas até atingir o limite
    while (occurrenceCount < maxOccurrences) {
        // Se tem data final E já passou, para!
        if (maxDate && currentDate > maxDate) {
            break;
        }

        // LÓGICA SEMANAL: Só adiciona se for um dos dias escolhidos
        if (rule.frequency === 'weekly') {
            const dayOfWeek = currentDate.getDay(); // 0=Dom, 1=Seg, 2=Ter...

            // Verifica se esse dia da semana foi selecionado
            if (rule.byweekday.includes(dayOfWeek)) {
                dates.push(new Date(currentDate));
                occurrenceCount++;
            }

            // Avança 1 dia (vai testando cada dia da semana)
            currentDate = addDays(currentDate, 1);

            // Se completou 7 dias, pula pro intervalo (ex: a cada 2 semanas)
            if (currentDate.getDay() === startDate.getDay() && rule.interval > 1) {
                currentDate = addWeeks(currentDate, rule.interval - 1);
            }

        }
        // LÓGICA DIÁRIA: Adiciona todo dia
        else if (rule.frequency === 'daily') {
            dates.push(new Date(currentDate));
            occurrenceCount++;
            currentDate = addDays(currentDate, rule.interval);
        }
        // LÓGICA MENSAL: Mesmo dia de cada mês
        else if (rule.frequency === 'monthly') {
            dates.push(new Date(currentDate));
            occurrenceCount++;
            currentDate = addMonths(currentDate, rule.interval);
        }

        // Proteção contra loop infinito (se algo der errado)
        if (occurrenceCount > 365) {
            console.warn('⚠️ Limite de segurança atingido (365 ocorrências)');
            break;
        }
    }

    return dates;
}

/**
 * Função auxiliar: Gera texto legível da regra
 * 
 * @param rule - Regra de recorrência
 * @returns Texto tipo "Repete toda segunda-feira, por 8 vezes"
 */
export function getRecurrenceSummary(rule: RecurrenceRule): string {
    if (rule.frequency === 'never') return 'Não repete';

    const weekdayNames = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

    let text = 'Repete ';

    // Frequência
    if (rule.frequency === 'daily') {
        text += rule.interval === 1 ? 'todos os dias' : `a cada ${rule.interval} dias`;
    } else if (rule.frequency === 'weekly') {
        const days = rule.byweekday.map(d => weekdayNames[d]).join(', ');
        text += rule.interval === 1
            ? `toda ${days}`
            : `a cada ${rule.interval} semanas nas ${days}`;
    } else if (rule.frequency === 'monthly') {
        text += rule.interval === 1 ? 'todo mês' : `a cada ${rule.interval} meses`;
    }

    // Término
    if (rule.endDate) {
        text += ` até ${new Date(rule.endDate).toLocaleDateString('pt-BR')}`;
    } else if (rule.count) {
        text += `, por ${rule.count} vezes`;
    }

    return text;
}
