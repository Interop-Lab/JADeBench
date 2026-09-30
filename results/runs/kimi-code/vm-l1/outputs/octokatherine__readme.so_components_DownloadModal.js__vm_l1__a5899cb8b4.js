const {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} = require("@headlessui/react");

function DownloadModal({ showModal, setShowModal }) {
  return React.createElement(
    Transition,
    { show: showModal },
    React.createElement(
      Dialog,
      {
        as: "div",
        className: "fixed inset-0 z-10 overflow-y-auto",
        onClose: () => setShowModal(false),
      },
      React.createElement(
        "div",
        {
          className:
            "flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0",
        },
        React.createElement(
          TransitionChild,
          {
            enter: "ease-out duration-300",
            enterFrom: "opacity-0",
            enterTo: "opacity-100",
            leave: "ease-in duration-200",
            leaveFrom: "opacity-100",
            leaveTo: "opacity-0",
          },
          React.createElement(DialogBackdrop, {
            className:
              "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
          }),
        ),
        React.createElement(
          "span",
          {
            className: "hidden sm:inline-block sm:align-middle sm:h-screen",
            "aria-hidden": "true",
          },
          "​",
        ),
        React.createElement(
          TransitionChild,
          {
            enter: "ease-out duration-300",
            enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
            enterTo: "opacity-100 translate-y-0 sm:scale-100",
            leave: "ease-in duration-200",
            leaveFrom: "opacity-100 translate-y-0 sm:scale-100",
            leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
          },
          React.createElement(
            DialogPanel,
            {
              className:
                "inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6",
            },
            React.createElement(
              "div",
              null,
              React.createElement(
                "p",
                { className: "text-center text-7xl" },
                "🎉",
              ),
              React.createElement(
                "div",
                { className: "mt-3 text-center sm:mt-5" },
                React.createElement(
                  DialogTitle,
                  {
                    as: "h3",
                    className: "text-lg font-medium leading-6 text-gray-900",
                  },
                  "Readme Generated!",
                ),
                React.createElement(
                  "div",
                  { className: "mt-2" },
                  React.createElement(
                    "p",
                    { className: "text-sm text-gray-500" },
                    "Thanks for using readme.so! Feel free to reach out to me on",
                    " ",
                    React.createElement(
                      "a",
                      {
                        href: "https://twitter.com/katherinecodes",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "text-emerald-500 hover:text-emerald-400",
                      },
                      "Twitter",
                    ),
                    " ",
                    "with any feedback.",
                  ),
                  React.createElement(
                    "p",
                    { className: "mt-3 text-sm text-gray-500" },
                    "If you found this product helpful, consider supporting me!",
                  ),
                ),
              ),
            ),
            React.createElement(
              "div",
              { className: "flex justify-center mx-auto mt-5 sm:mt-6" },
              React.createElement(
                "a",
                {
                  href: "https://www.buymeacoffee.com/katherinecodes",
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                React.createElement("img", {
                  src: "https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=katherinecodes&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff",
                  alt: "Buy me a coffee",
                }),
              ),
            ),
          ),
        ),
      ),
    ),
  );
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "DownloadModal", {
  enumerable: true,
  get: () => DownloadModal,
});
