import { ScannedCode } from "./models"

export async function getAll(): Promise<ScannedCode[]>
{
    try{
        const response = await fetch('http://localhost:3000/codigos');
        const data = await response.json();
        return data as ScannedCode[];
    }catch(e){
        console.log(e);
        return [];
    }
}

export async function getById(id:string): Promise<ScannedCode|null>
{

}

export async function create(code: ScannedCode)
{

}

export async function deleteById(id:string)
{

}