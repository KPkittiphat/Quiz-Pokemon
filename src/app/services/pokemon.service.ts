import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

export interface PokemonCard {
  id: string;
  name: string;
  imageUrl: string;
  hp: string;
  type: string;
  attacks?: any[];
  weaknesses?: any[];
  hpLevel?: number;
  strengthLevel?: number;
  weaknessLevel?: number;
  happinessLevel?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PokemonService {
  private apiUrl = 'http://localhost:3030/api/cards';

  constructor(private http: HttpClient) {}

  getCards(
    name: string = '',
    type: string = '',
    limit: number = 20
  ): Observable<PokemonCard[]> {
    const url = `${this.apiUrl}?limit=${limit}&name=${name}&type=${type}`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        const cards = response.cards || [];

        return cards.map((card: any) => {
          return {
            ...card,
            hpLevel: this.calculateHp(card.hp),
            strengthLevel: this.calculateStrength(card.attacks),
            weaknessLevel: this.calculateWeakness(card.weaknesses),
            happinessLevel: this.calculateHappiness(
              card.hp,
              card.attacks,
              card.weaknesses
            ),
          };
        });
      })
    );
  }

  private calculateHp(hp: string): number {
    const val = Number(hp);

    if (isNaN(val) || val < 0) {
      return 0;
    }

    return val > 100 ? 100 : val;
  }

  private calculateStrength(attacks: any[]): number {
    if (!attacks) return 0;
    const length = attacks.length;

    if (length === 1) {
      return 50;
    } else if (length >= 2) {
      return 100;
    } else {
      return 0;
    }
  }

  private calculateWeakness(weaknesses: any[]): number {
    if (!weaknesses) return 0;
    const length = weaknesses.length;

    if (length >= 1) {
      return 100;
    } else {
      return 0;
    }
  }

  private calculateDamage(attacks: any[]): number {
    if (!attacks) return 0;
    let totalDamage = 0;
    attacks.forEach((atk) => {
      const damageStr = atk.damage || '';
      const damageVal = Number(damageStr.replace(/[^0-9]/g, ''));
      if (!isNaN(damageVal)) {
        totalDamage += damageVal;
      }
    });
    return totalDamage;
  }

  private calculateHappiness(
    hp: string,
    attacks: any[],
    weaknesses: any[]
  ): number {
    const rawHp = Number(hp) || 0;
    const damageVal = this.calculateDamage(attacks);
    const weaknessCount = weaknesses ? weaknesses.length : 0;

    const clampedHp = rawHp > 100 ? 100 : rawHp;

    let happiness = (clampedHp / 10 + damageVal / 10 + 10 - weaknessCount) / 5;

    if (happiness > 6) {
      happiness = 6;
    } else if (happiness < 0) {
      happiness = 0;
    }

    return Math.round(happiness);
  }
}
