import { ICategory } from "./ICategory";

export interface ITransaction {
    date: string
    time: string
    amount: number
    note: string
    timezone: string
    transaction: 'expenses' | 'income' | ''
    repeat: IRepeat
    category: ICategory
}

export interface IRepeat {
    yes: boolean,
    every: IEvery
    endDate: string
}

export interface IEvery {
    times: number,
    period: string
}