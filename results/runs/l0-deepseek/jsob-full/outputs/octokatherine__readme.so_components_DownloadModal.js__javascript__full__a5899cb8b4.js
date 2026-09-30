const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;

const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};

const __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

const DownloadModal_exports = {};
__export(DownloadModal_exports, {
  DownloadModal: () => DownloadModal
});
module.exports = __toCommonJS(DownloadModal_exports);

const import_react = require("react");

const DownloadModal = ({ showModal, setShowModal }) => {
  const styles = {
    modalOverlay: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50",
    modalContainer: "bg-white rounded-lg shadow-xl w-full max-w-md mx-4",
    modalHeader: "flex items-center justify-between px-6 py-4 border-b border-gray-200",
    modalTitle: "text-lg font-semibold text-gray-900",
    closeButton: "text-gray-400 hover:text-gray-600",
    modalBody: "px-6 py-4",
    modalFooter: "flex justify-end space-x-3 px-6 py-4 border-t border-gray-200",
    primaryButton: "inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
    secondaryButton: "inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300",
    emoji: "text-4xl",
    title: "text-xl font-bold text-gray-900",
    description: "text-sm text-gray-600",
    link: "text-blue-600 hover:text-blue-800 underline",
    image: "w-full h-auto rounded-lg",
    imageLink: "block mt-4"
  };

  return React.createElement(
    import_react.Transition,
    { show: showModal, as: "div", className: styles.modalOverlay, onClose: () => setShowModal(false) },
    React.createElement(
      "div",
      { className: styles.modalContainer },
      React.createElement(
        import_react.Transition,
        {
          enter: "transition ease-out duration-300",
          enterFrom: "opacity-0 translate-y-4",
          enterTo: "opacity-100 translate-y-0",
          leave: "transition ease-in duration-200",
          leaveFrom: "opacity-100 translate-y-0",
          leaveTo: "opacity-0 translate-y-4"
        },
        React.createElement(import_react.Dialog, { className: styles.modalHeader })
      ),
      React.createElement("div", { className: styles.modalBody, "aria-hidden": "true" }, "\u200B"),
      React.createElement(
        import_react.Transition,
        {
          enter: "transition ease-out duration-300",
          enterFrom: "opacity-0 translate-y-4",
          enterTo: "opacity-100 translate-y-0",
          leave: "transition ease-in duration-200",
          leaveFrom: "opacity-100 translate-y-0",
          leaveTo: "opacity-0 translate-y-4"
        },
        React.createElement(
          import_react.Dialog,
          { className: styles.modalFooter },
          React.createElement(
            "div",
            null,
            React.createElement("p", { className: styles.emoji }, "\u{1F389}"),
            React.createElement(
              "div",
              { className: styles.title },
              React.createElement(import_react.Dialog, { as: "h3", className: styles.modalTitle }, styles.modalTitle)
            ),
            React.createElement(
              "div",
              { className: styles.description },
              React.createElement("p", { className: styles.modalBody }, styles.description, " ", React.createElement("a", {
                href: styles.link,
                target: "_blank",
                rel: "noopener noreferrer",
                className: styles.link
              }, styles.link), " ", styles.description)
            ),
            React.createElement("p", { className: styles.modalBody }, styles.description)
          )
        )
      ),
      React.createElement(
        "div",
        { className: styles.modalFooter },
        React.createElement("a", { href: styles.link, target: "_blank", rel: "noopener noreferrer" }, React.createElement("img", {
          src: styles.image,
          alt: styles.image
        }))
      )
    )
  );
};

module.exports = { DownloadModal };
