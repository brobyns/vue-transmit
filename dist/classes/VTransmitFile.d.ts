import { UploadStatuses } from "../core/utils";
export interface UploadStats {
    bytesSent: number;
    progress: number;
    total: number;
    speed: SpeedStats;
    start: number;
    end: number;
    time: number;
}
export interface SpeedStats {
    kbps: number;
    mbps: number;
}
export declare class VTransmitFile {
    private _dataUrl;
    /**
     * The browser native file object obtained from the file input.
     */
    nativeFile: File;
    id: string;
    status: UploadStatuses;
    accepted: boolean;
    lastModified: number;
    lastModifiedDate: Date;
    name: string;
    processing: boolean;
    size: number;
    type: string;
    webkitRelativePath: USVString;
    width: number;
    height: number;
    errorMessage: string;
    thumbnailLoaded: boolean;
    /**
     * `adapterData` is data meant for use by an upload adapter only.
     */
    driverData: AnyObject;
    /**
     * `meta` is a place to add custom properties.
     */
    meta: AnyObject;
    upload: UploadStats;
    constructor(file: File);
    handleProgress(e: ProgressEvent): void;
    startProgress(): VTransmitFile;
    endProgress(): VTransmitFile;
    dataUrl: string;
    static idFactory(): string;
}
