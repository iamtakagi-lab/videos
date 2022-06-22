import { ADMIN_PASS, ADMIN_USER } from "./environment";
import compare from "tsscmp";

export function checkAuth(user: string, pass: string) {
    let valid = true;
  
    valid = compare(user, ADMIN_USER) && valid;
    valid = compare(pass, ADMIN_PASS) && valid;
  
    return valid;
}

export default checkAuth