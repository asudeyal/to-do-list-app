import {
    randomBytes,
    scrypt,
    timingSafeEqual,
} from "node:crypto";

import type { PasswordHasher } from "../../application/ports/password-hasher.js";

const HASH_ALGORITHM = "scrypt";
const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

function deriveKey(
    plainTextPassword: string,
    salt: string,
    keyLength: number,
): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        scrypt(
            plainTextPassword,
            salt,
            keyLength,
            (error, derivedKey) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(derivedKey);
            },
        );
    });
}

export class ScryptPasswordHasher implements PasswordHasher {
    async hash(plainTextPassword: string): Promise<string> {
        const salt = randomBytes(SALT_LENGTH).toString("hex");

        const derivedKey = await deriveKey(
            plainTextPassword,
            salt,
            KEY_LENGTH,
        );

        return [
            HASH_ALGORITHM,
            salt,
            derivedKey.toString("hex"),
        ].join(":");
    }

    async compare(
        plainTextPassword: string,
        passwordHash: string,
    ): Promise<boolean> {
        const [algorithm, salt, storedKeyHex] = passwordHash.split(":");

        if (
            algorithm !== HASH_ALGORITHM ||
            !salt ||
            !storedKeyHex
        ) {
            return false;
        }

        if (
            storedKeyHex.length % 2 !== 0 ||
            !/^[0-9a-f]+$/i.test(storedKeyHex)
        ) {
            return false;
        }

        const storedKey = Buffer.from(storedKeyHex, "hex");

        const derivedKey = await deriveKey(
            plainTextPassword,
            salt,
            storedKey.length,
        );

        if (storedKey.length !== derivedKey.length) {
            return false;
        }

        return timingSafeEqual(storedKey, derivedKey);
    }
}