import { Injectable } from '@angular/core';

// --- CAMBIO: Añadimos 'countryCode' para poder rastrear las preguntas ---
export type Question = {
  imageUrl: string;
  correct: string;
  options: string[];
  countryCode: string; // <-- AÑADIDO
};

type Country = { code: string; name: string };

@Injectable({ providedIn: 'root' })
export class PreguntadosService {
  private readonly ALL_COUNTRIES: Country[] = [
    { code: 'AR', name: 'Argentina' },
    { code: 'ES', name: 'España' },
    { code: 'MX', name: 'México' },
    { code: 'CO', name: 'Colombia' },
    { code: 'CL', name: 'Chile' },
    { code: 'PE', name: 'Perú' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'BR', name: 'Brasil' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'CA', name: 'Canadá' },
    { code: 'FR', name: 'Francia' },
    { code: 'DE', name: 'Alemania' },
    { code: 'IT', name: 'Italia' },
    { code: 'JP', name: 'Japón' },
    { code: 'CN', name: 'China' },
    { code: 'AU', name: 'Australia' },
    { code: 'GB', name: 'Reino Unido' },
    { code: 'RU', name: 'Rusia' },
    { code: 'IN', name: 'India' },
    { code: 'ZA', name: 'Sudáfrica' },
  ];

  // --- CAMBIO: La función ahora acepta un array de códigos para excluir ---
  async getQuestion(excludeCodes: string[] = []): Promise<Question> {
    // 1. Filtra los países para usar solo los que no han sido elegidos
    const availableCountries = this.ALL_COUNTRIES.filter(
      (c) => !excludeCodes.includes(c.code)
    );

    if (availableCountries.length < 4) {
      throw new Error('No hay suficientes países únicos para continuar.');
    }

    // 2. Elige 4 países al azar de la lista DISPONIBLE
    const picked = this.pickMany(availableCountries, 4);

    const correctCountry = picked[0];
    const options = this.shuffle(picked.map((p) => p.name));
    const imageUrl = `https://flagsapi.com/${correctCountry.code}/flat/64.png`;

    // 3. Devuelve el objeto incluyendo el 'countryCode'
    return {
      imageUrl: imageUrl,
      correct: correctCountry.name,
      options,
      countryCode: correctCountry.code, // <-- AÑADIDO
    };
  }

  /** Helpers (sin cambios) */
  private pickMany<T>(arr: T[], n: number): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, n);
  }

  private shuffle<T>(a: T[]): T[] {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
