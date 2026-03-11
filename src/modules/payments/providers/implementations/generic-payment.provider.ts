import axios from "axios";
import { log } from "@config/Logger";
import { PaymentProvider, PaymentRequest, PaymentResponse } from "../payment-provider.interface";

export class GenericPaymentProvider implements PaymentProvider {
	private readonly apiUrl: string;

	constructor() {
		this.apiUrl = process.env.PAYMENT_GATEWAY_URL || "https://api.generic-payment.com/v1/payments";
	}

	public async processPayment(request: PaymentRequest): Promise<PaymentResponse> {
		log.info(`[GenericPaymentProvider] Enviando cobrança de ${(request.amount / 100).toFixed(2)} ${request.currency} para ${request.customer.email}`);

		try {
			// Simulação de chamada externa
			// const response = await axios.post(this.apiUrl, request, {
			// 	headers: { Authorization: `Bearer ${process.env.PAYMENT_GATEWAY_KEY}` }
			// });

			log.info(`[GenericPaymentProvider] Pagamento processado com sucesso (simulado)`);
			
			return {
				transactionId: `gen_${Date.now()}`,
				status: "PAID",
				rawResponse: { message: "Payment processed successfully via generic gateway" }
			};
		} catch (error) {
			log.error(`[GenericPaymentProvider] Erro ao processar pagamento:`, error);
			return {
				transactionId: "",
				status: "FAILED",
				rawResponse: error
			};
		}
	}
}
