export type FormaPagamento = "dinheiro" | "pix" | "debito" | "credito";

export const FORMAS_PAGAMENTO: FormaPagamento[] = [
  "dinheiro",
  "pix",
  "debito",
  "credito",
];

export const ROTULO_FORMA_PAGAMENTO: Record<FormaPagamento, string> = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  debito: "Cartão de débito",
  credito: "Cartão de crédito",
};

export interface ItemVenda {
  produtoId: string;
  nome: string;
  precoUnitario: number;
  quantidade: number;
  subtotal: number;
}

export interface Venda {
  id: string;
  criadoEm: string;
  origem: "presencial";
  clienteNome: string;
  itens: ItemVenda[];
  total: number;
  formaPagamento: FormaPagamento;
  valorRecebido?: number;
  troco: number;
}

export interface ItemVendaInput {
  produtoId: string;
  quantidade: number;
}

export interface NovaVendaInput {
  clienteNome?: string;
  itens: ItemVendaInput[];
  formaPagamento: string;
  valorRecebido?: number;
}
