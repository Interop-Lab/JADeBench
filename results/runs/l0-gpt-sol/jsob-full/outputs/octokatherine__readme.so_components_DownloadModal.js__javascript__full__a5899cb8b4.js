const { Dialog, Transition } = require("@headlessui/react");

const DownloadModal = ({ showModal, setShowModal }) => (
  React.createElement(
    Transition,
    {
      show: showModal,
      as: "div",
      className: "relative z-10",
      onClose: () => setShowModal(false)
    },
    React.createElement(
      Dialog,
      {
        className: "relative z-10",
        onClose: () => setShowModal(false)
      },
      React.createElement(
        Transition.Child,
        {
          enter: "ease-out duration-300",
          enterFrom: "opacity-0",
          enterTo: "opacity-100",
          leave: "ease-in duration-200",
          leaveFrom: "opacity-100",
          leaveTo: "opacity-0"
        },
        React.createElement("div", {
          className: "fixed inset-0 bg-black/30"
        })
      ),
      React.createElement(
        Transition.Child,
        {
          enter: "ease-out duration-300",
          enterFrom: "opacity-0 scale-95",
          enterTo: "opacity-100 scale-100",
          leave: "ease-in duration-200",
          leaveFrom: "opacity-100 scale-100",
          leaveTo: "opacity-0 scale-95"
        },
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
              Dialog.Panel,
              {
                className: "w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
              },
              React.createElement(
                "div",
                {
                  className: "text-center"
                },
                React.createElement(
                  "p",
                  {
                    className: "text-4xl"
                  },
                  "🎉"
                ),
                React.createElement(
                  Dialog.Title,
                  {
                    as: "h3",
                    className: "text-lg font-medium leading-6 text-gray-900"
                  },
                  "Download started!"
                ),
                React.createElement(
                  Dialog.Description,
                  {
                    className: "mt-2"
                  },
                  React.createElement(
                    "p",
                    {
                      className: "text-sm text-gray-500"
                    },
                    "Your download should begin shortly. If it does not, ",
                    React.createElement(
                      "a",
                      {
                        href: "#",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "font-medium text-blue-600 hover:text-blue-500"
                      },
                      "click here"
                    ),
                    "."
                  ),
                  React.createElement(
                    "p",
                    {
                      className: "mt-2 text-sm text-gray-500"
                    },
                    "Thank you for using our service!"
                  )
                )
              ),
              React.createElement(
                "div",
                {
                  className: "mt-4 text-center"
                },
                React.createElement(
                  "a",
                  {
                    href: "#",
                    target: "_blank",
                    rel: "noopener noreferrer"
                  },
                  React.createElement("img", {
                    src: "#",
                    alt: "Download"
                  })
                )
              )
            )
          )
        )
      )
    )
  )
);

module.exports = {
  default: DownloadModal
};
