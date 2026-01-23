import { InternalServerException } from "@shared/exceptions/InternalServerException";
import axios from "axios";

const EMAIL_WEBHOOK_URL: string = process.env.EMAIL_WEBHOOK_URL as string;

export enum WebhookEmailType {
	CONVITE_CLIENTE = "CONVITE_CLIENTE",
	CLIENTE_SOLICITANDO_VINCULO = "CLIENTE_SOLICITANDO_VINCULO",
	AGENDAMENTO_ALTERADO = "AGENDAMENTO_ALTERADO",
	ESTABELECIMENTO_FECHADO = "ESTABELECIMENTO_FECHADO"
}
export interface EmailWebhookPayload {
	email_type: WebhookEmailType;
	establishment_register: string;
	link_cadastro: string;
	client_email: string;
	client_name: string;
	date_changed: Date;
}

export class EmailService {
	private static http = axios.create({
		baseURL: EMAIL_WEBHOOK_URL || "https://workflow.prosperfy.com.br/webhook/afa118e9-b076-456e-b039-d72956a66799",
		headers: {
			"Content-Type": "application/json",
		},
	});

	public static async sendEmail(payload: EmailWebhookPayload): Promise<boolean> {
		try {
			let timestamp = new Date().toISOString();
			console.info(`[${timestamp}] [INFO] :: Trigger to Webhook to send email to [${payload.client_email}]`);
			const { data } = await axios.post("", payload);
			timestamp = new Date().toISOString();
			console.info(`[${timestamp}] [INFO] :: Webhook triggered successfully. Hook Response `, data);
			return true;
		} catch (error) {
			const timestamp = new Date().toISOString();
			console.error(`[${timestamp}] [ERROR] :: An error has occured while send an email. ERROR: `, error);
			throw new InternalServerException(`Ocorreu um erro ao enviar o e-mail para ${payload.client_email}`);
		}
	}

	public static buildEmailPayload(type: WebhookEmailType, tradeName: string, clientEmails: string[], clientName: string, dateChanged?: Date, register_link?: string): EmailWebhookPayload {

		return {
			email_type: type,
			establishment_register: tradeName,
			link_cadastro: "https://timerprosper.com.br/finalizar-cadastro?token=a1b2c3d4e5",
			client_email: clientEmails.map(item => item).join(", "),
			client_name: clientName,
			date_changed: dateChanged,
		} as EmailWebhookPayload;
	}
}
