declare module "random-string" {
    interface Options {
        length?: number;
        numeric?: boolean;
        letters?: boolean;
        special?: boolean;
        exclude?: string;
    }

    function randomString(opts?: Options): string;

    export = randomString;
}