import { Service } from "@shared/decorators/service.decorator";
import { FormatterUtils } from "./formatter.utils";

@Service()
export class ValidatorUtils {

	constructor(private readonly formatterUtils: FormatterUtils) {}

  public validateEmail(email: string): boolean {
		const usuario = email.substring(0, email.indexOf("@"));
		const dominio = email.substring(email.indexOf("@") + 1, email.length);

		if (
			usuario.length >= 1 &&
			dominio.length >= 3 &&
			usuario.search("@") == -1 &&
			dominio.search("@") == -1 &&
			usuario.search(" ") == -1 &&
			dominio.search(" ") == -1 &&
			dominio.search(".") != -1 &&
			dominio.indexOf(".") >= 1 &&
			dominio.lastIndexOf(".") < dominio.length - 1
		) {
			return true;
		} else {
			return false;
		}
	}

	public filterUpdatedFields<T extends Record<string, any>>(currentData: T, updateData: Partial<T>): Partial<T> {
		const updatedFields: Partial<T> = {};

		for (const key in updateData) {
			if (updateData[key] == null || updateData[key] == undefined || key === 'userId') {
				continue;
			}

			const newValue = updateData[key];
			const currentValue = currentData[key];

			if (newValue !== currentValue) {
				updatedFields[key] = newValue;
			}
		}

		return updatedFields;
	}

	public validateTelephone(phone: string): boolean {
		if (!phone) return false;

		//- Criação
		if (phone.includes("(") || phone.includes(")") || phone.includes("-")) {
			phone = phone.trim();
			const whatsAppSplitted: string[] = phone.split(" ");
			const ddd: string = whatsAppSplitted[0].trim();
			const telephone: string = whatsAppSplitted[1].trim();

			if (!this.validateTelephoneDDD(ddd)) throw new Error("DDD Inválido");
			const telephoneSplitted: string[] = telephone.split("-");
			const telephone1part: string = telephoneSplitted[0];
			const telephone2part: string = telephoneSplitted[1];

			if (telephone1part.length < 5 || telephone2part.length < 4) return false;
			return true;
		} else {
			//- Atualização
			const ddd: string = phone.slice(0, 2);
			const telephone: string = phone.slice(2, phone.length);

			//- Valida o DDD
			if (!this.validateTelephoneDDD(`(${ddd})`)) throw new Error("DDD Inválido");
			if (telephone.length < 9) return false;
			return true;
		}
	}

	public validateZipCode(zipCode: string): boolean {
		if (!zipCode) return false;

		const ZIP_CODE_REGEX = /^\d{2}\.?\d{3}-?\d{3}$/;
		const isInFormat: boolean = ZIP_CODE_REGEX.test(zipCode.trim());
		const isInCorrectLength: boolean = this.validateZipCodeLength(zipCode);
		return isInFormat && isInCorrectLength;
	}

	public sanitizeZipCode(zipCode: string): string {
		if (!zipCode) return "";
		return zipCode.replace(/\D/g, '').trim();
	}

	public validateCPF(cpf: string): boolean {
		if (!cpf) return false;

		cpf = this.formatterUtils.removeCPFMask(cpf);
		let soma: number;
		let resto: number;
		soma = 0;

		const cpfsInvalidos = [
			"00000000000",
			"11111111111",
			"22222222222",
			"33333333333",
			"44444444444",
			"55555555555",
			"66666666666",
			"77777777777",
			"88888888888",
			"99999999999",
		];

		cpf = cpf.replace(/[\s.-]*/gim, "");
		const cpfInvalido = cpfsInvalidos.indexOf(cpf);

		if (!cpf || cpf.length !== 11 || cpfInvalido !== -1) return false;

		for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
		resto = (soma * 10) % 11;

		if (resto == 10 || resto == 11) resto = 0;
		if (resto != parseInt(cpf.substring(9, 10))) return false;

		soma = 0;
		for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
		resto = (soma * 10) % 11;

		if (resto == 10 || resto == 11) resto = 0;
		return resto === parseInt(cpf.substring(10, 11));
	}

	private validateTelephoneDDD(ddd: string): boolean {
		const validDDDs: string[] = [
			"(61)",
			"(62)",
			"(64)",
			"(65)",
			"(66)",
			"(67)",
			"(82)",
			"(71)",
			"(73)",
			"(74)",
			"(75)",
			"(77)",
			"(85)",
			"(88)",
			"(98)",
			"(99)",
			"(83)",
			"(81)",
			"(87)",
			"(86)",
			"(89)",
			"(84)",
			"(79)",
			"(68)",
			"(96)",
			"(92)",
			"(97)",
			"(91)",
			"(93)",
			"(94)",
			"(69)",
			"(95)",
			"(63)",
			"(27)",
			"(28)",
			"(31)",
			"(32)",
			"(33)",
			"(34)",
			"(35)",
			"(37)",
			"(38)",
			"(21)",
			"(22)",
			"(24)",
			"(11)",
			"(12)",
			"(13)",
			"(14)",
			"(15)",
			"(16)",
			"(17)",
			"(18)",
			"(19)",
			"(41)",
			"(42)",
			"(43)",
			"(44)",
			"(45)",
			"(46)",
			"(51)",
			"(53)",
			"(54)",
			"(55)",
			"(47)",
			"(48)",
			"(49)",
		];

		return validDDDs.includes(ddd);
	}

	private validateZipCodeLength(zipCode: string): boolean {
		const sanitizedZipCode: string = this.sanitizeZipCode(zipCode);
		return sanitizedZipCode.length === 8;
	}
}