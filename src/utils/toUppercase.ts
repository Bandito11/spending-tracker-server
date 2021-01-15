export function toUppercase(value: string){
    const firstLetterUppercase = value[0].toUpperCase()
    const formattedValue = firstLetterUppercase + value.substring(1, value.length)
    return formattedValue
}