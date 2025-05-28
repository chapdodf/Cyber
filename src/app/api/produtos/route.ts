import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || '';
  try {
    console.log('Iniciando busca de produtos...');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/produtos`, {
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    console.log('Status da resposta:', response.status);
    
    if (!response.ok) {
      console.error('Erro na resposta do backend:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Detalhes do erro:', errorData);
      return NextResponse.json(
        { error: 'Erro ao buscar produtos', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Dados recebidos:', data);
    
    // Garantir que retornamos um array
    const produtos = Array.isArray(data) ? data : data.produtos || [];
    console.log('Produtos processados:', produtos);
    
    return NextResponse.json(produtos);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return NextResponse.json(
      { error: 'Erro interno ao buscar produtos' },
      { status: 500 }
    );
  }
} 