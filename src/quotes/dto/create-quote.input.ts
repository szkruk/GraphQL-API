import { InputType } from "@nestjs/graphql"

@InputType()
export class CreateQuoteInput{

    name:string

    timestamp:number

    price:number
}