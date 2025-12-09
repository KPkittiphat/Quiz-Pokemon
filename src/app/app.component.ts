import { Component, OnInit } from '@angular/core';
import { PokemonService, PokemonCard } from './services/pokemon.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  myPokedex: PokemonCard[] = [];
  searchPokemons: PokemonCard[] = [];
  isModalOpen: boolean = false;
  searchName: string = '';

  constructor(private pokemonService: PokemonService) {}

  ngOnInit(): void {}

  openSearchModal() {
    this.isModalOpen = true;
    this.searchPokemon();
  }

  closeSearchModal() {
    this.isModalOpen = false;
    this.searchName = '';
    this.searchPokemons = [];
  }

  searchPokemon() {
    const knownTypes = [
      'Psychic',
      'Fighting',
      'Fairy',
      'Normal',
      'Grass',
      'Metal',
      'Water',
      'Lightning',
      'Darkness',
      'Colorless',
      'Fire',
      
    ];

    let nameParam = '';
    let typeParam = '';

    const foundType = knownTypes.find(
      (t) => t.toLowerCase() === this.searchName.toLowerCase()
    );

    if (foundType) {
      typeParam = foundType;
    } else {
      nameParam = this.searchName;
    }

    this.pokemonService
      .getCards(nameParam, typeParam)
      .subscribe((data: PokemonCard[]) => {
        this.searchPokemons = data.filter((apiCard) => {
          return !this.myPokedex.find((myCard) => myCard.id === apiCard.id);
        });
      });
  }

  addToPokedex(card: PokemonCard) {
    this.myPokedex.push(card);
    this.searchPokemons = this.searchPokemons.filter((p) => p.id !== card.id);
  }

  removeFromPokedex(card: PokemonCard) {
    this.myPokedex = this.myPokedex.filter((p) => p.id !== card.id);

    if (this.isModalOpen) {
      const isNameMatch = card.name
        .toLowerCase()
        .includes(this.searchName.toLowerCase());

      if (this.searchName === '' || isNameMatch) {
        this.searchPokemons.push(card);
      } else {
        this.searchPokemon();
      }
    }
  }
}
