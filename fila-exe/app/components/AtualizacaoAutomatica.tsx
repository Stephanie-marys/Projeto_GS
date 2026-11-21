"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Recarrega os dados da página (Server Components) a cada `segundos`,
 * sem perder o estado do cliente. Usado na fila e no controle de pedidos
 * para refletir mudanças feitas em outros dispositivos.
 */
export default function AtualizacaoAutomatica({ segundos = 10 }: { segundos?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), segundos * 1000);
    return () => clearInterval(id);
  }, [router, segundos]);

  return null;
}
