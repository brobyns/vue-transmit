import VueTransmit from "./components/VueTransmit.vue";
import { PluginObject } from "vue";
import {
	XHRDriver,
	ParamNameStyle,
	XHRDriverOptions,
	XHRUploadGroup,
} from "./upload-drivers/xhr";
import { AxiosDriver, AxiosDriverOptions } from "./upload-drivers/axios";
import {
	DriverConstructor,
	DriverInterface,
	UploadErr,
	UploadResult,
} from "./core/interfaces";
import {
	Dimensions,
	DrawImageArgs,
	ErrType,
	UploadStatuses,
	VTransmitEvents,
} from "./core/utils";
declare const VueTransmitPlugin: PluginObject<undefined>;
export {
	VueTransmitPlugin,
	VueTransmit,
	XHRDriver,
	ParamNameStyle,
	XHRDriverOptions,
	XHRUploadGroup,
	AxiosDriver,
	AxiosDriverOptions,
	DriverConstructor,
	DriverInterface,
	UploadErr,
	UploadResult,
	Dimensions,
	DrawImageArgs,
	ErrType,
	UploadStatuses,
	VTransmitEvents,
};
export default VueTransmitPlugin;
