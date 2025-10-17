import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

type Country = { name: string; flagPng: string };
export type Question = { imageUrl: string; correct: string; options: string[] };

@Injectable({ providedIn: 'root' })
export class PreguntadosService {
  private http = inject(HttpClient);
  private cache: Country[] = [];

  private async loadCountries(): Promise<Country[]> {
    if (this.cache.length) return this.cache;
    const data = await firstValueFrom(
      this.http.get<any[]>(
        'https://restcountries.com/v3.1/all?fields=name,flags'
      )
    );
    this.cache = (data || [])
      .filter((x) => x?.name?.common && (x?.flags?.png || x?.flags?.svg))
      .map((x) => ({
        name: x.name.common as string,
        flagPng: (x.flags.png || x.flags.svg) as string,
      }));
    // limpiar duplicados por nombre
    const seen = new Set<string>();
    this.cache = this.cache.filter((c) =>
      seen.has(c.name) ? false : seen.add(c.name)
    );
    return this.cache;
  }

  async getQuestion(): Promise<Question> {
    const all = await this.loadCountries();
    if (all.length < 4)
      throw new Error('No hay suficientes países para armar opciones');

    const picked = this.pickMany(all, 4);
    const correct = picked[0];
    const options = this.shuffle(picked.map((p) => p.name));
    return { imageUrl: correct.flagPng, correct: correct.name, options };
  }

  private pickMany<T>(arr: T[], n: number): T[] {
    const used = new Set<number>();
    const out: T[] = [];
    while (out.length < n) {
      const i = Math.floor(Math.random() * arr.length);
      if (!used.has(i)) {
        used.add(i);
        out.push(arr[i]);
      }
    }
    return out;
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
