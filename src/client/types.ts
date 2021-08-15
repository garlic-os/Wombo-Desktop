export type Maybe<T> = T | null | undefined;

export type PageName = "upload"
	                 | "select-meme"
	                 | "generating"
	                 | "result";

export interface Meme {
	name: string;
	artist: string;
	id: number;
	comment?: string;
}

export interface Gradient {
	name: string;
	colors: string[];
};
