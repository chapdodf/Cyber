import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  console.log('STRIPE_SECRET_KEY (build/runtime):', process.env.STRIPE_SECRET_KEY);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
  });
  try {
    const body = await req.json();
    const { items, email } = body;

    if (!items || !email) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Criar a sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.name,
            description: `Licença ${item.tipoUso}`,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100), // Stripe usa centavos
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/carrinho`,
      customer_email: email,
      metadata: {
        items: JSON.stringify(items),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Erro no checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pagamento' },
      { status: 500 }
    );
  }
} 