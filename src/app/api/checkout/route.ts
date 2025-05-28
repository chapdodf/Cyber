import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, email } = body;

    if (!items || !email) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Criar pedido e gerar PIX
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pix/gerar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items,
        email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao gerar PIX');
    }

    return NextResponse.json({ 
      qrCode: data.qrCode,
      qrCodeText: data.qrCodeText,
      orderId: data.orderId
    });
  } catch (error) {
    console.error('Erro no checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
} 