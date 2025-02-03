import {Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;

  
  constructor(@InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon & Document>) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany({});

    const {data} = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=1000');

    const pokemonToInsert: {name: string, no: number}[] = [];

    const insertPromisesArray: Promise<Pokemon>[] = [];

    data.results.forEach(({name, url}) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];

      //await this.pokemonService.create({name, no});

      pokemonToInsert.push(({name, no})
      
      );
      
    }); 
    await this.pokemonModel.insertMany(pokemonToInsert);

    return "SEED EXECUTED";
  }
}
