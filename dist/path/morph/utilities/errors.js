import { SPACE } from '../constants';
export function raiseError() {
    throw new Error(Array.prototype.join.call(arguments, SPACE));
}
