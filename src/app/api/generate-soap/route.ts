import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getClientIP, getRateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit'
import { sanitizeText } from '@/lib/validations'

// AI Service Configuration
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai' // 'openai' | 'google'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY

interface SOAPGenerationRequest {
    transcript: string
    patientName?: string
    patientContext?: {
        age?: number
        allergies?: string[]
        medications?: string[]
    }
}

export async function POST(req: NextRequest) {
    try {
        // 🛡️ Rate Limiting - Protect expensive AI calls
        const clientIP = getClientIP(req.headers)
        const rateLimit = checkRateLimit(`soap:${clientIP}`, RATE_LIMITS.AI_API)

        if (!rateLimit.success) {
            return NextResponse.json(
                { error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' },
                {
                    status: 429,
                    headers: getRateLimitHeaders(rateLimit, RATE_LIMITS.AI_API.limit)
                }
            )
        }

        // 🛡️ Auth Check - Only authenticated users can use AI features
        const authHeader = req.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            // Check via cookie session as fallback
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
            const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

            if (supabaseUrl && supabaseKey) {
                const supabase = createClient(supabaseUrl, supabaseKey, {
                    global: { headers: { Cookie: req.headers.get('cookie') || '' } }
                })
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    return NextResponse.json(
                        { error: 'Autenticação necessária para usar esta funcionalidade.' },
                        { status: 401 }
                    )
                }
            }
        }

        const body: SOAPGenerationRequest = await req.json()
        const { transcript, patientName, patientContext } = body

        if (!transcript || transcript.trim().length === 0) {
            return NextResponse.json(
                { error: 'Transcript is required and cannot be empty' },
                { status: 400 }
            )
        }

        // 🛡️ Sanitize inputs
        const sanitizedTranscript = sanitizeText(transcript)
        const sanitizedPatientName = patientName ? sanitizeText(patientName) : undefined

        let soapNote: string

        if (AI_PROVIDER === 'google' && GOOGLE_AI_API_KEY) {
            soapNote = await generateWithGemini(transcript, patientName, patientContext)
        } else if (OPENAI_API_KEY) {
            soapNote = await generateWithOpenAI(transcript, patientName, patientContext)
        } else {
            return NextResponse.json(
                { error: 'No AI provider configured. Please set OPENAI_API_KEY or GOOGLE_AI_API_KEY' },
                { status: 500 }
            )
        }

        return NextResponse.json({ soapNote }, { status: 200 })

    } catch (error: any) {
        console.error('SOAP Generation Error:', error)
        return NextResponse.json(
            { error: 'Failed to generate SOAP note', details: error.message },
            { status: 500 }
        )
    }
}

async function generateWithOpenAI(
    transcript: string,
    patientName?: string,
    context?: any
): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `Você é um assistente médico especializado em criar notas SOAP (Subjetivo, Objetivo, Avaliação, Plano) precisas e detalhadas em português do Brasil. 

Instruções:
- Analise a transcrição da consulta médica
- Extraia informações relevantes para cada seção SOAP
- Seja objetivo e use terminologia médica apropriada
- Mantenha formatação clara e profissional
- Se informações estiverem faltando, indique claramente

Formato esperado:
**S (Subjetivo):**
[Queixas do paciente, histórico, sintomas relatados]

**O (Objetivo):**
[Exame físico, sinais vitais, observações clínicas]

**A (Avaliação):**
[Hipótese diagnóstica, análise clínica]

**P (Plano):**
[Conduta médica, prescrições, orientações, retorno]`,
                },
                {
                    role: 'user',
                    content: `Paciente: ${patientName || 'Não identificado'}
${context ? `Contexto Adicional: ${JSON.stringify(context)}` : ''}

Transcrição da Consulta:
${transcript}

Gere uma nota SOAP completa e profissional baseada nesta consulta.`,
                },
            ],
            temperature: 0.3,
            max_tokens: 1500,
        }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenAI API Error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'Erro ao gerar nota SOAP'
}

async function generateWithGemini(
    transcript: string,
    patientName?: string,
    context?: any
): Promise<string> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GOOGLE_AI_API_KEY}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: `Você é um assistente médico especializado em criar notas SOAP (Subjetivo, Objetivo, Avaliação, Plano) precisas e detalhadas em português do Brasil.

Paciente: ${patientName || 'Não identificado'}
${context ? `Contexto: ${JSON.stringify(context)}` : ''}

Transcrição da Consulta:
${transcript}

Crie uma nota SOAP profissional e detalhada seguindo este formato:

**S (Subjetivo):**
[Queixas do paciente, histórico, sintomas relatados]

**O (Objetivo):**
[Exame físico, sinais vitais, observações clínicas]

**A (Avaliação):**
[Hipótese diagnóstica, análise clínica]

**P (Plano):**
[Conduta médica, prescrições, orientações, retorno]`,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1500,
                },
            }),
        }
    )

    if (!response.ok) {
        const error = await response.json()
        throw new Error(`Google AI Error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Erro ao gerar nota SOAP'
}
