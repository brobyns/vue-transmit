(function(global, factory) {
	typeof exports === "object" && typeof module !== "undefined"
		? factory(exports, require("vue"))
		: typeof define === "function" && define.amd
			? define(["exports", "vue"], factory)
			: factory((global.VueTransmit = {}), global.Vue);
})(this, function(exports, Vue) {
	"use strict";

	Vue = Vue && Vue.hasOwnProperty("default") ? Vue["default"] : Vue;

	function is_function(x) {
		return typeof x == "function";
	}
	var idCounter = 0;
	function uniqueId(prefix) {
		return prefix + ++idCounter;
	}
	function round(number, decimals) {
		if (decimals === void 0) {
			decimals = 2;
		}
		var roundingFactor = Math.pow(10, decimals);
		return Math.round(number * roundingFactor) / roundingFactor;
	}
	function fromBytesToKbit(bytes) {
		return bytes / 125;
	}
	function fromBytesToMbit(bytes) {
		return bytes / 125000;
	}
	function toKbps(bytes, seconds) {
		return fromBytesToKbit(bytes) / seconds;
	}
	function toMbps(bytes, seconds) {
		return fromBytesToMbit(bytes) / seconds;
	}
	function NewObject() {
		return {};
	}
	function noop() {}
	function scaleH(ratio, width) {
		return width / ratio;
	}
	function scaleW(ratio, height) {
		return height * ratio;
	}
	function expectNever(_, msg) {
		throw new Error(msg);
	}
	(function(UploadStatuses) {
		UploadStatuses["None"] = "";
		UploadStatuses["Added"] = "added";
		UploadStatuses["Queued"] = "queued";
		UploadStatuses["Accepted"] = "queued";
		UploadStatuses["Uploading"] = "uploading";
		UploadStatuses["Canceled"] = "canceled";
		UploadStatuses["Error"] = "error";
		UploadStatuses["Timeout"] = "timeout";
		UploadStatuses["Success"] = "success";
	})(exports.UploadStatuses || (exports.UploadStatuses = {}));
	(function(ErrType) {
		ErrType[(ErrType["Any"] = 0)] = "Any";
		ErrType[(ErrType["Timeout"] = 1)] = "Timeout";
	})(exports.ErrType || (exports.ErrType = {}));
	(function(VTransmitEvents) {
		VTransmitEvents["Initialize"] = "initialize";
		VTransmitEvents["AddedFile"] = "added-file";
		VTransmitEvents["AddedFiles"] = "added-files";
		VTransmitEvents["RemovedFile"] = "removed-file";
		VTransmitEvents["AcceptedFile"] = "accepted-file";
		VTransmitEvents["RejectedFile"] = "rejected-file";
		VTransmitEvents["AcceptComplete"] = "accept-complete";
		VTransmitEvents["Thumbnail"] = "thumbnail";
		VTransmitEvents["Processing"] = "processing";
		VTransmitEvents["ProcessingMultiple"] = "processing-multiple";
		VTransmitEvents["Canceled"] = "canceled";
		VTransmitEvents["CanceledMultiple"] = "canceled-multiple";
		VTransmitEvents["Sending"] = "sending";
		VTransmitEvents["SendingMultiple"] = "sending-multiple";
		VTransmitEvents["Timeout"] = "timeout";
		VTransmitEvents["TimeoutMultiple"] = "timeout-multiple";
		VTransmitEvents["UploadProgress"] = "upload-progress";
		VTransmitEvents["TotalUploadProgress"] = "total-upload-progress";
		VTransmitEvents["Success"] = "success";
		VTransmitEvents["SuccessMultiple"] = "success-multiple";
		VTransmitEvents["QueueComplete"] = "queue-complete";
		VTransmitEvents["Complete"] = "complete";
		VTransmitEvents["CompleteMultiple"] = "complete-multiple";
		VTransmitEvents["Error"] = "error";
		VTransmitEvents["ErrorMultiple"] = "error-multiple";
		VTransmitEvents["MaxFilesReached"] = "max-files-reached";
		VTransmitEvents["MaxFilesExceeded"] = "max-files-exceeded";
		VTransmitEvents["Reset"] = "reset";
		VTransmitEvents["DragOver"] = "drag-over";
		VTransmitEvents["DragEnter"] = "drag-enter";
		VTransmitEvents["DragLeave"] = "drag-leave";
		VTransmitEvents["DragEnd"] = "drag-end";
		VTransmitEvents["Drop"] = "drop";
		VTransmitEvents["Paste"] = "paste";
	})(exports.VTransmitEvents || (exports.VTransmitEvents = {}));
	function resizeImg(file, dims) {
		// 's' variables are for source
		// 'd' variables are for destination
		var sRatio = file.width / file.height;
		var dRatio = dims.width / dims.height;
		var coords = {
			sx: 0,
			sy: 0,
			sWidth: file.width,
			sHeight: file.height,
			dx: 0,
			dy: 0,
			dWidth: dims.width,
			dHeight: dims.height,
		};
		var w, h;
		if (dRatio > sRatio) {
			w = file.width;
			h = scaleH(dRatio, file.width);
		} else {
			w = scaleW(dRatio, file.height);
			h = file.height;
		}
		if (w < file.width) {
			coords.sx = (file.width - w) / 2;
			coords.sWidth = w;
		}
		if (h < file.height) {
			coords.sy = (file.height - h) / 2;
			coords.sHeight = h;
		}
		return coords;
	}
	function webkitIsFile(entry) {
		return entry.isFile;
	}
	function webkitIsDir(entry) {
		return entry.isDirectory;
	}

	var VTransmitFile = /** @class */ (function() {
		function VTransmitFile(file) {
			this._dataUrl = "";
			this.id = VTransmitFile.idFactory();
			this.status = exports.UploadStatuses.None;
			this.accepted = false; // Passed all validation.
			this.processing = false;
			this.width = 0;
			this.height = 0;
			this.errorMessage = "";
			this.thumbnailLoaded = false;
			/**
			 * `adapterData` is data meant for use by an upload adapter only.
			 */
			this.driverData = {};
			/**
			 * `meta` is a place to add custom properties.
			 */
			this.meta = {};
			this.upload = {
				bytesSent: 0,
				progress: 0,
				total: 0,
				speed: {
					kbps: 0,
					mbps: 0,
				},
				start: 0,
				end: 0,
				time: 0,
			};
			this.nativeFile = file;
			this.lastModified = file.lastModified;
			this.lastModifiedDate = file.lastModifiedDate;
			this.name = file.name;
			this.size = file.size;
			this.type = file.type;
			this.webkitRelativePath = file.webkitRelativePath;
			this.upload.total = file.size;
		}
		VTransmitFile.prototype.handleProgress = function(e) {
			this.startProgress();
			var total = e.total || this.upload.total;
			this.upload.progress = Math.min(100, (100 * e.loaded) / total);
			this.upload.bytesSent = e.loaded;
			this.upload.total = total;
			this.upload.time = (Date.now() - this.upload.start) / 1000;
			// Recalculate the upload speed in bytes/sec
			this.upload.speed.kbps = round(
				toKbps(this.upload.bytesSent, this.upload.time)
			);
			this.upload.speed.mbps = round(
				toMbps(this.upload.bytesSent, this.upload.time)
			);
			if (this.upload.progress === 100) {
				this.endProgress();
			}
		};
		VTransmitFile.prototype.startProgress = function() {
			// Avoid starting twice
			if (!this.upload.start) {
				this.upload.start = Date.now();
			}
			return this;
		};
		VTransmitFile.prototype.endProgress = function() {
			// Avoid ending twice
			if (!this.upload.end) {
				this.upload.end = Date.now();
				this.upload.time = (Date.now() - this.upload.start) / 1000;
			}
			return this;
		};
		Object.defineProperty(VTransmitFile.prototype, "dataUrl", {
			get: function() {
				return this.thumbnailLoaded ? this._dataUrl : "";
			},
			set: function(value) {
				// Use non-enumerable data url to avoid copying around large data sets
				Object.defineProperty(this, "_dataUrl", {
					value: value,
					enumerable: false,
					configurable: true,
					writable: true,
				});
				this.thumbnailLoaded = true;
			},
			enumerable: true,
			configurable: true,
		});
		VTransmitFile.idFactory = function() {
			return uniqueId("vt_");
		};
		return VTransmitFile;
	})();

	var VTransmitUploadContext = /** @class */ (function() {
		function VTransmitUploadContext(vtransmit) {
			this.vtransmit = vtransmit;
			this.Statuses = exports.UploadStatuses;
			this.props = vtransmit.$props;
		}
		VTransmitUploadContext.prototype.emit = function(event) {
			var args = [];
			for (var _i = 1; _i < arguments.length; _i++) {
				args[_i - 1] = arguments[_i];
			}
			var _a;
			(_a = this.vtransmit).$emit.apply(_a, [event].concat(args));
		};
		Object.defineProperty(VTransmitUploadContext.prototype, "acceptedFiles", {
			get: function() {
				return this.vtransmit.acceptedFiles;
			},
			enumerable: true,
			configurable: true,
		});
		Object.defineProperty(VTransmitUploadContext.prototype, "rejectedFiles", {
			get: function() {
				return this.vtransmit.rejectedFiles;
			},
			enumerable: true,
			configurable: true,
		});
		Object.defineProperty(VTransmitUploadContext.prototype, "addedFiles", {
			get: function() {
				return this.vtransmit.addedFiles;
			},
			enumerable: true,
			configurable: true,
		});
		Object.defineProperty(VTransmitUploadContext.prototype, "queuedFiles", {
			get: function() {
				return this.vtransmit.queuedFiles;
			},
			enumerable: true,
			configurable: true,
		});
		Object.defineProperty(
			VTransmitUploadContext.prototype,
			"uploadingFiles",
			{
				get: function() {
					return this.vtransmit.uploadingFiles;
				},
				enumerable: true,
				configurable: true,
			}
		);
		Object.defineProperty(VTransmitUploadContext.prototype, "activeFiles", {
			get: function() {
				return this.vtransmit.activeFiles;
			},
			enumerable: true,
			configurable: true,
		});
		return VTransmitUploadContext;
	})();

	function resolveStaticOrDynamic(x, files) {
		if (is_function(x)) {
			return x(files);
		}
		return x;
	}
	var ParamNameStyle;
	(function(ParamNameStyle) {
		ParamNameStyle[(ParamNameStyle["Empty"] = 0)] = "Empty";
		ParamNameStyle[(ParamNameStyle["Indexed"] = 1)] = "Indexed";
		ParamNameStyle[(ParamNameStyle["Brackets"] = 2)] = "Brackets";
	})(ParamNameStyle || (ParamNameStyle = {}));
	var group_id = 0;
	var AxiosDriver = /** @class */ (function() {
		function AxiosDriver(context, options) {
			this.uploadGroups = Object.create(null);
			var url = options.url,
				_a = options.method,
				method = _a === void 0 ? "post" : _a,
				_b = options.withCredentials,
				withCredentials = _b === void 0 ? false : _b,
				_c = options.timeout,
				timeout = _c === void 0 ? 0 : _c,
				_d = options.paramName,
				paramName = _d === void 0 ? "file" : _d,
				_e = options.multipleParamNameStyle,
				multipleParamNameStyle = _e === void 0 ? ParamNameStyle.Empty : _e,
				_f = options.params,
				params = _f === void 0 ? Object.create(null) : _f,
				_g = options.headers,
				headers =
					_g === void 0
						? {
								Accept: "application/json",
								"Cache-Control": "no-cache",
								"X-Requested-With": "XMLHttpRequest",
						  }
						: _g,
				_h = options.responseType,
				responseType = _h === void 0 ? "json" : _h,
				responseParseFunc = options.responseParseFunc,
				_j = options.errUploadError,
				errUploadError =
					_j === void 0
						? function(xhr) {
								return (
									"Error during upload: " +
									xhr.statusText +
									" [" +
									xhr.status +
									"]"
								);
						  }
						: _j,
				_k = options.errUploadTimeout,
				errUploadTimeout =
					_k === void 0
						? function(_xhr) {
								return "Error during upload: the server timed out.";
						  }
						: _k,
				_l = options.renameFile,
				renameFile =
					_l === void 0
						? function(name) {
								return name;
						  }
						: _l,
				http = options.http;
			if (!url) {
				throw new TypeError(
					this.constructor.name +
						" requires a 'url' parameter. Supply a string or a function returning a string."
				);
			}
			this.context = context;
			this.url = url;
			this.method = method;
			this.withCredentials = withCredentials;
			this.timeout = timeout;
			this.paramName = paramName;
			this.multipleParamNameStyle = multipleParamNameStyle;
			this.params = params;
			this.headers = headers;
			this.responseType = responseType;
			this.responseParseFunc = responseParseFunc;
			this.errUploadError = errUploadError;
			this.errUploadTimeout = errUploadTimeout;
			this.renameFile = renameFile;
			this.http = http;
		}
		AxiosDriver.prototype.uploadFiles = function(files) {
			var _this = this;
			return new Promise(function(resolve) {
				if (!_this.url) {
					return resolve({
						ok: false,
						err: {
							type: exports.ErrType.Any,
							message: "Missing upload URL.",
							data: _this.url,
						},
					});
				}
				var xhr = new XMLHttpRequest();
				var updateProgress = _this.handleUploadProgress(files);
				var id = group_id++;
				var params = resolveStaticOrDynamic(_this.params, files);
				_this.uploadGroups[id] = { id: id, xhr: xhr, files: files };
				for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
					var file = files_1[_i];
					file.driverData.groupID = id;
					file.startProgress();
				}
				var formData = new FormData();
				for (var _a = 0, _b = Object.keys(params); _a < _b.length; _a++) {
					var key = _b[_a];
					formData.append(key, params[key]);
				}
				for (var _c = 0, files_2 = files; _c < files_2.length; _c++) {
					var file = files_2[_c];
					_this.context.emit(
						exports.VTransmitEvents.Sending,
						file,
						xhr,
						formData
					);
				}
				if (_this.context.props.uploadMultiple) {
					_this.context.emit(
						exports.VTransmitEvents.SendingMultiple,
						files,
						xhr,
						formData
					);
				}
				for (var i = 0, len = files.length; i < len; i++) {
					formData.append(
						_this.getParamName(files[i], i),
						files[i].nativeFile,
						_this.renameFile(files[i].name)
					);
				}
				_this
					.http({
						url: _this.url,
						method: _this.method,
						data: formData,
						timeout: _this.timeout,
						withCredentials: _this.withCredentials,
						onUploadProgress: function(progressEvent) {
							updateProgress(progressEvent);
						},
					})
					.then(function(response) {
						return resolve({
							ok: true,
							data: response.data,
						});
					})
					.catch(function(error) {
						return resolve({
							ok: false,
							err: {
								type: exports.ErrType.Any,
								message: error.response.data.message,
								data: xhr,
							},
						});
					});
			});
		};
		AxiosDriver.prototype.handleUploadProgress = function(files) {
			var vm = this.context.vtransmit;
			return function onProgressFn(e) {
				if (!e) {
					var allFilesFinished = true;
					for (var _i = 0, files_3 = files; _i < files_3.length; _i++) {
						var file = files_3[_i];
						if (
							file.upload.progress !== 100 ||
							file.upload.bytesSent !== file.upload.total
						) {
							allFilesFinished = false;
						}
						file.upload.progress = 100;
						file.upload.bytesSent = file.upload.total;
						file.endProgress();
					}
					if (allFilesFinished) {
						return;
					}
				}
				for (var _a = 0, files_4 = files; _a < files_4.length; _a++) {
					var file = files_4[_a];
					if (e) {
						file.handleProgress(e);
					}
					vm.$emit(
						exports.VTransmitEvents.UploadProgress,
						file,
						file.upload.progress,
						file.upload.bytesSent
					);
				}
			};
		};
		AxiosDriver.prototype.getParamName = function(file, index) {
			var paramName;
			if (is_function(this.paramName)) {
				paramName = this.paramName(file);
			} else {
				paramName = this.paramName;
			}
			if (!this.context.props.uploadMultiple) {
				return paramName;
			}
			switch (this.multipleParamNameStyle) {
				case ParamNameStyle.Indexed:
					paramName += "[" + index + "]";
					break;
				case ParamNameStyle.Brackets:
					paramName += "[]";
					break;
				case ParamNameStyle.Empty:
				default:
					break;
			}
			return paramName;
		};
		AxiosDriver.prototype.cancelUpload = function(file) {
			var group = this.uploadGroups[file.driverData.groupID];
			if (!group) {
				return [];
			}
			group.xhr.abort();
			this.rmGroup(file.driverData.groupID);
			return group.files.slice();
		};
		AxiosDriver.prototype.rmGroup = function(id) {
			delete this.uploadGroups[id];
		};
		return AxiosDriver;
	})();

	var VueTransmit = Vue.extend({
		render: function() {
			var _vm = this;
			var _h = _vm.$createElement;
			var _c = _vm._self._c || _h;
			return _c(
				_vm.tag,
				{ tag: "component" },
				[
					_vm.filesSlotFirst
						? _vm._t("files", null, null, _vm.fileSlotBindings)
						: _vm._e(),
					_vm._v(" "),
					_c(
						"div",
						_vm._g(
							_vm._b(
								{
									staticClass: "v-transmit__upload-area",
									class: [_vm.isDraggingClass, _vm.uploadAreaClasses],
									attrs: { draggable: !_vm.disableDraggable },
									on: {
										click: _vm.handleClickUploaderAction,
										dragstart: _vm.handleDragStart,
										dragend: _vm.handleDragEnd,
										dragenter: function($event) {
											$event.preventDefault();
											$event.stopPropagation();
											return _vm.handleDragEnter($event);
										},
										dragover: function($event) {
											$event.preventDefault();
											$event.stopPropagation();
											return _vm.handleDragOver($event);
										},
										dragleave: _vm.handleDragLeave,
										drop: function($event) {
											$event.preventDefault();
											$event.stopPropagation();
											return _vm.handleDrop($event);
										},
									},
								},
								"div",
								_vm.uploadAreaAttrs,
								false
							),
							_vm.uploadAreaListeners
						),
						[_vm._t("default")],
						2
					),
					_vm._v(" "),
					!_vm.filesSlotFirst
						? _vm._t("files", null, null, _vm.fileSlotBindings)
						: _vm._e(),
					_vm._v(" "),
					_c("form", { ref: "uploadForm", style: _vm.formStyles }, [
						_c("input", {
							ref: "hiddenFileInput",
							class: [_vm.maxFilesReachedClass],
							attrs: {
								type: "file",
								multiple: _vm.multiple,
								accept: _vm.filesToAccept,
								capture: _vm.capture,
							},
							on: { change: _vm.onFileInputChange },
						}),
					]),
				],
				2
			);
		},
		staticRenderFns: [],
		name: "VueTransmit",
		props: {
			tag: {
				type: String,
				default: "div",
			},
			disableDraggable: {
				type: Boolean,
				default: false,
			},
			uploadAreaClasses: {
				type: [Array, Object, String],
				default: null,
			},
			uploadAreaAttrs: {
				type: Object,
				default: NewObject,
			},
			uploadAreaListeners: {
				type: Object,
				default: NewObject,
			},
			dragClass: {
				type: String,
				default: null,
			},
			filesSlotFirst: {
				type: Boolean,
				default: false,
			},
			/**
			 * Sets the maximum number of uploads that can be running at a given time.
			 */
			maxConcurrentUploads: {
				type: Number,
				default: 2,
			},
			/**
			 * Whether to send multiple files in one request.
			 */
			uploadMultiple: {
				type: Boolean,
				default: false,
			},
			/**
			 * Size in MB by default, or MiB if useBinarySizeBase == true
			 */
			maxFileSize: {
				type: Number,
				default: 256,
			},
			/**
			 * By default, a base 10 size is used. This corresponds to KB, MB, GB, etc.
			 * If this property is true, a binary base will be used. This would
			 * correspond to KiB, MiB, GiB.
			 *
			 * Base 10: `1000 ** x` where `x` equal 1(KB), 2(MB), 3(GB), etc.
			 *
			 * Base 2: `1 << x` where `x` equal 10(KiB), 20(MiB), 30(GiB), etc.
			 */
			useBinarySizeBase: {
				type: Boolean,
				default: false,
			},
			createImageThumbnails: {
				type: Boolean,
				default: true,
			},
			// in MB. When the filename exceeds this limit, the thumbnail will not be generated.
			maxThumbnailFileSize: {
				type: Number,
				default: 10,
			},
			thumbnailWidth: {
				type: Number,
				default: 120,
			},
			thumbnailHeight: {
				type: Number,
				default: 120,
			},
			/**
			 * Can be used to limit the maximum number of files that will be handled
			 * by this Dropzone
			 */
			maxFiles: {
				type: Number,
				default: null,
			},
			/**
			 * If true, the dropzone will present a file selector when clicked.
			 */
			clickable: {
				type: Boolean,
				default: true,
			},
			/**
			 * Whether dot files in directories should be ignored.
			 */
			ignoreHiddenFiles: {
				type: Boolean,
				default: true,
			},
			/**
			 * You can set accepted mime types here.
			 *
			 * The default implementation of the `accept()` function will check this
			 * property, and if the Dropzone is clickable this will be used as
			 * `accept` attribute.
			 *
			 * This is a comma separated list of mime types or extensions. E.g.:
			 * - audio/*,video/*,image/png,.pdf
			 *
			 * See https://developer.mozilla.org/en-US/docs/HTML/Element/input#attr-accept
			 * for a reference.
			 */
			acceptedFileTypes: {
				type: Array,
				default: function() {
					return [];
				},
			},
			/**
			 * If false, files will be added to the queue but the queue will not be
			 * processed automatically.
			 * This can be useful if you need some additional user input before sending
			 * files (or if you want want all files sent at once).
			 * If you're ready to send the file simply call myDropzone.processQueue()
			 */
			autoProcessQueue: {
				type: Boolean,
				default: true,
			},
			/**
			 * If false, files added to the dropzone will not be queued by default.
			 * You'll have to call `enqueueFile(file)` manually.
			 */
			autoQueue: {
				type: Boolean,
				default: true,
			},
			/**
			 * If null, no capture type will be specified
			 * If camera, mobile devices will skip the file selection and choose camera
			 * If microphone, mobile devices will skip the file selection and choose the microphone
			 * If camcorder, mobile devices will skip the file selection and choose the camera in video mode
			 * On apple devices multiple must be set to false.  AcceptedFiles may need to
			 * be set to an appropriate mime type (e.g. "image/*", "audio/*", or "video/*").
			 */
			capture: {
				type: String,
				default: null,
			},
			// If the file size is too big.
			errMaxFileSizeExceeded: {
				type: Function,
				default: function(fileSize, maxFileSize, units) {
					return {
						label: "upload.filesize_too_big",
						data: {
							fileSize: round(fileSize, 1),
							maxFileSize: round(maxFileSize, 1),
						},
					};
				},
			},
			errInvalidFileType: {
				type: Function,
				default: function(type, _acceptedTypes, _file) {
					return {
						label: "upload.invalid_file_type",
						data: {
							fileType: type,
						},
					};
				},
			},
			errMaxFilesExceeded: {
				type: Function,
				default: function(maxFiles) {
					return {
						label: "upload.max_files_exceeded",
						data: {
							maxFiles: maxFiles,
						},
					};
				},
			},
			/**
			 * If `done()` is called without argument the file is accepted
			 * If you call it with an error message, the file is rejected
			 * (This allows for asynchronous validation).
			 */
			accept: {
				type: Function,
				default: function(_file, done) {
					done();
				},
			},
			resize: {
				type: Function,
				default: resizeImg,
			},
			driverOptions: {
				type: Object,
				default: NewObject,
			},
			driver: {
				type: Function,
				default: AxiosDriver,
			},
		},
		mounted: function() {
			var _this = this;
			this.$on(
				exports.VTransmitEvents.UploadProgress,
				this.updateTotalUploadProgress
			);
			this.$on(
				exports.VTransmitEvents.RemovedFile,
				this.updateTotalUploadProgress
			);
			this.$on(exports.VTransmitEvents.Canceled, function(file) {
				return _this.$emit(exports.VTransmitEvents.Complete, file);
			});
			this.$on(exports.VTransmitEvents.Complete, function(file) {
				if (
					_this.addedFiles.length === 0 &&
					_this.uploadingFiles.length === 0 &&
					_this.queuedFiles.length === 0
				) {
					Promise.resolve().then(function() {
						return _this.$emit(
							exports.VTransmitEvents.QueueComplete,
							file
						);
					});
				}
			});
			window.addEventListener("paste", this.handlePaste);
			this.$emit(exports.VTransmitEvents.Initialize, this);
		},
		beforeDestroy: function() {
			window.removeEventListener("paste", this.handlePaste);
		},
		data: function() {
			return {
				dragging: false,
				// Used to keep the createThumbnail calls processing async one-at-a-time
				processingThumbnail: false,
				thumbnailQueue: [],
				files: [],
				defaultHeaders: {
					Accept: "application/json",
					"Cache-Control": "no-cache",
					"X-Requested-With": "XMLHttpRequest",
				},
				formStyles: {
					visibility: "hidden !important",
					position: "absolute !important",
					top: "0 !important",
					left: "0 !important",
					height: "0px !important",
					width: "0px !important",
				},
			};
		},
		computed: {
			inputEl: function() {
				var el = this.$refs.hiddenFileInput;
				if (!(el instanceof HTMLInputElement)) {
					return null;
				}
				return el;
			},
			formEl: function() {
				var el = this.$refs.uploadForm;
				if (!(el instanceof HTMLFormElement)) {
					return null;
				}
				return el;
			},
			fileSizeBase: function() {
				if (this.useBinarySizeBase) {
					return 1024;
				}
				return 1000;
			},
			maxFileSizeBytes: function() {
				return this.maxFileSize * this.fileSizeBase * this.fileSizeBase;
			},
			filesToAccept: function() {
				return this.acceptedFileTypes.join(",");
			},
			multiple: function() {
				return this.maxFiles === null || this.maxFiles > 1;
			},
			addedFiles: function() {
				return this.getFilesWithStatus(exports.UploadStatuses.Added);
			},
			queuedFiles: function() {
				return this.getFilesWithStatus(exports.UploadStatuses.Queued);
			},
			acceptedFiles: function() {
				return this.files.filter(function(f) {
					return f.accepted;
				});
			},
			rejectedFiles: function() {
				return this.files.filter(function(f) {
					return !f.accepted;
				});
			},
			uploadingFiles: function() {
				return this.getFilesWithStatus(exports.UploadStatuses.Uploading);
			},
			canceledFiles: function() {
				return this.getFilesWithStatus(exports.UploadStatuses.Canceled);
			},
			failedFiles: function() {
				return this.getFilesWithStatus(exports.UploadStatuses.Error);
			},
			timeoutFiles: function() {
				return this.getFilesWithStatus(exports.UploadStatuses.Timeout);
			},
			successfulFiles: function() {
				return this.getFilesWithStatus(exports.UploadStatuses.Success);
			},
			activeFiles: function() {
				return this.getFilesWithStatus(
					exports.UploadStatuses.Uploading,
					exports.UploadStatuses.Queued
				);
			},
			maxFilesReached: function() {
				return (
					this.maxFiles != null &&
					this.acceptedFiles.length >= this.maxFiles
				);
			},
			maxFilesReachedClass: function() {
				return this.maxFilesReached
					? "v-transmit__max-files--reached"
					: null;
			},
			isDraggingClass: function() {
				var _a;
				return (
					(_a = {
						"v-transmit__upload-area--is-dragging": this.dragging,
					}),
					(_a[this.dragClass] = this.dragging),
					_a
				);
			},
			isUploading: function() {
				return this.uploadingFiles.length > 0;
			},
			fileSlotBindings: function() {
				return {
					files: this.files,
					acceptedFiles: this.acceptedFiles,
					rejectedFiles: this.rejectedFiles,
					addedFiles: this.addedFiles,
					queuedFiles: this.queuedFiles,
					uploadingFiles: this.uploadingFiles,
					canceledFiles: this.canceledFiles,
					failedFiles: this.failedFiles,
					timeoutFiles: this.timeoutFiles,
					successfulFiles: this.successfulFiles,
					activeFiles: this.activeFiles,
					isUploading: this.isUploading,
				};
			},
			transport: function() {
				var Driver = this.driver;
				try {
					return new Driver(
						new VTransmitUploadContext(this),
						this.driverOptions
					);
				} catch (err) {
					console.error(
						"[vue-transmit] Error resolving upload driver:",
						err
					);
					throw err;
				}
			},
		},
		watch: {
			acceptedFiles: function(acceptedFiles) {
				if (this.maxFiles == null) {
					return;
				}
				if (acceptedFiles.length >= this.maxFiles) {
					this.$emit(exports.VTransmitEvents.MaxFilesReached, this.files);
				}
			},
		},
		methods: {
			getFilesWithStatus: function() {
				var statuses = [];
				for (var _i = 0; _i < arguments.length; _i++) {
					statuses[_i] = arguments[_i];
				}
				return this.files.filter(function(f) {
					return statuses.indexOf(f.status) > -1;
				});
			},
			onFileInputChange: function() {
				var _a = this,
					inputEl = _a.inputEl,
					formEl = _a.formEl;
				if (inputEl == null || formEl == null) {
					// This is unreachable code,
					// but we need to let TS know it.
					throw TypeError();
				}
				// Can be null
				if (!inputEl.files) {
					return;
				}
				this.$emit(
					exports.VTransmitEvents.AddedFiles,
					Array.from(inputEl.files).map(this.addFile)
				);
				// Reset input element's files
				// https://github.com/alexsasharegan/vue-transmit/issues/25
				formEl.reset();
			},
			addFile: function(file) {
				var _this = this;
				var vtFile = new VTransmitFile(file);
				vtFile.status = exports.UploadStatuses.Added;
				this.files.push(vtFile);
				this.$emit(exports.VTransmitEvents.AddedFile, vtFile);
				this.enqueueThumbnail(vtFile);
				this.acceptFile(vtFile, function(error) {
					if (error) {
						vtFile.accepted = false;
						_this.errorProcessing([vtFile], error);
						_this.$emit(exports.VTransmitEvents.RejectedFile, vtFile);
						_this.$emit(exports.VTransmitEvents.AcceptComplete, vtFile);
						return;
					}
					vtFile.accepted = true;
					_this.$emit(exports.VTransmitEvents.AcceptedFile, vtFile);
					_this.$emit(exports.VTransmitEvents.AcceptComplete, vtFile);
					if (_this.autoQueue) {
						_this.enqueueFile(vtFile);
					}
				});
				return vtFile;
			},
			acceptFile: function(file, done) {
				// File size check
				if (file.size > this.maxFileSizeBytes) {
					// size is in bytes, base is kilo multiplier, so base * base == mega
					var mega = this.fileSizeBase * this.fileSizeBase;
					var fileSize = file.size / mega;
					var units = "MB";
					if (this.useBinarySizeBase) {
						units = "MiB";
					}
					return done(
						this.errMaxFileSizeExceeded(fileSize, this.maxFileSize, units)
					);
				}
				// File type check
				if (!this.isValidFileType(file, this.acceptedFileTypes)) {
					return done(
						this.errInvalidFileType(
							file.type,
							this.acceptedFileTypes,
							file
						)
					);
				}
				// Upload limit check
				if (
					this.maxFiles != null &&
					this.acceptedFiles.length >= this.maxFiles
				) {
					this.$emit(exports.VTransmitEvents.MaxFilesExceeded, file);
					return done(this.errMaxFilesExceeded(this.maxFiles));
				}
				// Happy path 😀
				this.accept(file, done);
			},
			removeFile: function(file) {
				if (file.status === exports.UploadStatuses.Uploading) {
					this.cancelUpload(file);
				}
				var idxToRm = this.files.findIndex(function(f) {
					return f.id === file.id;
				});
				if (idxToRm > -1) {
					this.$emit(
						exports.VTransmitEvents.RemovedFile,
						this.files.splice(idxToRm, 1)[0]
					);
					if (this.files.length === 0) {
						this.$emit(exports.VTransmitEvents.Reset);
					}
				}
			},
			removeFilesWithStatus: function() {
				var statuses = [];
				for (var _i = 0; _i < arguments.length; _i++) {
					statuses[_i] = arguments[_i];
				}
				this.getFilesWithStatus.apply(this, statuses).map(this.removeFile);
			},
			removeAllFiles: function(cancelInProgressUploads) {
				if (cancelInProgressUploads === void 0) {
					cancelInProgressUploads = false;
				}
				this.files
					.filter(function(f) {
						return (
							f.status !== exports.UploadStatuses.Uploading ||
							cancelInProgressUploads
						);
					})
					.map(this.removeFile);
			},
			triggerBrowseFiles: function() {
				if (this.inputEl) {
					this.inputEl.click();
				}
			},
			handleClickUploaderAction: function() {
				if (this.clickable) {
					this.triggerBrowseFiles();
				}
			},
			enqueueFile: function(file) {
				if (
					file.status !== exports.UploadStatuses.Added ||
					file.accepted !== true
				) {
					throw new Error(
						"This file can't be queued because it has already been processed or was rejected."
					);
				}
				file.status = exports.UploadStatuses.Queued;
				if (this.autoProcessQueue) {
					Promise.resolve().then(this.processQueue);
				}
			},
			enqueueThumbnail: function(file) {
				if (
					!this.createImageThumbnails ||
					!file.type.match(/image.*/) ||
					file.size > this.maxThumbnailFileSize * 1024 * 1024
				) {
					return;
				}
				this.thumbnailQueue.push(file);
				Promise.resolve().then(this.processThumbnailQueue);
			},
			processThumbnailQueue: function() {
				var _this = this;
				var file;
				// Employ a chain of self-calling, self-queuing createThumbnail calls
				// so execution can stay as non-blocking as possible.
				if (this.processingThumbnail || this.thumbnailQueue.length === 0) {
					return;
				}
				this.processingThumbnail = true;
				if ((file = this.thumbnailQueue.shift())) {
					this.createThumbnail(file, function() {
						_this.processingThumbnail = false;
						_this.processThumbnailQueue();
					});
				}
			},
			createThumbnail: function(file, callback) {
				var _this = this;
				if (callback === void 0) {
					callback = noop;
				}
				var reader = new FileReader();
				reader.addEventListener(
					"load",
					function() {
						if (file.type === "image/svg+xml") {
							file.dataUrl = reader.result;
							_this.$emit(
								exports.VTransmitEvents.Thumbnail,
								file,
								reader.result
							);
							callback();
						}
						_this.createThumbnailFromUrl(file, reader.result, callback);
					},
					false
				);
				// FileReader requires a native File|Blob object
				reader.readAsDataURL(file.nativeFile);
			},
			createThumbnailFromUrl: function(file, imageUrl, callback) {
				var _this = this;
				var imgEl = document.createElement("img");
				imgEl.addEventListener(
					"load",
					function() {
						var ctx;
						file.width = imgEl.width;
						file.height = imgEl.height;
						var resizeInfo = _this.resize(file, {
							width: _this.thumbnailWidth,
							height: _this.thumbnailHeight,
						});
						var canvas = document.createElement("canvas");
						// Can be null
						if (!(ctx = canvas.getContext("2d"))) {
							return;
						}
						canvas.width = resizeInfo.dWidth;
						canvas.height = resizeInfo.dHeight;
						ctx.drawImage(
							imgEl,
							resizeInfo.sx,
							resizeInfo.sy,
							resizeInfo.sWidth,
							resizeInfo.sHeight,
							resizeInfo.dx,
							resizeInfo.dy,
							resizeInfo.dWidth,
							resizeInfo.dHeight
						);
						var thumbnail = canvas.toDataURL("image/png");
						file.dataUrl = thumbnail;
						_this.$emit(
							exports.VTransmitEvents.Thumbnail,
							file,
							thumbnail
						);
						if (callback) {
							canvas.toBlob(function(blob) {
								return callback(blob);
							});
						}
					},
					false
				);
				if (callback) {
					imgEl.addEventListener("error", callback, false);
				}
				imgEl.src = imageUrl;
			},
			processQueue: function() {
				var len_uploading = this.uploadingFiles.length;
				if (
					len_uploading >= this.maxConcurrentUploads ||
					this.queuedFiles.length === 0
				) {
					return;
				}
				if (this.uploadMultiple) {
					return this.processFiles(
						this.queuedFiles.slice(
							0,
							this.maxConcurrentUploads - len_uploading
						)
					);
				}
				var i = len_uploading;
				var file;
				for (; i < this.maxConcurrentUploads; i++) {
					if ((file = this.queuedFiles.shift())) {
						this.processFile(file);
					}
				}
			},
			processFile: function(file) {
				this.processFiles([file]);
			},
			processFiles: function(files) {
				var file;
				for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
					file = files_1[_i];
					file.processing = true;
					file.status = exports.UploadStatuses.Uploading;
					this.$emit(exports.VTransmitEvents.Processing, file);
				}
				if (this.uploadMultiple) {
					this.$emit(exports.VTransmitEvents.ProcessingMultiple, files);
				}
				return this.uploadFiles(files);
			},
			cancelUpload: function(file) {
				// Cancel a file before uploading
				if (
					file.status === exports.UploadStatuses.Added ||
					file.status === exports.UploadStatuses.Queued
				) {
					file.status = exports.UploadStatuses.Canceled;
					this.$emit(exports.VTransmitEvents.Canceled, file);
					if (this.uploadMultiple) {
						this.$emit(exports.VTransmitEvents.CanceledMultiple, [file]);
					}
				}
				// Cancel an in-progress upload
				if (file.status === exports.UploadStatuses.Uploading) {
					var canceledFiles = this.transport.cancelUpload(file);
					var f = void 0;
					for (
						var _i = 0, canceledFiles_1 = canceledFiles;
						_i < canceledFiles_1.length;
						_i++
					) {
						f = canceledFiles_1[_i];
						f.status = exports.UploadStatuses.Canceled;
						this.$emit(exports.VTransmitEvents.Canceled, f);
					}
					if (this.uploadMultiple) {
						this.$emit(
							exports.VTransmitEvents.CanceledMultiple,
							canceledFiles
						);
					}
				}
				if (this.autoProcessQueue) {
					this.processQueue();
				}
			},
			uploadFile: function(file) {
				this.uploadFiles([file]);
			},
			uploadFiles: function(files) {
				var _this = this;
				this.transport.uploadFiles(files).then(function(result) {
					if (result.ok) {
						return _this.uploadFinished(files, result.data);
					}
					switch (result.err.type) {
						case exports.ErrType.Any:
							_this.errorProcessing(
								files,
								result.err.message,
								result.err.data
							);
							break;
						case exports.ErrType.Timeout:
							_this.handleTimeout(
								files,
								result.err.message,
								result.err.data
							);
							break;
						default:
							expectNever(result.err.type, "unmatched error case");
							break;
					}
				});
			},
			handleTimeout: function(files, message, data) {
				var f;
				for (var _i = 0, files_2 = files; _i < files_2.length; _i++) {
					f = files_2[_i];
					f.status = exports.UploadStatuses.Timeout;
					f.endProgress();
					this.$emit(exports.VTransmitEvents.Timeout, f, message, data);
				}
				this.$emit(
					exports.VTransmitEvents.TimeoutMultiple,
					files,
					message,
					data
				);
				if (this.autoProcessQueue) {
					this.processQueue();
				}
			},
			updateTotalUploadProgress: function() {
				var progress = this.activeFiles.reduce(
					function(memo, file) {
						memo.totalBytesSent += file.upload.bytesSent;
						memo.totalBytes += file.upload.total;
						return memo;
					},
					{ totalBytesSent: 0, totalBytes: 0, totalProgress: 100 }
				);
				if (this.activeFiles.length) {
					progress.totalProgress =
						(100 * progress.totalBytesSent) / progress.totalBytes;
				}
				this.$emit(exports.VTransmitEvents.TotalUploadProgress, progress);
			},
			uploadFinished: function(files, response) {
				var args = [];
				for (var _i = 2; _i < arguments.length; _i++) {
					args[_i - 2] = arguments[_i];
				}
				for (var _a = 0, files_3 = files; _a < files_3.length; _a++) {
					var file = files_3[_a];
					file.status = exports.UploadStatuses.Success;
					file.endProgress();
					this.$emit.apply(
						this,
						[exports.VTransmitEvents.Success, file, response].concat(args)
					);
					this.$emit(exports.VTransmitEvents.Complete, file);
				}
				if (this.uploadMultiple) {
					this.$emit.apply(
						this,
						[
							exports.VTransmitEvents.SuccessMultiple,
							files,
							response,
						].concat(args)
					);
					this.$emit(exports.VTransmitEvents.CompleteMultiple, files);
				}
				if (this.autoProcessQueue) {
					this.processQueue();
				}
			},
			errorProcessing: function(files, message, data) {
				for (var _i = 0, files_4 = files; _i < files_4.length; _i++) {
					var file = files_4[_i];
					file.status = exports.UploadStatuses.Error;
					file.errorMessage = message;
					file.endProgress();
					this.$emit(exports.VTransmitEvents.Error, file, message, data);
					this.$emit(exports.VTransmitEvents.Complete, file);
				}
				if (this.uploadMultiple) {
					this.$emit(
						exports.VTransmitEvents.ErrorMultiple,
						files,
						message,
						data
					);
					this.$emit(exports.VTransmitEvents.CompleteMultiple, files);
				}
				if (this.autoProcessQueue) {
					return this.processQueue();
				}
			},
			isValidFileType: function(file, acceptedFileTypes) {
				if (!acceptedFileTypes.length) {
					return true;
				}
				var mime_type = file.type;
				var base_type = mime_type.slice(0, mime_type.indexOf("/"));
				var valid_type;
				// Return true on the first condition match,
				// otherwise exhaust all conditions and return false.
				for (
					var _i = 0, acceptedFileTypes_1 = acceptedFileTypes;
					_i < acceptedFileTypes_1.length;
					_i++
				) {
					valid_type = acceptedFileTypes_1[_i];
					switch (true) {
						// Handle extension validation
						case valid_type.charAt(0) == ".":
							// Ensure extension exists at the end of the filename.
							if (
								file.name
									.toLowerCase()
									.indexOf(
										valid_type.toLowerCase(),
										file.name.length - valid_type.length
									) !== -1
							) {
								return true;
							}
							break;
						// Handle globs ("image/*")
						case valid_type.slice(-2) == "/*":
							if (base_type === valid_type.slice(0, -2)) {
								return true;
							}
							break;
						// Match mimetype exact
						default:
							if (mime_type == valid_type) {
								return true;
							}
							break;
					}
				}
				return false;
			},
			handleDragStart: function(e) {
				this.$emit("drag-start", e);
			},
			handleDragOver: function(e) {
				this.dragging = true;
				var effect;
				try {
					// Handle browser bug
					effect = e.dataTransfer.effectAllowed;
				} catch (error) {}
				e.dataTransfer.dropEffect =
					effect === "move" || effect === "linkMove" ? "move" : "copy";
				this.$emit(exports.VTransmitEvents.DragOver, e);
			},
			handleDragEnter: function(e) {
				this.dragging = true;
				this.$emit(exports.VTransmitEvents.DragEnter, e);
			},
			handleDragLeave: function(e) {
				this.dragging = false;
				this.$emit(exports.VTransmitEvents.DragLeave, e);
			},
			handleDragEnd: function(e) {
				this.dragging = false;
				this.$emit(exports.VTransmitEvents.DragEnd, e);
			},
			handleDrop: function(e) {
				this.dragging = false;
				if (!e.dataTransfer) {
					return;
				}
				var files;
				var items;
				this.$emit(exports.VTransmitEvents.Drop, e);
				this.$emit(
					exports.VTransmitEvents.AddedFiles,
					(files = Array.from(e.dataTransfer.files))
				);
				if (!e.dataTransfer.items) {
					this.handleFiles(files);
					return;
				}
				items = Array.from(e.dataTransfer.items);
				if (
					!items ||
					!items.length ||
					!(items[0].getAsFile || items[0].webkitGetAsEntry)
				) {
					this.handleFiles(files);
					return;
				}
				this.addFilesFromItems(items);
			},
			handlePaste: function(e) {
				var cb = e.clipboardData || window.clipboardData;
				if (!e || !e.clipboardData || !e.clipboardData.items) {
					return;
				}
				this.$emit(exports.VTransmitEvents.Paste, e);
				var items = Array.from(e.clipboardData.items);
				if (items.length) {
					this.addFilesFromItems(items);
				}
			},
			handleFiles: function(files) {
				return files.map(this.addFile);
			},
			addFilesFromItems: function(items) {
				var entry;
				for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
					var item = items_1[_i];
					// Newer API on standards track
					if (item.getAsFile && item.kind == "file") {
						var file = item.getAsFile();
						if (file) {
							this.addFile(file);
						}
						continue;
					}
					// Vendor prefixed experimental API
					if (item.webkitGetAsEntry) {
						entry = item.webkitGetAsEntry();
						if (entry == null) {
							continue;
						}
						if (webkitIsFile(entry)) {
							entry.file(this.addFile, console.error);
							continue;
						}
						if (webkitIsDir(entry)) {
							this.addFilesFromDirectory(entry, entry.name);
							continue;
						}
					}
				}
			},
			addFilesFromDirectory: function(directory, path) {
				var _this = this;
				directory.createReader().readEntries(function(entries) {
					for (
						var _i = 0, entries_1 = entries;
						_i < entries_1.length;
						_i++
					) {
						var entry = entries_1[_i];
						if (entry == null) {
							continue;
						}
						if (webkitIsDir(entry)) {
							_this.addFilesFromDirectory(
								entry,
								path + "/" + entry.name
							);
							continue;
						}
						if (webkitIsFile(entry)) {
							entry.file(function(file) {
								if (
									_this.ignoreHiddenFiles &&
									file.name.charAt(0) == "."
								) {
									return;
								}
								file.fullPath = path + "/" + file.name;
								_this.addFile(file);
							}, console.error);
						}
					}
				}, console.error);
			},
		},
	});

	function resolveStaticOrDynamic$1(x, files) {
		if (is_function(x)) {
			return x(files);
		}
		return x;
	}
	(function(ParamNameStyle) {
		ParamNameStyle[(ParamNameStyle["Empty"] = 0)] = "Empty";
		ParamNameStyle[(ParamNameStyle["Indexed"] = 1)] = "Indexed";
		ParamNameStyle[(ParamNameStyle["Brackets"] = 2)] = "Brackets";
	})(exports.ParamNameStyle || (exports.ParamNameStyle = {}));
	var group_id$1 = 0;
	var XHRDriver = /** @class */ (function() {
		function XHRDriver(context, options) {
			this.uploadGroups = Object.create(null);
			var url = options.url,
				_a = options.method,
				method = _a === void 0 ? "post" : _a,
				_b = options.withCredentials,
				withCredentials = _b === void 0 ? false : _b,
				_c = options.timeout,
				timeout = _c === void 0 ? 0 : _c,
				_d = options.paramName,
				paramName = _d === void 0 ? "file" : _d,
				_e = options.multipleParamNameStyle,
				multipleParamNameStyle =
					_e === void 0 ? exports.ParamNameStyle.Empty : _e,
				_f = options.params,
				params = _f === void 0 ? Object.create(null) : _f,
				_g = options.headers,
				headers =
					_g === void 0
						? {
								Accept: "application/json",
								"Cache-Control": "no-cache",
								"X-Requested-With": "XMLHttpRequest",
						  }
						: _g,
				_h = options.responseType,
				responseType = _h === void 0 ? "json" : _h,
				responseParseFunc = options.responseParseFunc,
				_j = options.errUploadError,
				errUploadError =
					_j === void 0
						? function(xhr) {
								return (
									"Error during upload: " +
									xhr.statusText +
									" [" +
									xhr.status +
									"]"
								);
						  }
						: _j,
				_k = options.errUploadTimeout,
				errUploadTimeout =
					_k === void 0
						? function(_xhr) {
								return "Error during upload: the server timed out.";
						  }
						: _k,
				_l = options.renameFile,
				renameFile =
					_l === void 0
						? function(name) {
								return name;
						  }
						: _l;
			if (!url) {
				throw new TypeError(
					this.constructor.name +
						" requires a 'url' parameter. Supply a string or a function returning a string."
				);
			}
			this.context = context;
			this.url = url;
			this.method = method;
			this.withCredentials = withCredentials;
			this.timeout = timeout;
			this.paramName = paramName;
			this.multipleParamNameStyle = multipleParamNameStyle;
			this.params = params;
			this.headers = headers;
			this.responseType = responseType;
			this.responseParseFunc = responseParseFunc;
			this.errUploadError = errUploadError;
			this.errUploadTimeout = errUploadTimeout;
			this.renameFile = renameFile;
		}
		XHRDriver.prototype.uploadFiles = function(files) {
			var _this = this;
			return new Promise(function(resolve) {
				if (!_this.url) {
					return resolve({
						ok: false,
						err: {
							type: exports.ErrType.Any,
							message: "Missing upload URL.",
							data: _this.url,
						},
					});
				}
				var xhr = new XMLHttpRequest();
				var updateProgress = _this.handleUploadProgress(files);
				var id = group_id$1++;
				var params = resolveStaticOrDynamic$1(_this.params, files);
				var headers = resolveStaticOrDynamic$1(_this.headers, files);
				_this.uploadGroups[id] = { id: id, xhr: xhr, files: files };
				for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
					var file = files_1[_i];
					file.driverData.groupID = id;
					file.startProgress();
				}
				xhr.open(
					resolveStaticOrDynamic$1(_this.method, files),
					resolveStaticOrDynamic$1(_this.url, files),
					true
				);
				// Setting the timeout after open because of IE11 issue:
				// @link https://gitlab.com/meno/dropzone/issues/8
				xhr.timeout = resolveStaticOrDynamic$1(_this.timeout, files);
				xhr.withCredentials = resolveStaticOrDynamic$1(
					_this.withCredentials,
					files
				);
				xhr.responseType = resolveStaticOrDynamic$1(
					_this.responseType,
					files
				);
				xhr.addEventListener("error", function() {
					_this.rmGroup(id);
					resolve({
						ok: false,
						err: {
							type: exports.ErrType.Any,
							message: _this.errUploadError(xhr),
							data: xhr,
						},
					});
				});
				xhr.upload.addEventListener("progress", updateProgress);
				xhr.addEventListener("timeout", function() {
					_this.rmGroup(id);
					resolve({
						ok: false,
						err: {
							type: exports.ErrType.Timeout,
							message: _this.errUploadTimeout(xhr),
							data: xhr,
						},
					});
				});
				xhr.addEventListener("load", function() {
					if (
						files[0].status === exports.UploadStatuses.Canceled ||
						xhr.readyState !== XMLHttpRequest.DONE
					) {
						return;
					}
					// The XHR is complete, so remove the group
					_this.rmGroup(id);
					var response;
					if (_this.responseParseFunc) {
						response = _this.responseParseFunc(xhr);
					} else {
						response = xhr.response;
						if (!xhr.responseType) {
							var contentType = xhr.getResponseHeader("content-type");
							if (
								contentType &&
								contentType.indexOf("application/json") > -1
							) {
								try {
									response = JSON.parse(xhr.responseText);
								} catch (err) {
									return resolve({
										ok: false,
										err: {
											message: "Invalid JSON response from server.",
											type: exports.ErrType.Any,
											data: err,
										},
									});
								}
							}
						}
					}
					// Called on load (complete) to complete progress tracking logic.
					updateProgress();
					if (xhr.status < 200 || xhr.status >= 300) {
						return resolve({
							ok: false,
							err: {
								type: exports.ErrType.Any,
								message: _this.errUploadError(xhr),
								data: xhr,
							},
						});
					}
					return resolve({
						ok: true,
						data: response,
					});
				});
				for (var _a = 0, _b = Object.keys(headers); _a < _b.length; _a++) {
					var headerName = _b[_a];
					if (headers[headerName]) {
						xhr.setRequestHeader(headerName, headers[headerName]);
					}
				}
				var formData = new FormData();
				for (var _c = 0, _d = Object.keys(params); _c < _d.length; _c++) {
					var key = _d[_c];
					formData.append(key, params[key]);
				}
				for (var _e = 0, files_2 = files; _e < files_2.length; _e++) {
					var file = files_2[_e];
					_this.context.emit(
						exports.VTransmitEvents.Sending,
						file,
						xhr,
						formData
					);
				}
				if (_this.context.props.uploadMultiple) {
					_this.context.emit(
						exports.VTransmitEvents.SendingMultiple,
						files,
						xhr,
						formData
					);
				}
				for (var i = 0, len = files.length; i < len; i++) {
					formData.append(
						_this.getParamName(files[i], i),
						files[i].nativeFile,
						_this.renameFile(files[i].name)
					);
				}
				xhr.send(formData);
			});
		};
		XHRDriver.prototype.handleUploadProgress = function(files) {
			var vm = this.context.vtransmit;
			return function onProgressFn(e) {
				if (!e) {
					var allFilesFinished = true;
					for (var _i = 0, files_3 = files; _i < files_3.length; _i++) {
						var file = files_3[_i];
						if (
							file.upload.progress !== 100 ||
							file.upload.bytesSent !== file.upload.total
						) {
							allFilesFinished = false;
						}
						file.upload.progress = 100;
						file.upload.bytesSent = file.upload.total;
						file.endProgress();
					}
					if (allFilesFinished) {
						return;
					}
				}
				for (var _a = 0, files_4 = files; _a < files_4.length; _a++) {
					var file = files_4[_a];
					if (e) {
						file.handleProgress(e);
					}
					vm.$emit(
						exports.VTransmitEvents.UploadProgress,
						file,
						file.upload.progress,
						file.upload.bytesSent
					);
				}
			};
		};
		XHRDriver.prototype.getParamName = function(file, index) {
			var paramName;
			if (is_function(this.paramName)) {
				paramName = this.paramName(file);
			} else {
				paramName = this.paramName;
			}
			if (!this.context.props.uploadMultiple) {
				return paramName;
			}
			switch (this.multipleParamNameStyle) {
				case exports.ParamNameStyle.Indexed:
					paramName += "[" + index + "]";
					break;
				case exports.ParamNameStyle.Brackets:
					paramName += "[]";
					break;
				case exports.ParamNameStyle.Empty:
				default:
					break;
			}
			return paramName;
		};
		XHRDriver.prototype.cancelUpload = function(file) {
			var group = this.uploadGroups[file.driverData.groupID];
			if (!group) {
				return [];
			}
			group.xhr.abort();
			this.rmGroup(file.driverData.groupID);
			return group.files.slice();
		};
		XHRDriver.prototype.rmGroup = function(id) {
			delete this.uploadGroups[id];
		};
		return XHRDriver;
	})();

	var VueTransmitPlugin = {
		install: function(Vue$$1) {
			Vue$$1.component("VueTransmit", VueTransmit);
		},
		name: "vue-transmit",
	};

	exports.VueTransmit = VueTransmit;
	exports.VueTransmitPlugin = VueTransmitPlugin;
	exports.AxiosDriver = AxiosDriver;
	exports.XHRDriver = XHRDriver;

	Object.defineProperty(exports, "__esModule", { value: true });
});
//# sourceMappingURL=vue-transmit.js.map
