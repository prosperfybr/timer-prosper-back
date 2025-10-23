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
			if (updateData[key] == null || updateData[key] == undefined) {
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
}