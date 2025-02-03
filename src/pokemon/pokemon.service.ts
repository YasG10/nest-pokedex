import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';


import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';


@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<Pokemon>   

  ) {}


  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();


    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    }catch (error) {
      this.handleExceptions(error);
    }    

    
  }

  findAll() {
    return this.pokemonModel.find();
    
  }

  async findOne(term: string) {

    if (!isNaN(+term)) {
      const pokemon = await this.pokemonModel.findOne({no: term});
      if (!pokemon) throw new BadRequestException(`Pokemon with no ${term} not found`);
      return pokemon;
    }

    //MongoId
    if(isValidObjectId(term)) {
      const pokemon = await this.pokemonModel.findById(term);
      if (!pokemon) throw new BadRequestException(`Pokemon with id ${term} not found`);
      return pokemon;
    }   

    const pokemon = await this.pokemonModel.findOne({name: term.toLowerCase().trim()});
    if (!pokemon) throw new BadRequestException(`Pokemon with name ${term} not found`);
    return pokemon;
   
    
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }

    try{
      const updatePokemon = await pokemon?.updateOne(updatePokemonDto);
      
    }catch (error) {
      this.handleExceptions(error);
    }

    return {...pokemon?.toJSON(), ...updatePokemonDto};
   
       
  }

  async remove(id: string) { 
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});

    if(deletedCount === 0){
      throw new BadRequestException(`Pokemon exist in db ${id} not found`)
    }
    
    return;
    
   
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exists in DB ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`);
  }
}
