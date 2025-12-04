import { Service } from "@shared/decorators/service.decorator";
import moment from "moment";

@Service()
export class FormatterUtils {
	public removeCPFMask(cpf: string): string {
		cpf = cpf.replace(".", "");
		cpf = cpf.replace(".", "");
		cpf = cpf.replace("-", "");
		return cpf;
	}

	public addCPFMask(cpf: string): string {
		cpf = cpf.replace(/[^\d]/g, "");
		return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
	}

	public formatTime(hour: string): string {
		const [hours, minutes, seconds] = hour.split(":");
		const now = moment();
		now.hour(parseInt(hours));
		now.minute(parseInt(minutes));
		now.second(seconds ? parseInt(seconds) : 0);
		return now.isValid() ? now.format("HH:mm:ss") : null;
	}
}
