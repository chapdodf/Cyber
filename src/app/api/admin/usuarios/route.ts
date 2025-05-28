import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/usuarios`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro ao listar usuários');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao listar usuários' },
      { status: 500 }
    );
  }
} 