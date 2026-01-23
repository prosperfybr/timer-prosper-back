import { log } from "@config/Logger";
import { InternalServerException } from "@shared/exceptions/InternalServerException";
import { createTransport } from "nodemailer";
import dotenv from "dotenv";


export class EmailService {
  private transporter = null;
  
  constructor() {
    // dotenv.config({ path: "../../../.env" });
    this.transporter = createTransport({
    host: "smtp-mail.outlook.com",
		service: "hotmail",
		port: 587,
		secure: false,
		auth: {
      user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
  }

	public async sendEmail(to: string, subject: string, html: string, text: string, from?: string): Promise<any> {
    log.info(`Sending a new email to [${to}]`);

		const emailSent = await this.transporter.sendMail({
			from: `TimerProsper ${from}` || process.env.EMAIL_FROM,
			to,
			subject,
			html,
			text,
		});

		if (!emailSent) {
			log.error(`An error has ocurred while send email from [${to}]. ERROR: `, emailSent);
			throw new InternalServerException(`Ocorreu um erro ao enviar o e-mail para ${to}`);
		} else {
      log.info(`Email sended to [${to}]`)
			return emailSent;
		}
	}
}
