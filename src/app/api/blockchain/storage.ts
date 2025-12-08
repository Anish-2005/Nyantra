import fs from "fs";
import path from "path";

interface Chain {
    [key: string]: unknown;
}

export async function loadChain(FILE: string): Promise<Chain | unknown[]> {
    if (!fs.existsSync(FILE)) {
        fs.writeFileSync(FILE, JSON.stringify({}, null, 4));
    }

    try {
        const data = fs.readFileSync(FILE, "utf-8");

        if (!data || !data.trim()) {
            fs.writeFileSync(FILE, JSON.stringify({}, null, 4));
            return {};
        }

        return JSON.parse(data);

    } catch (err) {
        fs.writeFileSync(FILE, JSON.stringify({}, null, 4));
        return {};
    }
}

export async function saveChain(FILE: string, chain: Chain | unknown[]): Promise<void> {
    fs.writeFileSync(FILE, JSON.stringify(chain, null, 4));
}
