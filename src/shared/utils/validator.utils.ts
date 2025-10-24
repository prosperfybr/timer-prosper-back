import { Service } from "@shared/decorators/service.decorator";

@Service()
export class ValidatorUtils {

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
			const telephone: string = phone.slice(3, phone.length);

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
		console.log("O CEP ESTÁ NO FORMATO? ", isInFormat);
		const isInCorrectLength: boolean = this.validateZipCodeLength(zipCode);
		console.log("O CEP ESTÁ COM O TAMANHO CORRETO? ", isInCorrectLength);
		console.log("O CEP É VALIDO: ", isInFormat && isInCorrectLength);
		return isInFormat && isInCorrectLength;
	}

	public sanitizeZipCode(zipCode: string): string {
		if (!zipCode) return "";
		return zipCode.replace(/\D/g, '').trim();
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