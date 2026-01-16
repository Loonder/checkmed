// 🎓 ARQUIVO DE TIPOS - RecurrenceTypes
// Este arquivo define a "forma" dos dados que vamos usar

// O que é isso? 
// TypeScript nos ajuda a evitar erros dizendo "esse dado tem que ser desse jeito"

export interface RecurrenceRule {
    // Frequência = Com que frequência repete?
    frequency: 'never' | 'daily' | 'weekly' | 'monthly';
    // 'never' = Não repete
    // 'daily' = Todo dia
    // 'weekly' = Toda semana
    // 'monthly' = Todo mês

    // Intervalo = A cada quantos? (Ex: a cada 2 semanas = interval: 2)
    interval: number;

    // Dias da semana (só usado quando frequency = 'weekly')
    // 0 = Domingo, 1 = Segunda, 2 = Terça... 6 = Sábado
    byweekday: number[];

    // Quando termina? Duas opções:
    // 1. Termina em uma data específica
    endDate?: string; // "2026-03-15"

    // 2. OU repete X vezes
    count?: number; // 10 = repete 10 vezes
}

// Tipo do modal (props = parâmetros que o componente recebe)
export interface RecurrenceModalProps {
    // Está aberto ou fechado?
    isOpen: boolean;

    // Função pra fechar o modal
    onClose: () => void;

    // Função pra salvar a recorrência (recebe a regra criada)
    onSave: (rule: RecurrenceRule) => void;

    // Data/hora inicial do appointment (opcional)
    startDateTime?: Date;
}
