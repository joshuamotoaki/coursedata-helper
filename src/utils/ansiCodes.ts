/**
 * ANSI color codes for terminal output. For aesthetic use only. 🌈✨🎨
 */
export class AnsiColors {
    // Reset
    static readonly reset = "\x1b[0m";

    // Text formatting
    static readonly bright = "\x1b[1m";
    static readonly dim = "\x1b[2m";
    static readonly italic = "\x1b[3m";
    static readonly underline = "\x1b[4m";
    static readonly blink = "\x1b[5m";
    static readonly reverse = "\x1b[7m";
    static readonly hidden = "\x1b[8m";

    // Basic colors
    static readonly black = "\x1b[30m";
    static readonly red = "\x1b[31m";
    static readonly green = "\x1b[32m";
    static readonly yellow = "\x1b[33m";
    static readonly blue = "\x1b[34m";
    static readonly magenta = "\x1b[35m";
    static readonly cyan = "\x1b[36m";
    static readonly white = "\x1b[37m";
    static readonly orange = "\x1b[38;5;208m";

    // Bright colors
    static readonly brightBlack = "\x1b[90m";
    static readonly brightRed = "\x1b[91m";
    static readonly brightGreen = "\x1b[92m";
    static readonly brightYellow = "\x1b[93m";
    static readonly brightBlue = "\x1b[94m";
    static readonly brightMagenta = "\x1b[95m";
    static readonly brightCyan = "\x1b[96m";
    static readonly brightWhite = "\x1b[97m";

    // Background colors
    static readonly bgBlack = "\x1b[40m";
    static readonly bgRed = "\x1b[41m";
    static readonly bgGreen = "\x1b[42m";
    static readonly bgYellow = "\x1b[43m";
    static readonly bgBlue = "\x1b[44m";
    static readonly bgMagenta = "\x1b[45m";
    static readonly bgCyan = "\x1b[46m";
    static readonly bgWhite = "\x1b[47m";

    static colorize(text: string, color: string) {
        return `${color}${text}${this.reset}`;
    }

    static formatText(text: string, ...formats: string[]) {
        const formattedText = formats.reduce((result, format) => `${format}${result}`, text);
        return `${formattedText}${this.reset}`;
    }

    static print(text: string, ...formats: string[]) {
        const formattedText = this.formatText(text, ...formats);
        console.log(formattedText);
    }

    static color256(code: number) {
        return `\x1b[38;5;${code}m`;
    }

    static bgColor256(code: number) {
        return `\x1b[48;5;${code}m`;
    }

    static rainbow(text: string) {
        const colors = [this.red, this.yellow, this.green, this.cyan, this.blue, this.magenta];
        return (
            text
                .split("")
                .map((char, i) => `${colors[i % colors.length]}${char}`)
                .join("") + this.reset
        );
    }
}
