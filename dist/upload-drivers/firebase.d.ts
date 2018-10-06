import { VTransmitFile } from "../classes/VTransmitFile";
import { VTransmitUploadContext } from "../classes/VTransmitUploadContext";
import { DriverInterface, UploadResult } from "../core/interfaces";
import firebase from "firebase";
export interface FirebaseUploadOptions {
	storageRef: (file: VTransmitFile) => firebase.storage.Reference;
	metadata?: (file: VTransmitFile) => firebase.storage.UploadMetadata;
}
export declare class FirebaseDriver implements DriverInterface {
	context: VTransmitUploadContext;
	options: FirebaseUploadOptions;
	cancelTokens: {
		[id: string]: () => any;
	};
	constructor(context: VTransmitUploadContext, options: FirebaseUploadOptions);
	cancelUpload(file: VTransmitFile): VTransmitFile[];
	uploadFiles(files: VTransmitFile[]): Promise<UploadResult<any>>;
}
