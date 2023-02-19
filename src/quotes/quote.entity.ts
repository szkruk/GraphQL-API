import { ObjectType,Field, Float,Int} from "@nestjs/graphql"; 

@ObjectType()
export class Quote{

    @Field(type=>String)
    name:string;

    @Field(type=> Int)
    timestamp:number;

    @Field(type=>Float)
    price:number;
}