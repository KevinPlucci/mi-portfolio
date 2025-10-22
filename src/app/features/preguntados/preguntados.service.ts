import { Injectable } from '@angular/core';

// Tipos para la pregunta, se mantiene igual
export type Question = { imageUrl: string; correct: string; options: string[] };

// Nuevo tipo para los países
type Country = { code: string; name: string };

@Injectable({ providedIn: 'root' })
export class PreguntadosService {
  // Lista de países con sus códigos y nombres en español.
  // Puedes agregar o cambiar los que quieras aquí.
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

  /** Genera una pregunta (1 bandera + 4 opciones de países) */
  async getQuestion(): Promise<Question> {
    // 1. Elige 4 países al azar de la lista
    const picked = this.pickMany(this.ALL_COUNTRIES, 4);

    // 2. El primero será la respuesta correcta
    const correctCountry = picked[0];

    // 3. Mezcla los nombres de los 4 países para las opciones
    const options = this.shuffle(picked.map((p) => p.name));

    // 4. Construye la URL de la imagen de la bandera
    const imageUrl = `https://flagsapi.com/${correctCountry.code}/flat/64.png`;

    return { imageUrl: imageUrl, correct: correctCountry.name, options };
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
