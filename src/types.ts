export type Maybe<T> = T | null | undefined;

export type PageName = "upload"
	                 | "select-meme"
	                 | "generating"
	                 | "result";

export interface Meme {
	name: string;
	artist: string;
	id: number;
	combo: boolean;
	comment?: string;
}

export interface Gradient {
	name: string;
	colors: string[];
};

export interface S3Fields {
	key: string;
	AWSAccessKeyId: string;
	policy: string;
	signature: string;
};

export interface UploadLocation {
	url: string;
	fields: S3Fields;
}

export type ProgressCallback = (message: string) => void;
