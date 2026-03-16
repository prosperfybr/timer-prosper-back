import { Service } from "@shared/decorators/service.decorator";
import { FormatterUtils } from "./formatter.utils";
import moment from "moment";

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
			if (updateData[key] == null || updateData[key] == undefined || key === "userId") {
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

			if (telephone1part.length < 4 || telephone2part.length < 4) return false;
			return true;
		} else {
			//- Atualização
			const ddd: string = phone.slice(0, 2);
			const telephone: string = phone.slice(2, phone.length);

			//- Valida o DDD
			if (!this.validateTelephoneDDD(`(${ddd})`)) throw new Error("DDD Inválido");
			if (telephone.length < 8) return false;
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
		return zipCode.replace(/\D/g, "").trim();
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

	public validateHours(hour: string | number): boolean {
		if (!hour) {
			return false;
		}

		const hourString: string = String(hour).trim();
		//- Lista de formatos aceitos
		const acceptedFormats = [
			"HH", // 20
			"H", // "20"
			"HH:mm", // "20:00"
			"HHh:mm", // "20h:10" (se for o caso)
			"HHhmm", // "20h10m" (sem separador)
			"HH[h] mm[m]", // "20h 10m" (com espaço)
			"HH[h] mm[m] ss[s]", // "20h 10m 30s"
			"HH:mm:ss", // "20:10:30"
		];

		const parsedTime = moment(hourString, acceptedFormats, true);

		return parsedTime.isValid();
	}

	private validateTelephoneDDD(ddd: string): boolean {
		//- Lista Completa de DDDs do Brasil
		//- Os códigos de área (DDD) no Brasil são compostos por dois dígitos e estão organizados geograficamente por regiões e estados.
		const validDDDs: string[] = [
			/** Região Sudeste **/
			/* São Paulo (SP) */
			"(11)", //– Região Metropolitana de São Paulo
			"(12)", //– São José dos Campos e Vale do Paraíba
			"(13)", //– Santos e Baixada Santista
			"(14)", //– Bauru, Jaú, Marília e Botucatu
			"(15)", //– Sorocaba e Itapetininga
			"(16)", //– Ribeirão Preto, Franca e São Carlos
			"(17)", //– São José do Rio Preto e Barretos
			"(18)", //– Presidente Prudente, Araçatuba e Assis
			"(19)", //– Campinas, Piracicaba e Americana

			/* Rio de Janeiro (RJ) */
			"(21)", //– Rio de Janeiro e Região Metropolitana
			"(22)", //– Campos dos Goytacazes, Macaé e Cabo Frio
			"(24)", //– Petrópolis, Volta Redonda e Angra dos Reis

			/* Espírito Santo (ES) */
			"(27)", //– Vitória e Região Metropolitana
			"(28)", //– Cachoeiro de Itapemirim e Sul do Estado

			/* Minas Gerais (MG) */
			"(31)", //– Belo Horizonte e Região Metropolitana
			"(32)", //– Juiz de Fora e Barbacena
			"(33)", //– Governador Valadares e Teófilo Otoni
			"(34)", //– Uberlândia e Uberaba (Triângulo Mineiro)
			"(35)", //– Poços de Caldas e Pouso Alegre
			"(37)", //– Divinópolis e Itaúna
			"(38)", //– Montes Claros e Norte de Minas

			/** Região Sul **/
			/* Paraná (PR) */
			"(41)", //– Curitiba e Região Metropolitana
			"(42)", //– Ponta Grossa e Guarapuava
			"(43)", //– Londrina e Apucarana
			"(44)", //– Maringá e Campo Mourão
			"(45)", //– Foz do Iguaçu e Cascavel
			"(46)", //– Francisco Beltrão e Pato Branco

			/* Santa Catarina (SC) */
			"(47)", //– Joinville, Blumenau e Balneário Camboriú
			"(48)", //– Florianópolis e Região Metropolitana
			"(49)", //– Chapecó e Lages

			/* Rio Grande do Sul (RS) */
			"(51)", //– Porto Alegre e Região Metropolitana
			"(53)", //– Pelotas e Rio Grande
			"(54)", //– Caxias do Sul e Passo Fundo
			"(55)", //– Santa Maria e Uruguaiana

			/** Região Centro-Oeste **/
			/* Distrito Federal (DF) e Goiás (GO) */
			"(61)", //– Brasília e entorno
			"(62)", //– Goiânia e Região Metropolitana
			"(64)", //– Rio Verde, Itumbiara e Catalão

			/* Mato Grosso (MT) */
			"(65)", //– Cuiabá e Região Metropolitana
			"(66)", //– Rondonópolis e Sinop

			/* Mato Grosso do Sul (MS) */
			"(67)", //– Campo Grande e todo o estado

			/** Região Norte **/
			/* Acre (AC) */
			"(68)", //– Rio Branco e todo o estado

			/* Rondônia (RO) */
			"(69)", //– Porto Velho e todo o estado

			/* Tocantins (TO) */
			"(63)", //– Palmas e todo o estado

			/* Amazonas (AM) */
			"(92)", //– Manaus e Região Metropolitana
			"(97)", //– Interior do Amazonas

			/* Roraima (RR) */
			"(95)", //– Boa Vista e todo o estado

			/* Pará (PA) */
			"(91)", //– Belém e Região Metropolitana
			"(93)", //– Santarém e Altamira
			"(94)", //– Marabá e Carajás

			/* Amapá (AP) */
			"(96)", //– Macapá e todo o estado

			/** Região Nordeste **/
			/* Bahia (BA) */
			"(71)", //– Salvador e Região Metropolitana
			"(73)", //– Ilhéus, Itabuna e Porto Seguro
			"(74)", //– Juazeiro e Jacobina
			"(75)", //– Feira de Santana e Alagoinhas
			"(77)", //– Vitória da Conquista e Barreiras

			/* Sergipe (SE) */
			"(79)", //– Aracaju e todo o estado

			/* Pernambuco (PE) */
			"(81)", //– Recife e Região Metropolitana
			"(87)", //– Petrolina e Caruaru

			/* Alagoas (AL) */
			"(82)", //– Maceió e todo o estado

			/* Paraíba (PB) */
			"(83)", //– João Pessoa e Campina Grande

			/* Rio Grande do Norte (RN) */
			"(84)", //– Natal e Mossoró

			/* Ceará (CE) */
			"(85)", //– Fortaleza e Região Metropolitana
			"(88)", //– Juazeiro do Norte e Sobral

			/* Piauí (PI) */
			"(86)", //– Teresina e Parnaíba
			"(89)", //– Picos e Floriano

			/* Maranhão (MA) */
			"(98)", //– São Luís e Região Metropolitana
			"(99)", //– Imperatriz e Caxias
		];

		return validDDDs.includes(ddd);
	}

	private validateZipCodeLength(zipCode: string): boolean {
		const sanitizedZipCode: string = this.sanitizeZipCode(zipCode);
		return sanitizedZipCode.length === 8;
	}
}
