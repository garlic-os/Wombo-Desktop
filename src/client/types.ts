export type Maybe<T> = T | null | undefined;

export interface Meme {
	name: string;
	artist: string;
	id: number;
	comment?: string;
}

export type PageName = "upload"
	                 | "select-meme"
	                 | "generating"
	                 | "result";
