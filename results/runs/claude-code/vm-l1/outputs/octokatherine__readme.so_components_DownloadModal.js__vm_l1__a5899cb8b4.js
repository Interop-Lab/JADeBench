const HeadlessUI = require("@headlessui/react");

const createElement = React.createElement;

const DownloadModal = ({ showModal, setShowModal }) =>
  createElement(
    HeadlessUI.Transition,
    { show: showModal },
    createElement(
      HeadlessUI.Dialog,
      {
        as: "div",
        className: "fixed inset-0 z-10 overflow-y-auto",
        onClose: () => setShowModal(false),
      },
      createElement(
        "div",
        {
          className:
            "flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0",
        },
        createElement(
          HeadlessUI.TransitionChild,
          {
            enter: "ease-out duration-300",
            enterFrom: "opacity-0",
            enterTo: "opacity-100",
            leave: "ease-in duration-200",
            leaveFrom: "opacity-100",
            leaveTo: "opacity-0",
          },
          createElement(HeadlessUI.DialogBackdrop, {
            className:
              "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
          }),
        ),
        createElement(
          "span",
          {
            className: "hidden sm:inline-block sm:align-middle sm:h-screen",
            "aria-hidden": "true",
          },
          "​",
        ),
        createElement(
          HeadlessUI.TransitionChild,
          {
            enter: "ease-out duration-300",
            enterFrom:
              "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
            enterTo: "opacity-100 translate-y-0 sm:scale-100",
            leave: "ease-in duration-200",
            leaveFrom: "opacity-100 translate-y-0 sm:scale-100",
            leaveTo:
              "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
          },
          createElement(
            HeadlessUI.DialogPanel,
            {
              className:
                "inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6",
            },
            createElement(
              "div",
              null,
              createElement("p", { className: "text-center text-7xl" }, "🎉"),
              createElement(
                "div",
                { className: "mt-3 text-center sm:mt-5" },
                createElement(
                  HeadlessUI.DialogTitle,
                  {
                    as: "h3",
                    className: "text-lg font-medium leading-6 text-gray-900",
                  },
                  "Readme Generated!",
                ),
                createElement(
                  "div",
                  { className: "mt-2" },
                  createElement(
                    "p",
                    { className: "text-sm text-gray-500" },
                    "Thanks for using readme.so! Feel free to reach out to me on",
                    " ",
                    createElement(
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
                  createElement(
                    "p",
                    { className: "mt-3 text-sm text-gray-500" },
                    "If you found this product helpful, consider supporting me!",
                  ),
                ),
              ),
            ),
            createElement(
              "div",
              { className: "flex justify-center mx-auto mt-5 sm:mt-6" },
              createElement(
                "a",
                {
                  href: "https://www.buymeacoffee.com/katherinecodes",
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                createElement("img", {
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

Object.defineProperty(module.exports, "__esModule", { value: true });
Object.defineProperty(module.exports, "DownloadModal", {
  enumerable: true,
  get: () => DownloadModal,
});
