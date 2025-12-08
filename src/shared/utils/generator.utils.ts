import { Service } from "@shared/decorators/service.decorator";

@Service()
export class GeneratorUtils {
	public generateUniqueCode(segmentName: string, tradeName: string): string {
		const segmentPrefix = segmentName
			.toUpperCase()
			.replace(/[^A-Z]/g, "")
			.substring(0, 2)
			.padEnd(2, "Z");

		const words = tradeName.toUpperCase().split(/\s+/);
		let namePrefix = "";

		for (let i = 0; i < words.length && namePrefix.length < 3; i++) {
			const word = words[i];

			if (word.length > 2) namePrefix += word[0];
			else if (word.length > 0 && namePrefix.length < 2) namePrefix += word[0];
		}

		if (namePrefix.length < 2)
			namePrefix = tradeName
				.toUpperCase()
				.replace(/[^A-Z]/g, "")
				.substring(0, 3)
				.padEnd(2, "X");

		namePrefix = namePrefix.substring(0, 3);
		const randomHex = Math.floor(Math.random() * 65536)
			.toString(16)
			.toUpperCase()
			.padStart(4, "0");

		return `${segmentPrefix}-${namePrefix}-${randomHex}`;
	}
}
