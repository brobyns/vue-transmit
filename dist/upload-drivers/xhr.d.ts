import { VTransmitFile } from "../classes/VTransmitFile";
import { VTransmitUploadContext } from "../classes/VTransmitUploadContext";
import { DriverInterface, UploadResult } from "../core/interfaces";
export declare type ParamName = string | ((file: VTransmitFile) => string);
export declare type StaticOrDynamic<T> = T | ((files: VTransmitFile[]) => T);
export declare enum ParamNameStyle {
	Empty = 0,
	Indexed = 1,
	Brackets = 2,
}
/**
 * Responsibilities:
 * - send and manage upload via transport
 * - on progress: emit progress stats
 * - on error: emit to vue-transmit & update file status
 * - on timeout: emit to vue-transmit & update file status
 * - on error: emit to vue-transmit & update file status
 * - on success: emit to vue-transmit & update file status
 * - once complete: emit to vue-transmit & update file status
 */
export declare type XHRDriverOptions<T = any> = {
	/**
	 * A string representing the URL to send the request to
	 * or a function called with an array of files for the upload
	 * that returns a string url.
	 */
	url: StaticOrDynamic<string>;
	/**
	 * The HTTP method to use, such as "GET", "POST", "PUT", "DELETE", etc.
	 * Ignored for non-HTTP(S) URLs.
	 *
	 * ```
	 * // default => "post"
	 * ```
	 */
	method?: StaticOrDynamic<string>;
	/**
	 * The XMLHttpRequest.withCredentials property is a Boolean that indicates
	 * whether or not cross-site Access-Control requests should be made using
	 * credentials such as cookies, authorization headers or TLS client
	 * certificates. Setting withCredentials has no effect on same-site requests.
	 */
	withCredentials?: StaticOrDynamic<boolean>;
	/**
	 * The XMLHttpRequest.timeout property is an unsigned long representing the
	 * number of milliseconds a request can take before automatically being
	 * terminated. The default value is 0, which means there is no timeout.
	 * Timeout shouldn't be used for synchronous XMLHttpRequests requests used in
	 * a document environment or it will throw an InvalidAccessError exception.
	 * When a timeout happens, a timeout event is fired.
	 */
	timeout?: StaticOrDynamic<number>;
	/**
	 * The name of the file param that gets transferred.
	 */
	paramName?: ParamName;
	/**
	 * The param name syntax for multiple uploads.
	 *
	 * **Options:**
	 * - `0 (Empty)` _(Default)_ Adds nothing to the paramName: `file`
	 * - `1 (Indexed)` Adds the array index of the file: `file[0]`
	 * - `2 (Brackets)` Adds the array-like brackets without index: `file[]`
	 */
	multipleParamNameStyle?: ParamNameStyle;
	/**
	 * An object of additional parameters to transfer to the server.
	 * This is the same as adding hidden input fields in the form element.
	 */
	params?: StaticOrDynamic<Dictionary<string>>;
	headers?: StaticOrDynamic<Dictionary<string>>;
	/**
	 * The XMLHttpRequest.responseType property is an enumerated value that
	 * returns the type of response. It also lets the author change the response
	 * type. If an empty string is set as the value of responseType, the default
	 * value text will be used.
	 *
	 * Setting the value of responseType to "document" is ignored if done in a
	 * Worker environment. When setting responseType to a particular value,
	 * the author should make sure that the server is actually sending a response
	 * compatible to that format. If the server returns data that is not
	 * compatible to the responseType that was set, the value of response will be
	 * null. Also, setting responseType for synchronous requests will throw an
	 * InvalidAccessError exception.
	 */
	responseType?: StaticOrDynamic<XMLHttpRequestResponseType>;
	/**
	 * responseParseFunc is a function that given an XMLHttpRequest
	 * returns a response object. Allows for custom response parsing.
	 */
	responseParseFunc?: (xhr: XMLHttpRequest) => T;
	errUploadError?: (xhr: XMLHttpRequest) => string;
	errUploadTimeout?: (xhr: XMLHttpRequest) => string;
	renameFile?: (name: string) => string;
};
export declare type XHRUploadGroup = {
	id: number;
	files: VTransmitFile[];
	xhr: XMLHttpRequest;
};
export declare class XHRDriver<T = any> implements DriverInterface {
	context: VTransmitUploadContext;
	url: StaticOrDynamic<string>;
	method: StaticOrDynamic<string>;
	withCredentials: StaticOrDynamic<boolean>;
	timeout: StaticOrDynamic<number>;
	paramName: ParamName;
	multipleParamNameStyle: ParamNameStyle;
	params: StaticOrDynamic<Dictionary<string>>;
	headers: StaticOrDynamic<Dictionary<string>>;
	responseType: StaticOrDynamic<XMLHttpRequestResponseType>;
	errUploadError: (xhr: XMLHttpRequest) => string;
	errUploadTimeout: (xhr: XMLHttpRequest) => string;
	renameFile: (name: string) => string;
	responseParseFunc?: (xhr: XMLHttpRequest) => T;
	private uploadGroups;
	constructor(context: VTransmitUploadContext, options: XHRDriverOptions<T>);
	uploadFiles(files: VTransmitFile[]): Promise<UploadResult<T>>;
	handleUploadProgress(files: VTransmitFile[]): (e?: ProgressEvent) => void;
	getParamName(file: VTransmitFile, index: string | number): string;
	cancelUpload(file: VTransmitFile): VTransmitFile[];
	rmGroup(id: number): void;
}
