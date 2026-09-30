var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, source) => {
  for (var key in source)
    __defProp(target, key, { get: source[key], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var DownloadModal_exports = {};
__export(DownloadModal_exports, {
  default: () => DownloadModal
});
module.exports = __toCommonJS(DownloadModal_exports);

var import_react = require("react");

var DownloadModal = ({ showModal, setShowModal }) => {
  const styles = {
    overlay: "fixed inset-0 z-50 overflow-y-auto",
    backdrop: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
    backdropEnter: "ease-out duration-300",
    backdropEnterFrom: "opacity-0",
    backdropEnterTo: "opacity-100",
    backdropLeave: "ease-in duration-200",
    backdropLeaveFrom: "opacity-100",
    backdropLeaveTo: "opacity-0",
    panelWrapper: "flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0",
    panelEnter: "ease-out duration-300",
    panelEnterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
    panelEnterTo: "opacity-100 translate-y-0 sm:scale-100",
    panelLeave: "ease-in duration-200",
    panelLeaveFrom: "opacity-100 translate-y-0 sm:scale-100",
    panelLeaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
    panel: "relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6",
    closeIconWrapper: "absolute right-0 top-0 hidden pr-4 pt-4 sm:block",
    closeButton: "rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
    closeIcon: "h-6 w-6",
    contentWrapper: "mt-3 text-center sm:mt-5",
    emoji: "text-6xl",
    title: "mt-2",
    titleText: "text-lg font-medium leading-6 text-gray-900",
    body: "mt-2",
    bodyText: "text-sm text-gray-500",
    link: "font-medium text-indigo-600 hover:text-indigo-500",
    downloadButtonWrapper: "mt-5 sm:mt-6",
    downloadButton: "inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
    downloadIcon: "mr-2 h-5 w-5",
    downloadIconSrc: "https://github.com/microsoft/vscode-pull-request-github/raw/main/assets/download.png",
    downloadIconAlt: "Download icon",
    repoUrl: "https://github.com/yourusername/yourrepo/releases/latest",
    targetBlank: "_blank",
    relNoopener: "noopener noreferrer",
    titleContent: "Download the Extension!",
    bodyContent: "Get the latest version of our extension from the GitHub releases page.",
    linkText: "Click here to visit the releases page.",
    downloadText: "Download Now",
    ariaHidden: "true"
  };

  return React.createElement(
    import_react.Fragment,
    { showModal },
    React.createElement(
      import_react.Dialog,
      { as: "div", className: styles.overlay, onClose: () => setShowModal(false) },
      React.createElement(
        styles.Child,
        { className: styles.backdrop },
        React.createElement(
          import_react.Transition,
          {
            enter: styles.backdropEnter,
            enterFrom: styles.backdropEnterFrom,
            enterTo: styles.backdropEnterTo,
            leave: styles.backdropLeave,
            leaveFrom: styles.backdropLeaveFrom,
            leaveTo: styles.backdropLeaveTo
          },
          React.createElement(import_react.TransitionChild, { className: styles.panelWrapper })
        ),
        React.createElement(
          styles.Child,
          { className: styles.closeIconWrapper, "aria-hidden": styles.ariaHidden },
          "\u200B"
        ),
        React.createElement(
          import_react.Transition,
          {
            enter: styles.panelEnter,
            enterFrom: styles.panelEnterFrom,
            enterTo: styles.panelEnterTo,
            leave: styles.panelLeave,
            leaveFrom: styles.panelLeaveFrom,
            leaveTo: styles.panelLeaveTo
          },
          React.createElement(
            import_react.DialogPanel,
            { className: styles.panel },
            React.createElement(
              styles.Child,
              null,
              React.createElement("p", { className: styles.emoji }, "\u{1F389}"),
              React.createElement(
                styles.Child,
                { className: styles.title },
                React.createElement(
                  import_react.DialogTitle,
                  { as: "h3", className: styles.titleText },
                  styles.titleContent
                ),
                React.createElement(
                  styles.Child,
                  { className: styles.body },
                  React.createElement(
                    "p",
                    { className: styles.bodyText },
                    styles.bodyContent,
                    " ",
                    React.createElement(
                      "a",
                      {
                        href: styles.repoUrl,
                        target: styles.targetBlank,
                        rel: styles.relNoopener,
                        className: styles.link
                      },
                      styles.linkText
                    ),
                    " ",
                    styles.downloadText
                  ),
                  React.createElement("p", { className: styles.bodyText }, styles.downloadText)
                )
              )
            ),
            React.createElement(
              styles.Child,
              { className: styles.downloadButtonWrapper },
              React.createElement(
                "a",
                {
                  href: styles.repoUrl,
                  target: styles.targetBlank,
                  rel: styles.relNoopener
                },
                React.createElement(
                  styles.Child,
                  {
                    src: styles.downloadIconSrc,
                    alt: styles.downloadIconAlt
                  }
                )
              )
            )
          )
        )
      )
    )
  );
};
