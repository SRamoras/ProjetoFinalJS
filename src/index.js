
// ==========================================
// DESAFIO FINAL 01
// Tema: Mini-sistema de Loja + Caixa + Estoque
// ==========================================

// Objetivo
// Você vai construir um sistema completo (em memória, sem banco de dados) que:
// - mantém um catálogo de produtos e um estoque
// - cria carrinhos de compra, valida quantidades e calcula totais
// - aplica regras de preço (promoções/cupões) com prioridades e restrições
// - calcula impostos (IVA) por categoria
// - finaliza pedidos e imprime um cupom fiscal detalhado
// - gera relatórios simples de vendas

// Regras gerais
// - Não use bibliotecas externas.
// - Use apenas JavaScript (Node.js).
// - Não apague as assinaturas (nomes/params) dos métodos marcados como TODO.
// - Use estruturas de dados adequadas (Map/Array/Object).
// - Todas as validações devem lançar Error com mensagens claras.

// Como usar
// - Complete os TODOs.
// - Ao final, descomente a chamada de runDemo() no fim do arquivo.
// - O demo executa cenários que devem passar.

// ==========================================
// PARTE 0 - Dados e utilitários
// ==========================================

const CATEGORIAS = [
	"eletrodoméstico",
	"decoração",
	"materiais de construção",
	"vestuário",
	"alimentos"
];

const IVA_POR_CATEGORIA = {
	"eletrodoméstico": 0.23,
	"decoração": 0.23,
	"materiais de construção": 0.23,
	"vestuário": 0.23,
	"alimentos": 0.06
};

/**
 * Arredonda um número para 2 casas decimais.
 * @param {number} value
 * @returns {number}
 */
function round2(value) {
	return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Formata um número no padrão "R$ 0,00".
 * @param {number} value
 * @returns {string}
 */
function formatBRL(value) {
	// Evite Intl se quiser praticar manualmente.
	return `R$ ${round2(value).toFixed(2)}`.replace(".", ",");
}

/**
 * Garante que o valor é um número finito e positivo (> 0).
 * @param {number} value
 * @param {string} label
 * @throws {Error}
 */
function assertPositiveNumber(value, label) {
	if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value) || value <= 0) {
		throw new Error(`${label} deve ser um número positivo.`);
	}
}

/**
 * Garante que o valor é um inteiro não-negativo (>= 0).
 * @param {number} value
 * @param {string} label
 * @throws {Error}
 */
function assertNonNegativeInt(value, label) {
	if (!Number.isInteger(value) || value < 0) {
		throw new Error(`${label} deve ser um inteiro >= 0.`);
	}
}

/**
 * Garante que a categoria informada existe em CATEGORIAS.
 * @param {string} categoria
 * @throws {Error}
 */
function assertCategoriaValida(categoria) {
	if (!CATEGORIAS.includes(categoria)) {
		throw new Error(`Categoria inválida: ${categoria}. Aceitas: ${CATEGORIAS.join(", ")}`);
	}
}

/**
 * Garante que o valor é uma string.
 * @param {*} value
 * @param {string} label
 * @throws {Error}
 */
function assertString(value, label) {
	if (typeof value !== "string") {
			throw new Error(`${label} Deve ser uma string`);
	}
}

/**
 * Garante que quantidade é um número finito e >= 1.
 * @param {number} quantidade
 * @throws {Error}
 */
function assertQuatity(quantidade) {
	if (typeof quantidade !== "number" || Number.isNaN(quantidade) || !Number.isFinite(quantidade) || quantidade < 1) {
		throw new Error("Quantidade tem de ser >= 1");
	}
}



// ==========================================
// PARTE 1 - Modelos principais (classes)
// ==========================================

// 1) Crie a classe Produto
// Requisitos mínimos:
// - sku (string) único
// - nome (string)
// - preco (number > 0)
// - fabricante (string)
// - categoria (deve estar em CATEGORIAS)
// - numeroMaximoParcelas (int 1..24)
// Métodos:
// - getValorDeParcela(numeroDeParcelas) => number
//   - deve validar: numeroDeParcelas int >=1 e <= numeroMaximoParcelas
//   - retorna preco / numeroDeParcelas (2 casas)
class Produto {
	/**
	 * Cria um produto do catálogo.
	 * @param {Object} params
	 * @param {string} [params.sku] - Identificador único do produto.
	 * @param {string} params.nome
	 * @param {number} params.preco - Preço unitário (> 0).
	 * @param {string} params.fabricante
	 * @param {string} params.categoria - Deve existir em CATEGORIAS.
	 * @param {number} params.numeroMaximoParcelas - Inteiro entre 1 e 24.
	 */
	constructor({ sku = crypto.randomUUID(), nome, preco, fabricante, categoria, numeroMaximoParcelas }) {
		assertString(sku, "sku")
		assertString(nome, "nome")
		assertString(fabricante, "fabricante")

		assertPositiveNumber(preco, "preco")
		assertCategoriaValida(categoria)

		if (numeroMaximoParcelas < 1 || numeroMaximoParcelas > 24) {
			throw new Error("Numero de parcelas abaixo nao esta dentro do limite entre 1 a 24");
		}

		this.sku = sku
		this.nome = nome
		this.preco = preco
		this.fabricante = fabricante
		this.categoria = categoria
		this.numeroMaximoParcelas = numeroMaximoParcelas
	}

	/**
	 * Calcula o valor de cada parcela para um número de parcelas informado.
	 * @param {number} numeroDeParcelas - Inteiro >= 1 e <= numeroMaximoParcelas.
	 * @returns {string} Valor formatado em BRL.
	 * @throws {Error}
	 */
	getValorDeParcela(numeroDeParcelas) {
		if (numeroDeParcelas >= 1 && numeroDeParcelas <= this.numeroMaximoParcelas) {
			return formatBRL(this.preco / numeroDeParcelas)
		} else {
			throw new Error("TODO: implementar getValorDeParcela");
		}
	}
}


// 2) Crie a classe Cliente
// Requisitos:
// - id (string)
// - nome (string)
// - tipo: "REGULAR" | "VIP"
// - saldoPontos (int >= 0)
// Métodos:
// - adicionarPontos(pontos)
// - resgatarPontos(pontos) => diminui saldo, valida
class Cliente {
	/**
	 * Cria um cliente.
	 * @param {Object} params
	 * @param {string} [params.id] - Identificador único do cliente.
	 * @param {string} params.nome
	 * @param {"REGULAR"|"VIP"} [params.tipo="REGULAR"]
	 * @param {number} [params.saldoPontos=0] - Inteiro >= 0.
	 */
	constructor({ id = crypto.randomUUID(), nome, tipo = "REGULAR", saldoPontos = 0 }) {

		assertString(id, "id")
		assertString(nome, "nome")

		if (tipo !== "REGULAR" && tipo !== "VIP") {
			throw new Error("Client tipo nao é REGULAR ou VIP");
		}

		if (saldoPontos < 0) {
			throw new Error("Saldo de Pontos é inferior a 0");
		}

		this.id = id
		this.nome = nome
		this.tipo = tipo
		this.saldoPontos = saldoPontos
	}

	/**
	 * Adiciona pontos ao saldo.
	 * @param {number} pontos - Número positivo.
	 * @returns {number} Novo saldo de pontos.
	 * @throws {Error}
	 */
	adicionarPontos(pontos) {
		assertPositiveNumber(pontos, "pontos")
		return this.saldoPontos += pontos
	}

	/**
	 * Resgata (remove) pontos do saldo.
	 * @param {number} pontos - Número positivo.
	 * @returns {number} Novo saldo de pontos.
	 * @throws {Error}
	 */
	resgatarPontos(pontos) {
		assertPositiveNumber(pontos, "pontos")
		return this.saldoPontos = this.saldoPontos - pontos
	}
}


// 3) Crie a classe ItemCarrinho
// Requisitos:
// - sku (string)
// - quantidade (int >= 1)
// - precoUnitario (number > 0) *congelado no momento de adicionar*
// Observação: o carrinho usa precoUnitario do momento (para simular mudança de preço no catálogo).
class ItemCarrinho {
	/**
	 * Cria um item do carrinho com preço unitário “congelado” no momento da adição.
	 * @param {Object} params
	 * @param {string} [params.sku] - SKU do produto.
	 * @param {number} [params.quantidade=1] - Inteiro >= 1.
	 * @param {number} params.precoUnitario - Número > 0.
	 */
	constructor({ sku = crypto.randomUUID(), quantidade = 1, precoUnitario }) {
		assertString(sku, "sku")
		assertQuatity(quantidade, "quantidade")
		assertPositiveNumber(precoUnitario, "preco Unitario")

		this.sku = sku
		this.quantidade = quantidade
		this.precoUnitario = precoUnitario

		if (this.quantidade <= 0) {
			throw new Error("Quatidade menor ou igual a 0");
		}
	}

	/**
	 * Calcula o total do item (quantidade * preço unitário).
	 * @returns {number} Total do item.
	 */
	getTotal() {
		return this.quantidade * this.precoUnitario
	}
}


// 4) Crie a classe Estoque
// Use Map para guardar { sku -> quantidade }
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// Métodos:
// - definirQuantidade(sku, quantidade)
// - adicionar(sku, quantidade)
// - remover(sku, quantidade)
// - getQuantidade(sku)
// - garantirDisponibilidade(sku, quantidade)
class Estoque {
	/**
	 * Cria o estoque em memória usando Map { sku -> quantidade }.
	 */
	constructor() {
		this.item = new Map();
	}

	/**
	 * Define (sobrescreve) a quantidade de um SKU no estoque.
	 * @param {string} sku
	 * @param {number} quantidade - Inteiro >= 1.
	 */
	definirQuantidade(sku, quantidade) {
		assertString(sku, "sku");
		assertQuatity(quantidade);
		this.item.set(sku, quantidade);
	}

	/**
	 * Adiciona quantidade ao estoque de um SKU.
	 * Se o SKU não existir, considera como 0 e soma.
	 * @param {string} sku
	 * @param {number} quantidade - Inteiro >= 1.
	 */
	adicionar(sku, quantidade) {
		assertString(sku, "sku");
		assertQuatity(quantidade);

		const atual = this.getQuantidade(sku);
		const updatedQuantity = atual + quantidade;
		this.item.set(sku, updatedQuantity);
	}

	/**
	 * Remove quantidade do estoque de um SKU.
	 * Deve falhar se não houver estoque suficiente.
	 * @param {string} sku
	 * @param {number} quantidade - Inteiro >= 1.
	 */
	remover(sku, quantidade) {
		assertString(sku, "sku");
		assertQuatity(quantidade);

		const atual = this.getQuantidade(sku);
		if (atual < quantidade) {
			throw new Error("Quantidade superiror pedida superioro ao numero do stock");
		}

		const updatedQuantity = atual - quantidade;
		this.item.set(sku, updatedQuantity);
	}

	/**
	 * Retorna a quantidade atual em estoque para um SKU.
	 * @param {string} sku
	 * @returns {number} Quantidade (0 se não existir).
	 */
	getQuantidade(sku) {
		assertString(sku, "sku");
		return this.item.get(sku) ?? 0;
	}

	/**
	 * Garante que existe pelo menos a quantidade pedida em estoque.
	 * @param {string} sku
	 * @param {number} quantidade - Inteiro >= 1.
	 * @returns {true} Se houver estoque suficiente.
	 */
	garantirDisponibilidade(sku, quantidade) {
		assertString(sku, "sku");
		assertQuatity(quantidade);

		const stock = this.getQuantidade(sku);
		if (stock >= quantidade) return true;

		throw new Error("Quantidade superiror pedida superioro ao numero do stock");
	}
}



// 5) Crie a classe Catalogo
// Use Map para guardar { sku -> Produto }
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// Métodos:
// - adicionarProduto(produto)
// - getProduto(sku)
// - listarPorCategoria(categoria)
// - atualizarPreco(sku, novoPreco)
class Catalogo {
	/**
	 * Cria o catálogo em memória usando Map { sku -> Produto }.
	 */
	constructor() {
		this.items = new Map();
	}

	/**
	 * Adiciona um produto ao catálogo.
	 * @param {Produto} produto
	 */
	adicionarProduto(produto) {
		if (produto) {
			this.items.set(produto.sku, produto);
		} else {
			throw new Error("adicione um produto");
		}
	}

	/**
	 * Obtém um produto pelo SKU.
	 * @param {string} sku
	 * @returns {Produto|undefined}
	 */
	getProduto(sku) {
		assertString(sku, "sku");
		return this.items.get(sku);
	}

	/**
	 * Lista todos os produtos de uma categoria.
	 * @param {string} categoria
	 * @returns {Produto[]}
	 */
	listarPorCategoria(categoria) {
		assertCategoriaValida(categoria);

		const listaProdutos = [];
		for (const produto of this.items.values()) {
			if (produto.categoria === categoria) {
				listaProdutos.push(produto);
			}
		}
		return listaProdutos;
	}

	/**
	 * Atualiza o preço de um produto existente no catálogo.
	 * @param {string} sku
	 * @param {number} novoPreco
	 */
	atualizarPreco(sku, novoPreco) {
		assertString(sku, "sku");
		assertPositiveNumber(novoPreco, "novoPreco");

		const produto = this.items.get(sku);
		produto.preco = novoPreco;
	}
}


// 6) Crie a classe CarrinhoDeCompras
// Responsabilidades:
// - adicionar itens (validando estoque)
// - remover itens
// - alterar quantidade
// - calcular subtotal
// - consolidar itens por sku (sem duplicatas)
// Sugestão: use Map sku -> ItemCarrinho
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
class CarrinhoDeCompras {
	/**
	 * Cria um carrinho de compras ligado a um catálogo e um estoque.
	 * Mantém itens em memória usando Map { sku -> quantidade }.
	 * @param {{ catalogo: Catalogo, estoque: Estoque }} params
	 */
	constructor({ catalogo, estoque }) {
		this.estoque = estoque;
		this.catalogo = catalogo;
		this.carrinhoDeCompras = new Map();
	}

	/**
	 * Adiciona um item ao carrinho (ou substitui a quantidade do SKU).
	 * Valida SKU, quantidade e disponibilidade no estoque.
	 * @param {string} sku
	 * @param {number} quantidade
	 */
	adicionarItem(sku, quantidade) {
		assertString(sku, "sku");
		assertQuatity(quantidade);

		if (this.estoque.getQuantidade(sku) >= quantidade) {
			this.carrinhoDeCompras.set(sku, quantidade);
		} else {
			throw new Error("Quantidade maior do que existe em stock");
		}
	}

	/**
	 * Remove um item do carrinho pelo SKU.
	 * @param {string} sku
	 */
	removerItem(sku) {
		assertString(sku, "sku");

		if (this.carrinhoDeCompras.has(sku)) {
			this.carrinhoDeCompras.delete(sku);
		} else {
			throw new Error("sku invalido");
		}
	}

	/**
	 * Altera a quantidade de um SKU existente no carrinho.
	 * @param {string} sku
	 * @param {number} novaQuantidade
	 */
	alterarQuantidade(sku, novaQuantidade) {
		assertString(sku, "sku");
		assertQuatity(novaQuantidade);

		if (this.carrinhoDeCompras.has(sku)) {
			this.carrinhoDeCompras.set(sku, novaQuantidade);
		} else {
			throw new Error("sku invalido");
		}
	}

	/**
	 * Retorna os itens do carrinho no formato Map { sku -> quantidade }.
	 * @returns {Map<string, number>}
	 */
	listarItens() {
		return this.carrinhoDeCompras;
	}

	// getSubtotal() {
	// 	let skuListOnCarrinhoCompras = Object.keys(this.carrinhoDeCompras) // skus
	// 	let quatidadeListOnCarrinhoCompras = Object.values(this.carrinhoDeCompras) // quantidades

	// 	let totalPrice = 0
	// 	let totalQuatidade = 0

	// 	this.catalogo.items.map((sku, produto) => { 
	// 		if(Object.values(item).includes(skuListOnCarrinhoCompras)){
	// 			Object.values(item).map(produto => {
	// 				totalPrice += produto.preco
	// 			})
	// 		}
	// 	})

	// 	for(let item of quatidadeListOnCarrinhoCompras) {
	// 		totalQuatidade *= item
	// 	}

	// 	return finalPrice * totalQuatidade
	// }

	/**
	 * Calcula o subtotal (soma de preço * quantidade) dos itens do carrinho,
	 * usando os preços atuais do catálogo.
	 * @returns {number}
	 */
	getSubtotal() {
		const skus = this.carrinhoDeCompras.keys();
		let total = 0;

		for (const sku of skus) {
			const produto = this.catalogo.items.get(sku);
			const quantidade = this.carrinhoDeCompras.get(sku);
			total += produto.preco * quantidade;
		}

		return total;
	}

}

// ==========================================
// PARTE 2 - Regras de preço (promoções)
// ==========================================

// Você implementará um motor de preços com as regras abaixo.
// Você deve conseguir produzir um “breakdown” (quebra) do total:
// - subtotal
// - descontos (lista com nome + valor)
// - base de imposto
// - imposto total
// - frete
// - total final

// Estrutura sugerida do breakdown (objeto):
// {
//   subtotal,
//   descontos: [{ codigo, descricao, valor }],
//   totalDescontos,
//   impostoPorCategoria: { [categoria]: valor },
//   totalImpostos,
//   frete,
//   total
// }

// 7) Regras obrigatórias (todas devem existir e ser testáveis):
// R1 - Desconto VIP:
// - Se cliente.tipo === "VIP", aplica 5% no subtotal (apenas uma vez).
// - Não pode ser aplicado se existir cupom "SEM-VIP".
//
// R2 - Cupom:
// - Cupom "ETIC10" => 10% no subtotal
// - Cupom "FRETEGRATIS" => frete zerado
// - Cupom "SEM-VIP" => bloqueia R1
// - Cupom inválido deve lançar Error
//
// R3 - Leve 3 pague 2 (vestuário):
// - Para produtos da categoria "vestuário": a cada 3 unidades (somando SKUs diferentes),
//   a unidade mais barata dentre as 3 sai grátis.
// - Ex: 3 camisetas (10), 1 calça (50), 1 meia (5) => total unidades=5 => aplica 1 grátis
//   (a mais barata dentro do grupo de 3) e sobram 2 sem promo.
//
// R4 - Desconto por valor:
// - Se subtotal >= 500, aplica desconto fixo de 30.
//
// Observação de dificuldade:
// - Você precisa decidir ordem de aplicação e documentar.
// - Você precisa impedir descontos maiores que o subtotal.
// - Deve ser determinístico.

// 8) Crie uma classe MotorDePrecos
// Método principal:
// - calcular({ cliente, itens, cupomCodigo }) => breakdown
// Onde itens é o resultado de carrinho.listarItens()

class MotorDePrecos {
	/**
	 * @param {{ catalogo: Catalogo }} params
	 */
	constructor({ catalogo }) {
		this.catalogo = catalogo
	}

	/**
	 * Calcula o breakdown de preços (subtotal, descontos, impostos por categoria, frete e total)
	 * com base nas regras R1..R4.
	 *
	 * @param {{
	 *   cliente: Cliente,
	 *   itens: Map<string, number>,
	 *   cupomCodigo?: string | null
	 * }} params
	 * @returns {{
	 *   subtotal: number,
	 *   descontos: Array<{ codigo: string, descricao: string, valor: number }>,
	 *   totalDescontos: number,
	 *   impostoPorCategoria: Record<string, number>,
	 *   totalImpostos: number,
	 *   frete: number,
	 *   total: number
	 * }}
	 */
	calcular({ cliente, itens, cupomCodigo }) { // itens = Map(sku: quantidade) -> CarrinhhoDeCompras.listarItens()
		const breakdown = { 
			subtotal: 0,
			descontos: [],
			totalDescontos: 0,
			impostoPorCategoria: {},
			totalImpostos: 0,
			frete: 10, //Decidi adicionar 10R$ de frete so para nao ser 0
			total: 0
		}

		for (const [sku, quantidade] of itens.entries()) {
			const produto = this.catalogo.getProduto(sku)
			breakdown.subtotal += produto.preco * quantidade
		}

		//R1
		if(cliente.tipo === "VIP" && cupomCodigo !== "SEM-VIP") {
			const valor = round2(breakdown.subtotal * 0.05)
				breakdown.descontos.push({
				codigo: "VIP5",
				descricao: "Desconto VIP 5%",
				valor
			})
			breakdown.totalDescontos += valor
		}
		
		// R2
		if (cupomCodigo) {
			if (cupomCodigo === "ETIC10") {
				const valor = round2(breakdown.subtotal * 0.10)
				breakdown.descontos.push({
					codigo: "ETIC10",
					descricao: "Desconto 10%",
					valor: valor
				})
				breakdown.totalDescontos += valor
			} else if (cupomCodigo === "FRETEGRATIS") {
				breakdown.frete = 0
				breakdown.descontos.push({
					codigo: "FRETEGRATIS",
					descricao: "Frete grátis",
					valor: 0
				})
			} else if (cupomCodigo === "SEM-VIP") {
				breakdown.descontos.push({
					codigo: "SEM-VIP",
					descricao: "Bloqueia desconto VIP",
					valor: 0
				})
			} else {
				throw new Error("Cupom inválido")
			}
		}

		//R3
		const contagemDeCategorias = new Map()

		for (const [sku, quantidade] of itens.entries()) {
			const produto = this.catalogo.getProduto(sku)

			if (produto.categoria === "vestuário") {
				for (let i = 0; i < quantidade; i++) {
					contagemDeCategorias.set(crypto.randomUUID(), produto.preco)
				}
			}
		}

		const iteratorList = Array.from(contagemDeCategorias.entries())

		function compareNumbers(a, b) {
			return a[1] - b[1];
		}

		iteratorList.sort(compareNumbers)

		if (iteratorList.length >= 3) {
			const grupos = Math.floor(iteratorList.length / 3)

			for (let i = 0; i < grupos; i++) {
				const menorPreco = iteratorList[i * 3][1]
				breakdown.descontos.push({
					codigo: "3PAGUE2",
					descricao: "Desconto aplicado a 3 pague 2 produtos de vestuário",
					valor: round2(menorPreco)
				})
				breakdown.totalDescontos += round2(menorPreco)
			}
		}

		//R4
		if (breakdown.subtotal >= 500) {
			breakdown.descontos.push({
				codigo: "DESCONTO30",
				descricao: "Desconto fixo de R$ 30 em compras no valor acima a R$ 500",
				valor: 30
			})
			breakdown.totalDescontos += 30
		}
			const subtotalLiquido = Math.max(0, round2(breakdown.subtotal - round2(breakdown.totalDescontos)))
			
		for (const [sku, quantidade] of itens.entries()) {
			const produto = this.catalogo.getProduto(sku)

			const totalBrutoItem = produto.preco * quantidade
			const proporcao = breakdown.subtotal > 0 ? (totalBrutoItem / breakdown.subtotal) : 0
			const descontoRateadoItem = round2(breakdown.totalDescontos * proporcao)
			const baseLiquidaItem = Math.max(0, round2(totalBrutoItem - descontoRateadoItem))

			const iva = round2(baseLiquidaItem * IVA_POR_CATEGORIA[produto.categoria])
			breakdown.impostoPorCategoria[produto.categoria] = round2((breakdown.impostoPorCategoria[produto.categoria] ?? 0) + iva)
			breakdown.totalImpostos = round2(breakdown.totalImpostos + iva)
		}

		breakdown.total = round2(subtotalLiquido + breakdown.totalImpostos + breakdown.frete)
		return breakdown
	}
}

// ==========================================
// PARTE 3 - Checkout / Pedido / Cupom
// ==========================================

// 9) Crie a classe Pedido
// Requisitos:
// - id (string)
// - clienteI
// - itens (array)
// - breakdown (objeto)
// - status: "ABERTO" | "PAGO" | "CANCELADO"
// - createdAt (Date)
// Métodos:
// - pagar()
// - cancelar()
class Pedido {
	/**
	 * Representa um pedido gerado no checkout.
	 *
	 * @param {Object} params
	 * @param {string} params.id - Identificador único do pedido.
	 * @param {string} params.clienteId - Identificador do cliente dono do pedido.
	 * @param {Array<[string, number]>} params.itens - Itens do pedido no formato [sku, quantidade].
	 * @param {Object} params.breakdown - Quebra de valores (subtotal, descontos, impostos, frete, total).
	 */
	constructor({ id, clienteId, itens, breakdown }) {
		this.id = id
		this.clienteId = clienteId
		this.itens = itens
		this.breakdown = breakdown
		this.status = "ABERTO"
		this.createdAt = Date.now()
	}

	/**
	 * Marca o pedido como pago.
	 * @returns {void}
	 */
	pagar() {
		this.status = "PAGO"
	}

	/**
	 * Cancela o pedido.
	 * @returns {void}
	 */
	cancelar() {
		this.status = "CANCELADO"
	}
}


// 10) Crie a classe CaixaRegistradora
// Responsabilidades:
// - receber (catalogo, estoque, motorDePrecos)
// - fecharCompra({ cliente, carrinho, cupomCodigo, numeroDeParcelas }) => Pedido
// Regras:
// - Ao fechar compra, deve remover do estoque as quantidades compradas
// - Se numeroDeParcelas for informado, deve validar com base no Produto (máximo permitido)
// - Deve somar parcelas por item e imprimir um resumo no cupom (opcional, mas recomendado)
class CaixaRegistradora {
	/**
	 * Orquestra o checkout (valida estoque/parcelas, calcula preços, baixa estoque e cria o Pedido).
	 *
	 * @param {Object} params
	 * @param {Catalogo} params.catalogo - Catálogo de produtos (consulta por SKU).
	 * @param {Estoque} params.estoque - Estoque (valida e baixa quantidades).
	 * @param {MotorDePrecos} params.motorDePrecos - Motor que calcula subtotal/descontos/impostos/frete/total.
	 */
	constructor({ catalogo, estoque, motorDePrecos }) {
		this.catalogo = catalogo
		this.estoque = estoque
		this.motorDePrecos = motorDePrecos
	}

	/**
	 * Fecha uma compra a partir de um carrinho.
	 *
	 * Valida:
	 * - Disponibilidade de estoque para cada SKU
	 * - Número de parcelas não pode exceder o máximo permitido pelo Produto
	 *
	 * Efeitos:
	 * - Calcula o breakdown usando o MotorDePrecos
	 * - Remove do estoque as quantidades compradas
	 * - Cria e retorna um Pedido com status inicial "ABERTO"
	 *
	 * @param {Object} params
	 * @param {Cliente} params.cliente - Cliente que está comprando.
	 * @param {CarrinhoDeCompras} params.carrinho - Carrinho com os itens (Map sku -> quantidade).
	 * @param {string|null} [params.cupomCodigo=null] - Código de cupom (ou null).
	 * @param {number} [params.numeroDeParcelas=1] - Número de parcelas desejado.
	 *
	 * @returns {Pedido} Pedido criado (ainda não pago).
	 */
	fecharCompra({ cliente, carrinho, cupomCodigo = null, numeroDeParcelas = 1 }) {
		const items = carrinho.listarItens()

		for (const [sku, quantidade] of items.entries()) {
			const produto = this.catalogo.getProduto(sku)

			if (numeroDeParcelas > produto.numeroMaximoParcelas) {
				throw new Error(`O numero de numeroDeParcelas é maior que o numero maximo do produto ${sku}`)
			}

			this.estoque.garantirDisponibilidade(sku, quantidade)
		}

		const breakdown = this.motorDePrecos.calcular({
			cliente,
			itens: carrinho.listarItens(),
			cupomCodigo,
		})

		for (const [sku, quantidade] of items.entries()) {
			this.estoque.remover(sku, quantidade)
		}

		const pedido = new Pedido({
			id: crypto.randomUUID(),
			clienteId: cliente.id,
			itens: Array.from(items.entries()),
			breakdown,
		})

		return pedido
	}
}


// 11) Crie a classe CupomFiscal
// Deve gerar texto em linhas (array de strings) contendo:
// - cabeçalho
// - itens: sku, quantidade, preço unitário, total do item
// - subtotal, descontos (linha por desconto), impostos (por categoria), frete, total
// - status do pedido

class CupomFiscal {
	/**
	 * Monta um “cupom fiscal” em texto (array de linhas) a partir de um Pedido.
	 *
	 * @param {Object} params
	 * @param {Pedido} params.pedido - Pedido já criado (com itens + breakdown + status).
	 * @param {Catalogo} params.catalogo - Catálogo para obter dados do produto via SKU.
	 */
	constructor({ pedido, catalogo }) {
		this.pedido = pedido;
		this.catalogo = catalogo;
	}

	/**
	 * Gera as linhas do cupom fiscal.
	 *
	 * Estrutura:
	 * - Cabeçalho (id do pedido, status)
	 * - Tabela de itens (sku, qtd, unitário, total do item)
	 * - Subtotal
	 * - Descontos (se existirem) + total descontos
	 * - Impostos por categoria (se existirem) + total impostos
	 * - Frete
	 * - Total final
	 *
	 * @returns {string[]} Linhas prontas para imprimir.
	 */
	gerarLinhas() {
		const linhas = [];
		const items = this.pedido.itens;
		const breakdown = this.pedido.breakdown;

		const SEP = "--------------------------------------";

		linhas.push(SEP);
		linhas.push("CUPOM FISCAL");
		linhas.push(`Pedido: ${this.pedido.id}`);
		linhas.push(`Status: ${this.pedido.status}`);
		linhas.push(SEP);

		linhas.push("ITENS");
		linhas.push("SKU        QTD   UNITÁRIO     TOTAL");
		linhas.push(SEP);

		for (const [sku, quantidade] of items) {
			const produto = this.catalogo.getProduto(sku);
			const precoUnitario = produto.preco;
			const totalItem = quantidade * precoUnitario;

			const skuTxt = String(sku).padEnd(10, " ");
			const qtdTxt = String(quantidade).padStart(3, " ");
			const unitTxt = formatBRL(precoUnitario).padStart(11, " ");
			const totTxt = formatBRL(totalItem).padStart(11, " ");

			linhas.push(`${skuTxt}  ${qtdTxt}  ${unitTxt}  ${totTxt}`);
		}

		linhas.push(SEP);
		linhas.push(`SUBTOTAL:        ${formatBRL(breakdown.subtotal)}`);

		if (breakdown.descontos && breakdown.descontos.length > 0) {
			linhas.push(SEP);
			linhas.push("DESCONTOS");
			for (const desconto of breakdown.descontos) {
				linhas.push(`- ${desconto.codigo} | ${desconto.descricao} | ${formatBRL(desconto.valor)}`);
			}
			linhas.push(`TOTAL DESCONTOS: ${formatBRL(breakdown.totalDescontos)}`);
		}

		if (breakdown.impostoPorCategoria && Object.keys(breakdown.impostoPorCategoria).length > 0) {
			linhas.push(SEP);
			linhas.push("IMPOSTOS (por categoria)");
			for (const [categoria, valor] of Object.entries(breakdown.impostoPorCategoria)) {
				linhas.push(`- ${categoria}: ${formatBRL(valor)}`);
			}
			linhas.push(`TOTAL IMPOSTOS:  ${formatBRL(breakdown.totalImpostos)}`);
		}

		linhas.push(SEP);
		linhas.push(`FRETE:           ${formatBRL(breakdown.frete)}`);
		linhas.push(`TOTAL:           ${formatBRL(breakdown.total)}`);
		linhas.push(SEP);

		return linhas;
	}
}


class Impressora {
	/**
	 * Imprime um array de linhas no console, uma por linha.
	 *
	 * @param {string[]} linhas - Linhas de texto já prontas para imprimir.
	 */
	imprimirLinhas(linhas) {
		for (const linha of linhas) {
			console.log(linha);
		}
	}
}



// ==========================================
// PARTE 4 - Relatórios (estruturas de dados + loops)
// ==========================================

// 12) Crie a classe RelatorioVendas
// - Deve armazenar pedidos pagos
// - Deve gerar:
//   - totalArrecadado()
//   - totalImpostos()
//   - totalDescontos()
//   - rankingProdutosPorQuantidade(topN)
//   - arrecadadoPorCategoria()
// Sugestão: use Map para acumular por sku/categoria.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
class RelatorioVendas {
	/**
	 * Armazena e agrega dados de pedidos pagos para gerar relatórios simples.
	 *
	 * Guarda os pedidos cujo status é "PAGO" e calcula:
	 * - total arrecadado
	 * - total de impostos
	 * - total de descontos
	 * - ranking de produtos por quantidade
	 * - arrecadado por categoria (base estimada a partir do imposto e taxa)
	 */
	constructor() {
		this.pedidosPagos = []
	}

	/**
	 * Registra um pedido no relatório (somente se estiver pago).
	 *
	 * @param {Pedido} pedido - Pedido com status e breakdown preenchidos.
	 * @throws {Error} Se o pedido ainda não estiver pago.
	 */
	registrarPedido(pedido) {
		if (pedido.status === "PAGO") {
			this.pedidosPagos.push(pedido)
		} else {
			throw new Error("O pedido ainda nao foi pago")
		}
	}

	/**
	 * Soma o total final (breakdown.total) de todos os pedidos pagos.
	 *
	 * @returns {number} Total arrecadado (inclui impostos + frete - descontos, conforme breakdown).
	 */
	totalArrecadado() {
		let total = 0
		for (const pedidoPago of this.pedidosPagos) {
			total += pedidoPago.breakdown.total
		}
		return total
	}

	/**
	 * Soma o total de impostos (breakdown.totalImpostos) de todos os pedidos pagos.
	 *
	 * @returns {number} Total de impostos arrecadados.
	 */
	totalImpostos() {
		let total = 0
		for (const pedidoPago of this.pedidosPagos) {
			total += pedidoPago.breakdown.totalImpostos
		}
		return total
	}

	/**
	 * Soma o total de descontos (breakdown.totalDescontos) de todos os pedidos pagos.
	 *
	 * @returns {number} Total de descontos concedidos.
	 */
	totalDescontos() {
		let total = 0
		for (const pedidoPago of this.pedidosPagos) {
			total += pedidoPago.breakdown.totalDescontos
		}
		return total
	}

	/**
	 * Retorna um ranking dos SKUs mais vendidos por quantidade (top N).
	 *
	 * @param {number} topN - Quantidade máxima de itens no ranking.
	 * @returns {{sku: string, quantidade: number}[]} Lista ordenada por quantidade desc.
	 */
	rankingProdutosPorQuantidade(topN = 5) {
		const acumuladorSkuQuantidade = new Map()

		for (const pedido of this.pedidosPagos) {
			for (const [sku, quantidade] of pedido.itens) {
				if (acumuladorSkuQuantidade.has(sku)) {
					const quantidadeAtual = acumuladorSkuQuantidade.get(sku)
					acumuladorSkuQuantidade.set(sku, quantidade + quantidadeAtual)
				} else {
					acumuladorSkuQuantidade.set(sku, quantidade)
				}
			}
		}

		function compareNumbers(a, b) {
			return b[1] - a[1];
		}

		const acumuladorOrdenado = Array.from(acumuladorSkuQuantidade.entries())
			.sort(compareNumbers)
			.slice(0, topN)
			.map(([sku, quantidade]) => ({ sku, quantidade }));

		return acumuladorOrdenado
	}

	/**
	 * Calcula o “arrecadado por categoria” estimando a base (sem IVA)
	 * a partir do imposto e da taxa da categoria:
	 * base = imposto / taxa
	 *
	 * @returns {{categoria: string, total: number}[]} Lista de categorias com total estimado (base sem IVA).
	 */
	arrecadadoPorCategoria() {
		const acumuladorSkuCategoria = new Map();

		for (const pedido of this.pedidosPagos) {
			const impostoPorCategoria = pedido.breakdown?.impostoPorCategoria || {};
			for (const [categoria, imposto] of Object.entries(impostoPorCategoria)) {
				const taxa = IVA_POR_CATEGORIA[categoria] ?? 0;
				if (taxa <= 0) continue;

				const total = round2(imposto / taxa);
				if (acumuladorSkuCategoria.has(categoria)) {
					const valorAtual = acumuladorSkuCategoria.get(categoria);
					acumuladorSkuCategoria.set(categoria, round2(total + valorAtual));
				} else {
					acumuladorSkuCategoria.set(categoria, total);
				}
			}
		}

		return Array.from(acumuladorSkuCategoria.entries()).map(([categoria, total]) => ({
			categoria,
			total
		}));
	}
}

// ==========================================
// DADOS DE TESTE (para o demo)
// ==========================================

function seedCatalogoEEstoque() {
	const catalogo = new Catalogo();
	const estoque = new Estoque();

	const produtos = [
		// alimentos
		{ sku: "ARROZ", nome: "Arroz 1kg", preco: 6.0, fabricante: "Marca A", categoria: "alimentos", numeroMaximoParcelas: 1 },
		{ sku: "FEIJAO", nome: "Feijão 1kg", preco: 7.5, fabricante: "Marca B", categoria: "alimentos", numeroMaximoParcelas: 1 },
		{ sku: "OLEO", nome: "Óleo 900ml", preco: 8.0, fabricante: "Marca C", categoria: "alimentos", numeroMaximoParcelas: 1 },
		// vestuário
		{ sku: "CAMISETA", nome: "Camiseta", preco: 30.0, fabricante: "Hering", categoria: "vestuário", numeroMaximoParcelas: 6 },
		{ sku: "CALCA", nome: "Calça Jeans", preco: 120.0, fabricante: "Levis", categoria: "vestuário", numeroMaximoParcelas: 6 },
		{ sku: "MEIA", nome: "Meia", preco: 10.0, fabricante: "Puket", categoria: "vestuário", numeroMaximoParcelas: 6 },
		// eletrodoméstico
		{ sku: "MICRO", nome: "Micro-ondas", preco: 499.9, fabricante: "LG", categoria: "eletrodoméstico", numeroMaximoParcelas: 12 },
		{ sku: "LIQUID", nome: "Liquidificador", preco: 199.9, fabricante: "Philco", categoria: "eletrodoméstico", numeroMaximoParcelas: 10 },
		// decoração
		{ sku: "VASO", nome: "Vaso Decorativo", preco: 89.9, fabricante: "Tok&Stok", categoria: "decoração", numeroMaximoParcelas: 15 },
		// materiais de construção
		{ sku: "CIMENTO", nome: "Cimento 25kg", preco: 35.0, fabricante: "Holcim", categoria: "materiais de construção", numeroMaximoParcelas: 3 }
	];

	for (const p of produtos) {
		const produto = new Produto(p);
		catalogo.adicionarProduto(produto);
	}

	// Estoque inicial
	estoque.definirQuantidade("ARROZ", 50);
	estoque.definirQuantidade("FEIJAO", 50);
	estoque.definirQuantidade("OLEO", 50);
	estoque.definirQuantidade("CAMISETA", 20);
	estoque.definirQuantidade("CALCA", 10);
	estoque.definirQuantidade("MEIA", 30);
	estoque.definirQuantidade("MICRO", 5);
	estoque.definirQuantidade("LIQUID", 8);
	estoque.definirQuantidade("VASO", 10);
	estoque.definirQuantidade("CIMENTO", 100);

	return { catalogo, estoque };
}

// ==========================================
// DEMO (cenários obrigatórios)
// ==========================================

// Critérios de aceite (quando você terminar):
// - Cenário A: cliente VIP, sem cupom, compra vestuário com regra leve-3-pague-2
// - Cenário B: cliente REGULAR com cupom ETIC10
// - Cenário C: cupom inválido deve gerar erro
// - Cenário D: tentar comprar acima do estoque deve gerar erro
// - Cenário E: relatório deve refletir pedidos pagos

function runDemo() {
	const { catalogo, estoque } = seedCatalogoEEstoque();
	const motor = new MotorDePrecos({ catalogo });
	const caixa = new CaixaRegistradora({ catalogo, estoque, motorDePrecos: motor });
	const relatorio = new RelatorioVendas();
	const impressora = new Impressora();

	const clienteVip = new Cliente({ id: "C1", nome: "Ana", tipo: "VIP", saldoPontos: 0 });
	const clienteRegular = new Cliente({ id: "C2", nome: "Bruno", tipo: "REGULAR", saldoPontos: 0 });

	// Cenário A
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		carrinho.adicionarItem("CAMISETA", 2);
		carrinho.adicionarItem("MEIA", 1);
		carrinho.adicionarItem("CALCA", 1);

		const pedido = caixa.fecharCompra({
			cliente: clienteVip,
			carrinho,
			cupomCodigo: null,
			numeroDeParcelas: 3
		});

		pedido.pagar();
		relatorio.registrarPedido(pedido);

		const cupom = new CupomFiscal({ pedido, catalogo });
		impressora.imprimirLinhas(cupom.gerarLinhas());
	}

	// Cenário B
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		carrinho.adicionarItem("MICRO", 1);
		carrinho.adicionarItem("VASO", 1);

		const pedido = caixa.fecharCompra({
			cliente: clienteRegular,
			carrinho,
			cupomCodigo: "ETIC10",
			numeroDeParcelas: 10
		});

		pedido.pagar();
		relatorio.registrarPedido(pedido);

		const cupom = new CupomFiscal({ pedido, catalogo });
		impressora.imprimirLinhas(cupom.gerarLinhas());
	}

	// Cenário C (cupom inválido)
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		carrinho.adicionarItem("ARROZ", 1);

		try {
			caixa.fecharCompra({ cliente: clienteRegular, carrinho, cupomCodigo: "INVALIDO" });
		} catch (err) {
			console.log("(OK) Cupom inválido gerou erro:");
			console.log(String(err.message || err));
		}
	}

	// Cenário D (estoque insuficiente)
	{
		const carrinho = new CarrinhoDeCompras({ catalogo, estoque });
		try {
			carrinho.adicionarItem("MICRO", 999);
		} catch (err) {
			console.log("(OK) Estoque insuficiente gerou erro:");
			console.log(String(err.message || err));
		}
	}

	// Cenário E (relatório)
	{
		console.log("==============================");
		console.log("Relatório");
		console.log("==============================");
		console.log("Total arrecadado:", formatBRL(relatorio.totalArrecadado()));
		console.log("Total impostos:", formatBRL(relatorio.totalImpostos()));
		console.log("Total descontos:", formatBRL(relatorio.totalDescontos()));
		console.log("Top produtos:", relatorio.rankingProdutosPorQuantidade(3));
		console.log("Por categoria:", relatorio.arrecadadoPorCategoria());
	}
}

// Quando terminar tudo, descomente:
runDemo();