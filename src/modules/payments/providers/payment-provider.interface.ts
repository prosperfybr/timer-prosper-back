export interface PaymentRequest {
	amount: number;
	currency: string;
	customer: {
		name: string;
		email: string;
		document?: string;
	};
	paymentMethod: {
		type: "credit_card" | "debit_card" | "pix";
		token?: string;
	};
}

export interface PaymentResponse {
	transactionId: string;
	status: "PAID" | "PENDING" | "FAILED";
	rawResponse?: any;
}

export interface PaymentProvider {
	processPayment(request: PaymentRequest): Promise<PaymentResponse>;
}
