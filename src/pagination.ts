export function paginate(array: string[], size: number, index: number) {
    return array.slice((index - 1) * size, index * size);
}

export default paginate