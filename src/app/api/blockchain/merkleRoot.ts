import crypto from "crypto";

interface BlockData {
    [key: string]: string | number | boolean | BlockData | BlockData[];
}

async function encodeData(data: BlockData | unknown[]): Promise<string> {
    return JSON.stringify(await sortObjectKeys(data));
}

async function sortObjectKeys(obj: unknown): Promise<unknown> {
    if (Array.isArray(obj)) {
        return Promise.all(obj.map(sortObjectKeys));
    } else if (obj !== null && typeof obj === "object") {
        const objRecord = obj as Record<string, unknown>;
        return Object.keys(objRecord)
            .sort()
            .reduce((acc: Record<string, unknown>, key: string) => {
                acc[key] = sortObjectKeys(objRecord[key]);
                return acc;
            }, {});
    }
    return obj;
}

export async function sha256(data: string): Promise<string> {
    return crypto.createHash("sha256").update(data).digest("hex");
}

export async function merkleRoot(leaves: BlockData[]): Promise<string | null> {
    if (!leaves || leaves.length === 0) return null;

    let currentLevel = await Promise.all(leaves.map(async leaf => await sha256(await encodeData(leaf))));

    while (currentLevel.length > 1) {
        const nextLevel: string[] = [];

        for (let i = 0; i < currentLevel.length; i += 2) {
            const left = currentLevel[i];
            const right = currentLevel[i + 1] ?? left;
            const combined = left + right;
            nextLevel.push(await sha256(combined));
        }

        currentLevel = nextLevel;
    }

    return currentLevel[0];
}
