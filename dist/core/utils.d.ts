import { VTransmitFile } from "../classes/VTransmitFile";
export declare function is_function(x: any): x is Function;
export declare function uniqueId(prefix: string): string;
export declare function round(number: number, decimals?: number): number;
export declare function fromBytesToKbit(bytes: number): number;
export declare function fromBytesToMbit(bytes: number): number;
export declare function toKbps(bytes: number, seconds: number): number;
export declare function toMbps(bytes: number, seconds: number): number;
export declare function NewObject(): {};
export declare function noop(): void;
export declare function scaleH(ratio: number, width: number): number;
export declare function scaleW(ratio: number, height: number): number;
export declare function expectNever(_: never, msg: string): never;
export declare enum UploadStatuses {
    None = "",
    Added = "added",
    Queued = "queued",
    Accepted = "queued",
    Uploading = "uploading",
    Canceled = "canceled",
    Error = "error",
    Timeout = "timeout",
    Success = "success",
}
export declare enum ErrType {
    Any = 0,
    Timeout = 1,
}
export declare enum VTransmitEvents {
    Initialize = "initialize",
    AddedFile = "added-file",
    AddedFiles = "added-files",
    RemovedFile = "removed-file",
    AcceptedFile = "accepted-file",
    RejectedFile = "rejected-file",
    AcceptComplete = "accept-complete",
    Thumbnail = "thumbnail",
    Processing = "processing",
    ProcessingMultiple = "processing-multiple",
    Canceled = "canceled",
    CanceledMultiple = "canceled-multiple",
    Sending = "sending",
    SendingMultiple = "sending-multiple",
    Timeout = "timeout",
    TimeoutMultiple = "timeout-multiple",
    UploadProgress = "upload-progress",
    TotalUploadProgress = "total-upload-progress",
    Success = "success",
    SuccessMultiple = "success-multiple",
    QueueComplete = "queue-complete",
    Complete = "complete",
    CompleteMultiple = "complete-multiple",
    Error = "error",
    ErrorMultiple = "error-multiple",
    MaxFilesReached = "max-files-reached",
    MaxFilesExceeded = "max-files-exceeded",
    Reset = "reset",
    DragOver = "drag-over",
    DragEnter = "drag-enter",
    DragLeave = "drag-leave",
    DragEnd = "drag-end",
    Drop = "drop",
    Paste = "paste",
}
/**
 * @link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
 */
export interface DrawImageArgs {
    sx: number;
    sy: number;
    sWidth: number;
    sHeight: number;
    dx: number;
    dy: number;
    dWidth: number;
    dHeight: number;
}
export interface Dimensions {
    width: number;
    height: number;
}
export declare function resizeImg(file: VTransmitFile, dims: Dimensions): DrawImageArgs;
export declare function webkitIsFile(entry: WebKitFileEntry | WebKitDirectoryEntry): entry is WebKitFileEntry;
export declare function webkitIsDir(entry: WebKitFileEntry | WebKitDirectoryEntry): entry is WebKitDirectoryEntry;
