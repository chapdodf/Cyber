import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/testimonials`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar depoimentos');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na API de depoimentos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
} 