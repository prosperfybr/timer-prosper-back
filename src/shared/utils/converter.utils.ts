import { log } from "@config/Logger";
import { Service } from "@shared/decorators/service.decorator";

@Service()
export class ConverterUtils {

  public convertDurationInMinutes(duration: string): number {
    if (!duration) return 0;

    const input: string = duration.trim().toLowerCase();

    // 1. Formato "200" ou "200m" (Minutos diretos)
    if (/^\d+m?$/.test(input)) {
      log.info(`Duration is coming in format like this "200m", remove "m" and convert to number`);
      return parseInt(input.replace('m', ''), 10);
    }

    let totalMinutes = 0;

    // 2. Formato "hh:mm" (Ex: "01:40" ou "1:40")
    if (/^\d{1,2}:\d{2}$/.test(input)) {
      const [hourStr, minutesStr]: string[] = input.split(":");
      const hours: number = parseInt(hourStr, 10);
      const minutes: number = parseInt(minutesStr, 10);

      if (isNaN(hours) || isNaN(minutes) || minutes >= 60) return 0;
      totalMinutes = (hours * 60) + minutes;
      return totalMinutes;
    }

    // 3. Formato "XhYm" (Ex: "1h40m", "2h", "30m")
    const hoursMatch = input.match(/(\d+)h/);
    if (hoursMatch) {
      const hours: number = parseInt(hoursMatch[1], 10);
      totalMinutes += hours * 60;
    }

    const minutesMatch = input.match(/(\d+)m/);
    if (minutesMatch) {
      const minutes: number = parseInt(minutesMatch[1], 10);
      totalMinutes += minutes;
    }
    //- Se a string contiver 'h' ou 'm' mas total minutes for 0, signigira que era uma string inválida por exemplo('h m')
    if ((hoursMatch || minutesMatch) && totalMinutes === 0) return 0;
    //- Retorna o resultado da conversão de XhYm
    if (totalMinutes > 0 && (hoursMatch || minutesMatch)) return totalMinutes;
    //- Se não encaixar em nenhum resultado retorna 0
    return 0;
  }

  public convertMinutesInTime(totalMinutes: number): string {
    if (totalMinutes === null || totalMinutes < 0 || isNaN(totalMinutes)) {
      return "00:00";
    }

    const minutes: number = Math.floor(totalMinutes);

    const hours: number = Math.floor(minutes / 60);
    const remainingMinutes: number = minutes % 60;

    const pad: Function = (num: number): string => String(num).padStart(2, '0');

    return `${pad(hours)}:${pad(remainingMinutes)}`;
  }

  public convertFloatToCents(valueFloat: number): number {
    if (typeof valueFloat !== 'number'|| isNaN(valueFloat)) {
      return 0;
    }

    return Math.round(valueFloat * 100);
  }

  public convertCentsToFloat(valueCents: number): number {
    if (typeof valueCents !== 'number' || isNaN(valueCents)) {
      return 0.00;
    }

    return valueCents / 100;
  }
}