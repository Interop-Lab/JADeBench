var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __export = (target, definitions) => {
  for (var name in definitions) {
    __defProp(target, name, {
      get: definitions[name],
      enumerable: true
    });
  }
};

var __copyProps = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (const name of __getOwnPropNames(source)) {
      if (!__hasOwnProp.call(target, name) && name !== except) {
        __defProp(target, name, {
          get: () => source[name],
          enumerable: !(descriptor = __getOwnPropDesc(source, name)) || descriptor.enumerable
        });
      }
    }
  }
  return target;
};

var __toCommonJS = module => __copyProps(
  __defProp({}, "__esModule", { value: true }),
  module
);

var DownloadModal_exports = {};
__export(DownloadModal_exports, {
  DownloadModal: () => DownloadModal
});
module.exports = __toCommonJS(DownloadModal_exports);

var import_react = require("@headlessui/react");

var DownloadModal = props => {
  const {
    isOpen,
    open,
    show,
    closeModal,
    onClose,
    setIsOpen,
    handleDownload,
    onDownload,
    children
  } = props;

  const visible = isOpen !== undefined ? isOpen : open !== undefined ? open : show;
  const close = closeModal || onClose || (setIsOpen ? () => setIsOpen(false) : () => {});
  const download = handleDownload || onDownload;

  return React.createElement(
    import_react.Transition,
    {
      appear: true,
      show: !!visible,
      as: React.Fragment
    },
    React.createElement(
      import_react.Dialog,
      {
        as: "div",
        className: "relative z-10",
        onClose: close
      },
      React.createElement(
        import_react.Transition.Child,
        {
          as: React.Fragment,
          enter: "ease-out duration-300",
          enterFrom: "opacity-0",
          enterTo: "opacity-100",
          leave: "ease-in duration-200",
          leaveFrom: "opacity-100",
          leaveTo: "opacity-0"
        },
        React.createElement("div", {
          className: "fixed inset-0 bg-black/25"
        })
      ),
      React.createElement(
        "div",
        {
          className: "fixed inset-0 overflow-y-auto"
        },
        React.createElement(
          "div",
          {
            className: "flex min-h-full items-center justify-center p-4 text-center"
          },
          React.createElement(
            import_react.Transition.Child,
            {
              as: React.Fragment,
              enter: "ease-out duration-300",
              enterFrom: "opacity-0 scale-95",
              enterTo: "opacity-100 scale-100",
              leave: "ease-in duration-200",
              leaveFrom: "opacity-100 scale-100",
              leaveTo: "opacity-0 scale-95"
            },
            React.createElement(
              import_react.Dialog.Panel,
              {
                className: "w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              },
              React.createElement(
                import_react.Dialog.Title,
                {
                  as: "h3",
                  className: "text-lg font-medium leading-6 text-gray-900"
                },
                "Download"
              ),
              children && React.createElement(
                "div",
                { className: "mt-2" },
                children
              ),
              React.createElement(
                "div",
                {
                  className: "mt-4 flex justify-end gap-2"
                },
                React.createElement(
                  "button",
                  {
                    type: "button",
                    onClick: close
                  },
                  "Cancel"
                ),
                React.createElement(
                  "button",
                  {
                    type: "button",
                    onClick: download
                  },
                  "Download"
                )
              )
            )
          )
        )
      )
    )
  );
};
