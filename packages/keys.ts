import { isEmpty } from "lodash";
import punycodeHelper from "punycode/";

export function punycode(str?: string | null) {
    if (typeof str !== "string") return "";
    try {
        return punycodeHelper.toUnicode(str);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        return str;
    }
}

export function punyEncode(str?: string | null) {
    if (typeof str !== "string") return "";
    return punycodeHelper.toASCII(str);
}

// allow letters, numbers, '-', '_', '/', '.', and emojis
export const validKeyRegex = new RegExp(
    /^[0-9A-Za-z_\u0080-\uFFFF\/\-\p{Emoji}.]+$/u,
);

export const isUnsupportedKey = (key: string) => {
    // special case for root domain links
    if (key === "_root") {
        return false;
    }
    const excludedPrefix = [".well-known"];
    const excludedSuffix = [".php", ".php7"];
    return (
        excludedPrefix.some((prefix) => key.startsWith(prefix)) ||
        excludedSuffix.some((suffix) => key.endsWith(suffix))
    );
};

export const isReservedKeyGlobal = (key: string) => {
    const reservedKeys = [
        "favicon.ico",
        "sitemap.xml",
        "robots.txt",
        "manifest.webmanifest",
        "manifest.json",
        "apple-app-site-association",
    ];
    return reservedKeys.includes(key);
};


export function processKey({ key }: { key: string | undefined | null }) {
    if (!key || isEmpty(key)) return null;

    key = key.trim();

    // Skip if root domain
    if (key === "_root") {
        return key;
    }

    if (!validKeyRegex.test(key)) {
        return null;
    }
    // if key starts with _, return null (reserved route for Dub internals)
    if (key.startsWith("_")) {
        return null;
    }

    // check if key is supported
    if (isUnsupportedKey(key)) {
        return null;
    }

    // remove all leading and trailing slashes from key
    key = key.replace(/^\/+|\/+$/g, "");

    // encode the key to ascii
    key = punyEncode(key);

    return key;
}