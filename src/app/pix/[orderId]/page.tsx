"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

export default function PixPage() {
  const { orderId } = useParams();
  const [pixData, setPixData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPixData = async () => {
      try {
        const response = await fetch(`/api/pix/${orderId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erro ao buscar dados do PIX");
        }

        setPixData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados do PIX");
      }
    };

    fetchPixData();
  }, [orderId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!pixData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-black/50 p-8 rounded-lg border border-[#39ff14]/20">
        <h1 className="text-2xl text-[#39ff14] mb-4">Pagamento via PIX</h1>
        <div className="mb-4">
          <Image
            src={pixData.qrCode}
            alt="QR Code PIX"
            width={300}
            height={300}
            className="mx-auto"
          />
        </div>
        <div className="mb-4">
          <p className="text-white mb-2">Chave PIX:</p>
          <div className="bg-black/50 p-2 rounded border border-[#39ff14]/20">
            <code className="text-[#39ff14] break-all">{pixData.qrCodeText}</code>
          </div>
        </div>
        <p className="text-white text-sm">
          Após o pagamento, você receberá um e-mail com a confirmação.
        </p>
      </div>
    </div>
  );
} 