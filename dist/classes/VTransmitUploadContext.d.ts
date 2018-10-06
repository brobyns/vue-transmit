import VueTransmit from "../components/VueTransmit.vue";
import { VTransmitFile } from "./VTransmitFile";
import { UploadStatuses } from "../core/utils";
export declare class VTransmitUploadContext {
	vtransmit: VueTransmit;
	Statuses: typeof UploadStatuses;
	props: AnyObject;
	constructor(vtransmit: VueTransmit);
	emit(event: string, ...args: any[]): void;
	readonly acceptedFiles: VTransmitFile[];
	readonly rejectedFiles: VTransmitFile[];
	readonly addedFiles: VTransmitFile[];
	readonly queuedFiles: VTransmitFile[];
	readonly uploadingFiles: VTransmitFile[];
	readonly activeFiles: VTransmitFile[];
}
