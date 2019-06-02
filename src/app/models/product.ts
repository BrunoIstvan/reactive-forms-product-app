import { Department } from './department';

export interface Product {

    name: string,
    departments: Department[] | string[],
    price: number,
    stock: number,
    _id?: string

}
